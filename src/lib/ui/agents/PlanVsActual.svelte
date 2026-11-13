<!-- Plan vs Actual – a Gantt of an agent run: dashed planned bars, filled actual bars, over-plan in amber, a playhead, and ETA against plan. -->
<script lang="ts" module>
	/** after: the step it waits for (index), or -1 to start right away */
	export type PlanStep = { name: string; plan: number; actual: number; after: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from '../utils/script';
	import './agents.css';
	let {
		goal = 'Ship the pricing page',
		steps = [
			{ name: 'Read the brief', plan: 20, actual: 16, after: -1 },
			{ name: 'Draft the copy', plan: 40, actual: 52, after: 0 },
			{ name: 'Build the layout', plan: 60, actual: 85, after: 0 },
			{ name: 'Write the tests', plan: 30, actual: 28, after: 1 },
			{ name: 'Wire up checkout', plan: 45, actual: 40, after: 2 },
			{ name: 'Run tests and fix', plan: 35, actual: 41, after: 4 },
			{ name: 'Open the pull request', plan: 15, actual: 12, after: 5 }
		] as PlanStep[],
		budget = 1.03,
		elapsed = $bindable(32),
		autoplay = true
	}: { goal?: string; steps?: PlanStep[]; budget?: number; elapsed?: number; autoplay?: boolean } = $props();
	const SPAN = 270;
	// The plan as scheduled, and the real schedule: finished steps keep their actual length,
	// the rest are projected with their planned length from wherever their dependency ends
	const planned = $derived.by(() => {
		const out: { start: number; end: number }[] = [];
		steps.forEach((st, i) => {
			const start = st.after < 0 ? 0 : out[st.after].end;
			out[i] = { start, end: start + st.plan };
		});
		return out;
	});
	const real = $derived.by(() => {
		const out: { start: number; end: number; status: 'done' | 'run' | 'todo' }[] = [];
		steps.forEach((st, i) => {
			const start = st.after < 0 ? 0 : out[st.after].end;
			const doneAt = start + st.actual;
			const status = elapsed >= doneAt ? 'done' : elapsed >= start ? 'run' : 'todo';
			const end = status === 'done' ? doneAt : status === 'run' ? Math.max(start + st.plan, elapsed) : start + st.plan;
			out[i] = { start, end, status };
		});
		return out;
	});
	const planEnd = $derived(Math.max(...planned.map((r) => r.end)));
	const eta = $derived(Math.max(...real.map((r) => r.end)));
	const ahead = $derived(Math.round(planEnd - eta));
	const x = (t: number) => `${(t / SPAN) * 100}%`;
	const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
	onMount(() => tick(250, () => (elapsed = elapsed >= eta + 12 ? 0 : elapsed + 1)));
</script>

<div class="ui-ag ui-ag-panel ui-pva">
	<div class="ui-ag-head"><b>Plan vs actual</b><span class="ui-ag-muted ui-ag-grow">{goal}</span><small class="ui-ag-muted">Time <b>{fmt(elapsed)}</b> / {fmt(planEnd)}</small><small class="ui-ag-muted">Cost <b>${((Math.min(elapsed, eta) / planEnd) * budget).toFixed(2)}</b> / ${budget.toFixed(2)}</small><span class="ui-ag-pill" data-tone={ahead > 0 ? 'green' : ahead < 0 ? 'amber' : 'gray'}>{ahead === 0 ? 'On plan' : ahead > 0 ? `${ahead}s ahead` : `+${-ahead}s behind`}</span></div>
	<div class="ui-pva__grid">
		<div class="ui-pva__row ui-pva__ticks"><small>Step</small><div class="ui-pva__track">{#each [30, 60, 90, 120, 150, 180, 210, 240] as t (t)}<span style:left={x(t)}>{fmt(t)}</span>{/each}</div></div>
		{#each steps as st, i (st.name)}
			{@const r = real[i]}
			{@const a = r.status === 'todo' ? 0 : r.status === 'done' ? st.actual : elapsed - r.start}
			<div class="ui-pva__row" data-status={r.status}>
				<span class="ui-pva__nm"><span class="ui-ag-check" data-state={r.status === 'done' ? undefined : r.status}></span>{st.name}</span>
				<div class="ui-pva__track">
					<i class="ui-pva__plan" style:left={x(r.status === 'todo' ? r.start : planned[i].start)} style:width={x(st.plan)}></i>
					{#if a > 0}<i class="ui-pva__act" data-over={a > st.plan || undefined} data-live={r.status === 'run' || undefined} style:left={x(r.start)} style:width={x(a)}></i>{/if}
					<small style:left={x(r.start + Math.max(st.plan, a))}>{fmt(r.status === 'done' ? st.actual : r.status === 'run' ? a : st.plan)}{#if r.status === 'done'}<span class="ui-ag-pill ui-pva__pop" data-tone={st.actual <= st.plan ? 'green' : 'amber'}>{st.actual <= st.plan ? '−' : '+'}{Math.abs(st.plan - st.actual)}s</span>{/if}</small>
				</div>
			</div>
		{/each}
		<i class="ui-pva__head" style:left="calc(140px + (100% - 140px) * {elapsed / SPAN})"></i>
		<i class="ui-pva__eta" style:left="calc(140px + (100% - 140px) * {eta / SPAN})"></i>
	</div>
	<div class="ui-ag-foot ui-pva__leg"><span><i class="ui-pva__plan"></i>Plan</span><span><i class="ui-pva__act"></i>Actual</span><span><i class="ui-pva__act" data-over></i>Over plan</span><span class="ui-ag-grow"></span><span class="ui-ag-pill" data-tone={ahead >= 0 ? 'green' : 'amber'}>ETA {fmt(eta)}</span><span class="ui-ag-pill" data-tone="gray">Plan {fmt(planEnd)}</span></div>
</div>

<style>
	.ui-pva__pop {
		animation: ui-ag-pop 0.35s var(--ag-ease);
	}
	.ui-pva__plan,
	.ui-pva__track small {
		transition: left 0.5s var(--ag-ease);
	}
	i[data-live] {
		background-image: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%) !important;
		background-size: 250% 100% !important;
		animation: ui-ag-sheen 1.4s linear infinite;
	}
	.ui-pva {
		max-width: 600px;
		font-size: 11px;
	}
	.ui-pva b {
		font-weight: 500;
		color: var(--ag-ink);
	}
	.ui-pva__grid {
		position: relative;
		padding-bottom: 6px;
	}
	.ui-pva__row {
		display: grid;
		grid-template-columns: 140px 1fr;
		align-items: center;
		height: 25px;
		padding-left: 12px;
	}
	.ui-pva__ticks {
		border-bottom: 1px solid var(--ag-line);
		font-size: 9.5px;
		color: var(--ag-muted);
	}
	.ui-pva__ticks small {
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 9px;
	}
	.ui-pva__nm {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.ui-pva__row[data-status='todo'] .ui-pva__nm {
		color: var(--ag-muted);
	}
	.ui-pva__track {
		position: relative;
		height: 100%;
		background: repeating-linear-gradient(to right, transparent 0 calc(11.111% - 1px), var(--ag-line) calc(11.111% - 1px) 11.111%);
	}
	.ui-pva__ticks span {
		position: absolute;
		top: 6px;
		transform: translateX(-50%);
	}
	i {
		position: absolute;
		display: block;
	}
	.ui-pva__plan,
	.ui-pva__act {
		top: 8px;
		height: 9px;
		border-radius: 3px;
	}
	.ui-pva__plan {
		border: 1px dashed var(--ag-subtle);
		opacity: 0.6;
	}
	.ui-pva__act {
		background: color-mix(in srgb, #a855f7 30%, transparent);
		transition: width 0.6s var(--ag-ease);
	}
	.ui-pva__act[data-over] {
		background: color-mix(in srgb, var(--ag-amber) 35%, transparent);
	}
	.ui-pva__track small {
		position: absolute;
		top: 5px;
		padding-left: 6px;
		white-space: nowrap;
		display: flex;
		gap: 4px;
	}
	.ui-pva__row[data-status='todo'] .ui-pva__track small {
		color: var(--ag-subtle);
	}
	.ui-pva__head,
	.ui-pva__eta {
		top: 25px;
		bottom: 0;
		width: 0;
		border-left: 1px solid var(--ag-blue);
		transition: left 0.6s linear;
	}
	.ui-pva__eta {
		border-left: 1px dashed var(--ag-green);
	}
	.ui-pva__leg {
		gap: 12px;
		color: var(--ag-muted);
	}
	.ui-pva__leg span:not(.ui-ag-pill):not(.ui-ag-grow) {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.ui-pva__leg i {
		position: static;
		width: 14px;
		height: 8px;
	}
</style>
