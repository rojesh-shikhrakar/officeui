<!-- Project Roadmap – tasks on a timeline. Customise it into a Gantt chart: zoom, group rows by status or assignee, colour bars by status, assignee or priority, and toggle the today line and bar dates. -->
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
		today = '2026-11-10',
		onopen
	}: {
		tasks?: ProjectTask[];
		/** The "today" line (ISO date) */ today?: string;
		onopen?: (id: string) => void;
	} = $props();
	const ZOOM = { Week: 28, Month: 14, Quarter: 6 } as const;
	type Zoom = keyof typeof ZOOM;
	let zoom = $state<Zoom>('Month');
	let group = $state<'None' | 'Status' | 'Assignee'>('None');
	let color = $state<'Status' | 'Assignee' | 'Priority'>('Status');
	let showToday = $state(true);
	let showDates = $state(false);
	const px = $derived(ZOOM[zoom]);
	const from = $derived(Math.min(...tasks.map((t) => toDay(t.start)), toDay(today)) - 2);
	const to = $derived(Math.max(...tasks.map((t) => toDay(t.end)), toDay(today)) + 4);
	const step = $derived(px >= 10 ? 7 : 14);
	const ticks = $derived(
		Array.from({ length: Math.ceil((to - from) / step) }, (_, i) => from + i * step)
	);
	const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
	const PRIO: Record<string, string> = { Low: '#9ca3af', Medium: '#f59e0b', High: '#ef4444' };
	const people = $derived([...new Set(tasks.map((t) => t.assignee))]);
	const fill = (t: ProjectTask) =>
		color === 'Status'
			? STATUS_COLOR[t.status]
			: color === 'Priority'
				? PRIO[t.priority]
				: PALETTE[people.indexOf(t.assignee) % PALETTE.length];
	const groups = $derived(
		group === 'None'
			? [{ name: '', rows: tasks.toSorted((a, b) => toDay(a.start) - toDay(b.start)) }]
			: (group === 'Status' ? STATUSES : people)
					.map((name) => ({
						name,
						rows: tasks
							.filter((t) => (group === 'Status' ? t.status : t.assignee) === name)
							.toSorted((a, b) => toDay(a.start) - toDay(b.start))
					}))
					.filter((g) => g.rows.length)
	);
</script>

<div class="ui-pr">
	<div class="ui-pr__bar">
		<div class="ui-ag-tabs" role="group" aria-label="Zoom">
			{#each Object.keys(ZOOM) as z (z)}<button
					class="ui-ag-tab"
					aria-pressed={zoom === z}
					onclick={() => (zoom = z as Zoom)}>{z}</button
				>{/each}
		</div>
		<label
			>Group <select class="ui-ag-input" bind:value={group}
				><option>None</option><option>Status</option><option>Assignee</option></select
			></label
		>
		<label
			>Colour <select class="ui-ag-input" bind:value={color}
				><option>Status</option><option>Assignee</option><option>Priority</option></select
			></label
		>
		<label><input type="checkbox" bind:checked={showToday} /> Today</label>
		<label><input type="checkbox" bind:checked={showDates} /> Dates</label>
	</div>
	<div class="ui-pr__scroll">
		<div class="ui-pr__grid" style:--px="{px}px" style:width="{180 + (to - from) * px}px">
			<div class="ui-pr__head">
				<span class="ui-pr__name"></span><span class="ui-pr__ticks"
					>{#each ticks as d (d)}<small style:left="{(d - from) * px}px">{fmtDay(fromDay(d))}</small
						>{/each}</span
				>
			</div>
			{#each groups as g (g.name)}
				{#if g.name}<div class="ui-pr__group">{g.name}</div>{/if}
				{#each g.rows as t (t.id)}
					<div class="ui-pr__row">
						<span class="ui-pr__name"
							><button onclick={() => onopen?.(t.id)}>{t.title}</button></span
						>
						<span class="ui-pr__lane">
							{#if showToday}<i
									class="ui-pr__today"
									style:left="{(toDay(today) - from) * px}px"
									aria-hidden="true"
								></i>{/if}
							<button
								class="ui-pr__bar-item"
								style:left="{(toDay(t.start) - from) * px}px"
								style:width="{Math.max(1, toDay(t.end) - toDay(t.start) + 1) * px}px"
								style:background={fill(t)}
								aria-label="{t.title}, {fmtDay(t.start)} to {fmtDay(t.end)}"
								title="{t.title}: {fmtDay(t.start)} – {fmtDay(t.end)}"
								onclick={() => onopen?.(t.id)}
								>{#if showDates}{fmtDay(t.start)} – {fmtDay(t.end)}{:else}{t.id}{/if}</button
							>
						</span>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>

<style>
	.ui-pr__bar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		padding: 8px 12px;
	}
	.ui-pr__bar label {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--ag-muted);
	}
	.ui-pr__scroll {
		overflow-x: auto;
		border-top: 1px solid var(--ag-line);
	}
	.ui-pr__grid {
		min-width: 100%;
	}
	.ui-pr__head,
	.ui-pr__row {
		display: flex;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-pr__name {
		flex: none;
		width: 180px;
		padding: 6px 10px;
		box-sizing: border-box;
		position: sticky;
		left: 0;
		z-index: 2;
		background: var(--ag-surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-pr__name button {
		all: unset;
		cursor: pointer;
	}
	.ui-pr__name button:hover {
		text-decoration: underline;
	}
	.ui-pr__ticks,
	.ui-pr__lane {
		position: relative;
		flex: 1;
		min-height: 28px;
	}
	.ui-pr__ticks small {
		position: absolute;
		top: 8px;
		padding-left: 4px;
		border-left: 1px solid var(--ag-line);
		color: var(--ag-muted);
		white-space: nowrap;
	}
	.ui-pr__group {
		position: sticky;
		left: 0;
		padding: 5px 10px;
		font-weight: 500;
		background: var(--ag-fill);
	}
	.ui-pr__lane {
		background-image: linear-gradient(to right, var(--ag-line) 1px, transparent 1px);
		background-size: calc(var(--px) * 7) 100%;
	}
	.ui-pr__bar-item {
		position: absolute;
		top: 5px;
		height: 18px;
		border: 0;
		border-radius: 5px;
		padding: 0 6px;
		font: inherit;
		font-size: 10px;
		color: #fff;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		cursor: pointer;
	}
	.ui-pr__bar-item:focus-visible {
		outline: 2px solid var(--ag-ink);
		outline-offset: 1px;
	}
	.ui-pr__today {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--ag-red);
		z-index: 1;
		pointer-events: none;
	}
</style>
