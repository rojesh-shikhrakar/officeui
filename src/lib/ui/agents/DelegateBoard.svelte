<!-- Delegate Board – hand work to your agents by dragging it onto them (or click a task, then an agent); each agent shows its new "busy until" time. Auto assigns everything. -->
<script lang="ts" module>
	export type BoardTask = { id: string; title: string; minutes: number };
	export type BoardAgent = { id: string; name: string; model: string; rate: number; busyUntil: number; tasks: string[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		tasks = $bindable([
			{ id: 't0', title: 'Write release notes', minutes: 12 },
			{ id: 't1', title: 'Fix flaky checkout test', minutes: 20 },
			{ id: 't2', title: 'Summarize churn calls', minutes: 15 },
			{ id: 't3', title: 'Update pricing page', minutes: 10 },
			{ id: 't4', title: 'Clean up CRM duplicates', minutes: 18 }
		]),
		agents = $bindable([
			{ id: 'a1', name: 'Researcher', model: 'Atlas Max', rate: 0.08, busyUntil: 758, tasks: ['Competitor scan'] },
			{ id: 'a2', name: 'Writer', model: 'Atlas Pro', rate: 0.03, busyUntil: 0, tasks: [] },
			{ id: 'a3', name: 'Coder', model: 'Orbit Pro', rate: 0.06, busyUntil: 774, tasks: ['Refactor auth', 'Upgrade payments SDK'] },
			{ id: 'a4', name: 'Ops', model: 'Prism Flash', rate: 0.01, busyUntil: 0, tasks: [] }
		]),
		autoplay = true,
		ondelegate
	}: { tasks?: BoardTask[]; agents?: BoardAgent[]; autoplay?: boolean; ondelegate?: (task: BoardTask, agent: BoardAgent) => void } = $props();
	onMount(() =>
		play(
			[
				[1600, () => ((dragging = 't0'), (over = 'a2'))],
				[1200, () => give('t0', 'a2')],
				[1400, () => ((dragging = 't1'), (over = 'a3'))],
				[1200, () => give('t1', 'a3')],
				[1800, () => autoAssign()]
			],
			{ autoplay, still: 0 }
		)
	);
	let dragging = $state<string | null>(null);
	let over = $state<string | null>(null);
	let auto = $state(false);
	const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
	const queued = $derived(agents.reduce((s, a) => s + a.tasks.length * a.rate * 10, 0));
	function give(taskId: string, agentId: string) {
		const t = tasks.find((x) => x.id === taskId);
		const a = agents.find((x) => x.id === agentId);
		if (!t || !a) return;
		tasks = tasks.filter((x) => x.id !== taskId);
		agents = agents.map((x) => (x.id === agentId ? { ...x, busyUntil: Math.max(x.busyUntil, 752) + t.minutes, tasks: [...x.tasks, t.title] } : x));
		ondelegate?.(t, a);
		dragging = over = null;
	}
	function autoAssign() {
		auto = !auto;
		if (!auto) return;
		for (const t of [...tasks]) give(t.id, [...agents].sort((a, b) => a.busyUntil - b.busyUntil)[0].id);
	}
	const preview = (a: BoardAgent) => (dragging && over === a.id ? Math.max(a.busyUntil, 752) + (tasks.find((t) => t.id === dragging)?.minutes ?? 0) : null);
</script>

<div class="ui-ag ui-ag-panel ui-dlb">
	<div class="ui-ag-head"><span style:color="var(--ag-blue)">✦</span><b>Delegate <span class="ui-ag-muted">Drag a task onto an agent</span></b><label class="ui-dlb__auto ui-ag-muted">Auto <input type="checkbox" role="switch" checked={auto} onchange={autoAssign} /></label></div>
	<div class="ui-dlb__cols">
		<div class="ui-dlb__tasks">
			<small class="ui-ag-muted">Unassigned <em>{tasks.length}</em></small>
			{#each tasks as t (t.id)}
				<button class="ui-ag-card ui-dlb__task" draggable="true" aria-pressed={dragging === t.id} ondragstart={() => (dragging = t.id)} ondragend={() => (dragging = over = null)} onclick={() => (dragging = dragging === t.id ? null : t.id)}>
					<b>{t.title}</b><small>~{t.minutes} min</small>
				</button>
			{:else}<p class="ui-ag-muted">All handed out</p>{/each}
		</div>
		<div class="ui-dlb__agents">
			<small class="ui-ag-muted">Agents <span style:float="right">${queued.toFixed(2)} in queues</span></small>
			{#each agents as a (a.id)}
				<button
					class="ui-dlb__agent"
					data-over={over === a.id || undefined}
					aria-label="Give the task to {a.name}"
					ondragover={(e) => (e.preventDefault(), (over = a.id))}
					ondragleave={() => over === a.id && (over = null)}
					ondrop={(e) => (e.preventDefault(), dragging && give(dragging, a.id))}
					onpointerenter={() => dragging && (over = a.id)}
					onclick={() => dragging && give(dragging, a.id)}
				>
					<span class="ui-ag-row"><span class="ui-ag-avatar" style:background="linear-gradient(135deg,#ff8a65,#e64a19)">{a.name[0]}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model} <span class="ui-ag-muted">${a.rate.toFixed(2)}/min</span></small></span>
						{#if preview(a)}<span class="ui-ag-pill" data-tone="blue">until {clock(preview(a)!)}</span>{:else if a.busyUntil}<span class="ui-ag-pill" data-tone="gray">Busy until {clock(a.busyUntil)}</span>{:else}<span class="ui-ag-pill" data-tone="green">Free</span>{/if}</span>
					{#if a.tasks.length}<span class="ui-dlb__q">{#each a.tasks as q (q)}<span class="ui-ag-pill" data-tone="blue">{q}</span>{/each}</span>{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.ui-dlb {
		max-width: 480px;
		font-size: 11.5px;
	}
	.ui-dlb__auto {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-dlb__cols {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 10px;
		padding: 10px;
	}
	.ui-dlb__tasks {
		background: var(--ag-fill);
		border-radius: 10px;
		padding: 5px;
		display: grid;
		gap: 5px;
		align-content: start;
	}
	em {
		font-style: normal;
		background: var(--ag-surface);
		padding: 0 4px;
		border-radius: 4px;
	}
	.ui-dlb__task {
		display: grid;
		gap: 2px;
		padding: 7px 8px;
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: grab;
	}
	.ui-dlb__task[aria-pressed='true'] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px var(--ag-blue);
	}
	.ui-dlb__task b {
		font-weight: 500;
	}
	.ui-dlb__task small {
		color: var(--ag-muted);
	}
	.ui-dlb__agents {
		display: grid;
		gap: 2px;
		align-content: start;
	}
	.ui-dlb__agent {
		display: grid;
		gap: 4px;
		padding: 7px 8px;
		border: 0;
		border-radius: 9px;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	.ui-dlb__agent[data-over] {
		background: color-mix(in srgb, var(--ag-blue) 8%, transparent);
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-dlb__q {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding-left: 30px;
	}
</style>
