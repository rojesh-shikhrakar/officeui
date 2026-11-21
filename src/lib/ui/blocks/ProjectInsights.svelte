<!-- Project Insights – how a project is going: completion, burn-up and burn-down charts, work by status and by assignee. -->
<script lang="ts">
	import {
		PROJECTS,
		STATUSES,
		STATUS_COLOR,
		fmtDay,
		fromDay,
		toDay,
		type ProjectTask
	} from './projects';
	import '../agents/agents.css';
	let {
		tasks = PROJECTS[0].tasks,
		today = '2026-11-10'
	}: { tasks?: ProjectTask[]; /** Actuals are drawn up to this date (ISO) */ today?: string } =
		$props();
	const W = 320;
	const H = 120;
	const total = $derived(tasks.length);
	const done = $derived(tasks.filter((t) => t.status === 'Done').length);
	const pct = $derived(total ? Math.round((done / total) * 100) : 0);
	const from = $derived(total ? Math.min(...tasks.map((t) => toDay(t.start))) : toDay(today));
	const to = $derived(
		Math.max(total ? Math.max(...tasks.map((t) => toDay(t.end))) : 0, toDay(today), from + 1)
	);
	const days = $derived(Array.from({ length: to - from + 1 }, (_, i) => from + i));
	const doneBy = (d: number) => tasks.filter((t) => t.doneAt && toDay(t.doneAt) <= d).length;
	const actual = $derived(days.filter((d) => d <= toDay(today)).map((d) => doneBy(d)));
	const x = (i: number) => (i / (days.length - 1)) * W;
	const y = (v: number) => H - (total ? (v / total) * (H - 8) : 0) - 4;
	const line = (vals: number[], f: (v: number) => number = (v) => v) =>
		vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(f(v)).toFixed(1)}`).join(' ');
	const ideal = $derived(days.map((_, i) => (total * i) / (days.length - 1)));
	const overdue = $derived(
		tasks.filter((t) => t.status !== 'Done' && toDay(t.end) < toDay(today)).length
	);
	const people = $derived([...new Set(tasks.map((t) => t.assignee))]);
	const velocity = $derived(
		Math.round((done / Math.max(1, Math.min(toDay(today), to) - from + 1)) * 7 * 10) / 10
	);
	const C = 2 * Math.PI * 15;
</script>

<div class="ui-pi">
	<div class="ui-pi__stats">
		<div class="ui-ag-card ui-pi__ring">
			<svg viewBox="0 0 36 36" role="img" aria-label="{pct}% complete"
				><circle cx="18" cy="18" r="15" /><circle
					cx="18"
					cy="18"
					r="15"
					class="arc"
					stroke-dasharray={C}
					stroke-dashoffset={C * (1 - pct / 100)}
				/></svg
			><b>{pct}%</b><small class="ui-ag-muted">{done} of {total} done</small>
		</div>
		<div class="ui-ag-card"><small class="ui-ag-muted">Open</small><b>{total - done}</b></div>
		<div class="ui-ag-card">
			<small class="ui-ag-muted">Overdue</small><b
				style:color={overdue ? 'var(--ag-red)' : undefined}>{overdue}</b
			>
		</div>
		<div class="ui-ag-card">
			<small class="ui-ag-muted">Velocity</small><b>{velocity}<small> / week</small></b>
		</div>
	</div>
	<div class="ui-pi__charts">
		<figure class="ui-ag-card">
			<figcaption>
				<b>Burn-up</b><small class="ui-ag-muted">completed vs. total scope</small>
			</figcaption>
			<svg
				viewBox="0 0 {W} {H}"
				role="img"
				aria-label="Burn-up chart: {done} of {total} tasks completed"
				><path d="M0,{y(total)} H{W}" class="scope" /><path d={line(actual)} class="done" /></svg
			>
			<div class="ui-pi__axis">
				<small>{fmtDay(fromDay(from))}</small><small>{fmtDay(fromDay(to))}</small>
			</div>
		</figure>
		<figure class="ui-ag-card">
			<figcaption>
				<b>Burn-down</b><small class="ui-ag-muted">remaining vs. ideal</small>
			</figcaption>
			<svg
				viewBox="0 0 {W} {H}"
				role="img"
				aria-label="Burn-down chart: {total - done} tasks remaining"
				><path d={line(ideal, (v) => total - v)} class="ideal" /><path
					d={line(actual, (v) => total - v)}
					class="done"
				/></svg
			>
			<div class="ui-pi__axis">
				<small>{fmtDay(fromDay(from))}</small><small>{fmtDay(fromDay(to))}</small>
			</div>
		</figure>
		<figure class="ui-ag-card">
			<figcaption><b>By status</b></figcaption>
			{#each STATUSES as s (s)}
				{@const n = tasks.filter((t) => t.status === s).length}
				<div class="ui-pi__bar">
					<span>{s}</span><span class="ui-ag-bar"
						><i style:width="{total ? (n / total) * 100 : 0}%" style:background={STATUS_COLOR[s]}
						></i></span
					><small>{n}</small>
				</div>
			{/each}
		</figure>
		<figure class="ui-ag-card">
			<figcaption><b>By assignee</b></figcaption>
			{#each people as p (p)}
				{@const mine = tasks.filter((t) => t.assignee === p)}
				<div class="ui-pi__bar">
					<span>{p}</span><span class="ui-ag-bar"
						><i
							style:width="{(mine.filter((t) => t.status === 'Done').length / mine.length) * 100}%"
						></i></span
					><small>{mine.filter((t) => t.status === 'Done').length}/{mine.length}</small>
				</div>
			{/each}
		</figure>
	</div>
</div>

<style>
	.ui-pi {
		display: grid;
		gap: 10px;
		padding: 12px;
	}
	.ui-pi__stats,
	.ui-pi__charts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 10px;
	}
	.ui-pi__stats > :global(div) {
		display: grid;
		gap: 2px;
		padding: 10px;
		align-content: center;
	}
	.ui-pi__stats b {
		font-size: 20px;
		font-weight: 500;
	}
	.ui-pi__ring {
		grid-template-columns: 44px 1fr;
		column-gap: 10px;
		position: relative;
	}
	.ui-pi__ring svg {
		grid-row: span 2;
		width: 44px;
		transform: rotate(-90deg);
		fill: none;
		stroke: var(--ag-line);
		stroke-width: 4;
	}
	.ui-pi__ring .arc {
		stroke: var(--ag-green);
		stroke-linecap: round;
	}
	figure {
		margin: 0;
		padding: 10px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	figcaption {
		display: flex;
		gap: 8px;
		align-items: baseline;
	}
	figure svg {
		width: 100%;
		fill: none;
		stroke-width: 2;
		overflow: visible;
	}
	.done {
		stroke: var(--ag-blue);
	}
	.scope,
	.ideal {
		stroke: var(--ag-muted);
		stroke-dasharray: 4 3;
		stroke-width: 1.5;
	}
	.ui-pi__axis {
		display: flex;
		justify-content: space-between;
		color: var(--ag-muted);
	}
	.ui-pi__bar {
		display: grid;
		grid-template-columns: 80px 1fr 32px;
		align-items: center;
		gap: 8px;
	}
	.ui-pi__bar small {
		text-align: right;
		color: var(--ag-muted);
	}
</style>
