<!-- Breakdown Chart – a stacked bar chart with measure, slice and segment pickers, a hover breakdown and a linked table. -->
<script lang="ts">
	import '../agents/agents.css';
	const segments = [
		{ id: 'urgent', label: 'Urgent', color: '#e5484d' },
		{ id: 'high', label: 'High', color: '#f5a524' },
		{ id: 'medium', label: 'Medium', color: '#0a84ff' },
		{ id: 'low', label: 'Low', color: '#9cc7f5' },
		{ id: 'none', label: 'None', color: '#d4d4d4' }
	];
	let {
		title = 'Sprint 24',
		rows = [
			{ label: 'Backlog', values: [3, 6, 6, 8, 3] },
			{ label: 'Todo', values: [1, 7, 12, 11, 5] },
			{ label: 'In progress', values: [1, 9, 12, 7, 5] },
			{ label: 'In review', values: [0, 1, 6, 4, 2] },
			{ label: 'Done', values: [7, 14, 23, 25, 27] },
			{ label: 'Canceled', values: [0, 1, 3, 1, 2] }
		]
	}: { title?: string; rows?: { label: string; values: number[] }[] } = $props();
	let measure = $state('count');
	let hover = $state<number | null>(null);
	let hidden = $state<Record<string, boolean>>({});
	const val = (v: number) => (measure === 'points' ? v * 3 : v);
	const totals = $derived(rows.map((r) => r.values.reduce((s, v, i) => s + (hidden[segments[i].id] ? 0 : val(v)), 0)));
	const max = $derived(Math.max(...totals, 1));
	const all = $derived(totals.reduce((a, b) => a + b, 0));
</script>

<div class="ui-ag ui-ag-panel ui-bdc">
	<div class="ui-ag-head"><b>{title}</b><small><b>{all}</b> {measure === 'points' ? 'points' : 'tasks'}</small></div>
	<div class="ui-bdc__pick">
		<label>Measure<select class="ui-ag-input" bind:value={measure}><option value="count">Task count</option><option value="points">Story points</option></select></label>
		<label>Slice<select class="ui-ag-input"><option>Status</option></select></label>
		<label>Segment<select class="ui-ag-input"><option>Priority</option></select></label>
	</div>
	<div class="ui-bdc__chart" role="img" aria-label="{title} by status">
		{#each rows as r, i (r.label)}
			<div class="ui-bdc__col" role="presentation" onpointerenter={() => (hover = i)} onpointerleave={() => (hover = null)}>
				<div class="ui-bdc__bar" style:height="{(totals[i] / max) * 100}%" data-dim={hover !== null && hover !== i ? '' : undefined}>
					{#each r.values as v, k (k)}{#if !hidden[segments[k].id]}<i style:flex={val(v)} style:background={segments[k].color}></i>{/if}{/each}
				</div>
				{#if hover === i}<div class="ui-bdc__tip ui-ag-in"><b>{r.label}</b>{#each segments as s, k (s.id)}<span><i style:background={s.color}></i>{s.label}<em>{val(r.values[k])}</em></span>{/each}</div>{/if}
			</div>
		{/each}
	</div>
	<table>
		<thead><tr><th>Status</th><th>Total</th>{#each segments as s (s.id)}<th><i style:background={s.color}></i>{s.label}</th>{/each}</tr></thead>
		<tbody>{#each rows as r, i (r.label)}<tr data-hover={hover === i || undefined} onpointerenter={() => (hover = i)} onpointerleave={() => (hover = null)}><td>{r.label}</td><td>{totals[i]}</td>{#each r.values as v, k (k)}<td>{val(v)}</td>{/each}</tr>{/each}</tbody>
	</table>
	<div class="ui-ag-foot ui-bdc__legend">{#each segments as s (s.id)}<button class="ui-ag-chip" aria-pressed={!hidden[s.id]} onclick={() => (hidden[s.id] = !hidden[s.id])}><i style:background={s.color}></i>{s.label}</button>{/each}</div>
</div>

<style>
	.ui-bdc {
		max-width: 420px;
		font-size: 11.5px;
	}
	.ui-bdc__pick {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 8px 14px 0;
	}
	label {
		display: grid;
		gap: 3px;
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-bdc__chart {
		display: flex;
		align-items: flex-end;
		gap: 10%;
		height: 120px;
		padding: 12px 24px 6px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-bdc__col {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		position: relative;
	}
	.ui-bdc__bar {
		width: 12px;
		display: flex;
		flex-direction: column-reverse;
		gap: 1px;
		transition:
			height 0.5s var(--ag-ease),
			opacity 0.2s;
	}
	.ui-bdc__bar[data-dim] {
		opacity: 0.35;
	}
	.ui-bdc__bar i {
		display: block;
		border-radius: 1px;
	}
	.ui-bdc__tip {
		position: absolute;
		bottom: 100%;
		z-index: 3;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 6px 18px -6px rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		padding: 6px 8px;
		display: grid;
		gap: 2px;
		min-width: 110px;
		font-size: 10.5px;
	}
	.ui-bdc__tip span {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-bdc__tip em {
		margin-left: auto;
		font-style: normal;
	}
	i {
		width: 7px;
		height: 7px;
		border-radius: 2px;
		display: inline-block;
		flex: none;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	th {
		font-size: 9.5px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ag-subtle);
		text-align: right;
		padding: 6px 8px;
		white-space: nowrap;
	}
	th:first-child,
	td:first-child {
		text-align: left;
		padding-left: 14px;
	}
	td {
		text-align: right;
		padding: 4px 8px;
	}
	tr[data-hover] td {
		background: var(--ag-fill);
	}
	.ui-bdc__legend {
		justify-content: flex-start;
		flex-wrap: wrap;
	}
	.ui-bdc__legend .ui-ag-chip[aria-pressed='true'] {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
	.ui-bdc__legend .ui-ag-chip[aria-pressed='false'] {
		background: none;
		text-decoration: line-through;
	}
</style>
