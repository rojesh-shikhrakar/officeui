<!-- Cost Waterfall – where the money and tokens of an agent run go: every LLM call, tool call and sub-agent as a step in a waterfall with tokens, cost and time. -->
<script lang="ts" module>
	export type CostStep = { id: string; name: string; note: string; depth: number; cost: number; tin?: number; tout?: number; time: number; kind: 'llm' | 'agent' | 'tool'; failed?: boolean; parent?: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		run = 'Report on LLM API prices in 2026',
		steps = [
			{ id: 'a', name: 'Plan the report', note: 'Atlas Max', depth: 0, cost: 0.04, tin: 4100, tout: 960, time: 3.0, kind: 'llm' },
			{ id: 'b', name: 'Researcher', note: 'Prism Flash', depth: 0, cost: 0.03, tin: 38400, tout: 888, time: 8.5, kind: 'agent' },
			{ id: 'c', name: 'web_search', note: 'API prices 2026', depth: 1, cost: 0.01, time: 1.3, kind: 'tool', parent: 'b' },
			{ id: 'd', name: 'web_search', note: 'cache discounts', depth: 1, cost: 0.01, time: 1.1, kind: 'tool', parent: 'b' },
			{ id: 'e', name: 'fetch_pages', note: '9 pages', depth: 1, cost: 0, time: 2.1, kind: 'tool', parent: 'b' },
			{ id: 'f', name: 'Summarize sources', note: 'Prism Flash', depth: 1, cost: 0.01, tin: 38400, tout: 888, time: 2.6, kind: 'llm', parent: 'b' },
			{ id: 'g', name: 'Write the report', note: 'Atlas Max', depth: 0, cost: 0.25, tin: 21800, tout: 5600, time: 7.5, kind: 'llm' },
			{ id: 'h', name: 'Reviewer', note: 'Atlas Mini', depth: 0, cost: 0.03, tin: 26000, tout: 700, time: 3.3, kind: 'agent' },
			{ id: 'i', name: 'Check facts', note: 'Atlas Mini', depth: 1, cost: 0.03, tin: 26000, tout: 700, time: 2.0, kind: 'llm', parent: 'h' },
			{ id: 'j', name: 'check_links', note: '31 links', depth: 1, cost: 0, time: 1.1, kind: 'tool', parent: 'h', failed: true },
			{ id: 'k', name: 'Apply review', note: 'Atlas Pro', depth: 0, cost: 0.1, tin: 24500, tout: 1900, time: 2.8, kind: 'llm' },
			{ id: 'l', name: 'Save report', note: 'Notes', depth: 0, cost: 0, time: 0.65, kind: 'tool' }
		] as CostStep[],
		autoplay = true
	}: { run?: string; steps?: CostStep[]; autoplay?: boolean } = $props();
	// svelte-ignore state_referenced_locally
	let count = $state(autoplay ? 1 : steps.length);
	onMount(() => play(steps.slice(1).map(() => [850, () => count++] as [number, () => void]), { autoplay, still: 5 }));
	const live = $derived(count < steps.length);
	const arrived = $derived(steps.slice(0, count));
	let measure = $state<'cost' | 'tokens'>('cost');
	let folded = $state<Set<string>>(new Set());
	const fold = (id: string) => {
		const n = new Set(folded);
		if (n.has(id)) n.delete(id);
		else n.add(id);
		folded = n;
	};
	const leaves = $derived(arrived.filter((x) => x.kind !== 'agent'));
	const total = $derived(leaves.reduce((n, x) => n + x.cost, 0));
	const tin = $derived(leaves.reduce((n, x) => n + (x.tin ?? 0), 0));
	const tout = $derived(leaves.reduce((n, x) => n + (x.tout ?? 0), 0));
	const tokens = $derived(tin + tout);
	const top = $derived(leaves.reduce((a, b) => (b.cost > a.cost ? b : a), leaves[0]));
	const shown = $derived(arrived.filter((x) => !x.parent || !folded.has(x.parent)));
	const kids = (id: string) => arrived.filter((x) => x.parent === id).length;
	const val = (x: CostStep) => (measure === 'cost' ? x.cost : (x.tin ?? 0) + (x.tout ?? 0));
	const max = $derived(Math.max(measure === 'cost' ? 0.05 : 5000, leaves.reduce((n, x) => n + val(x), 0)) * 1.15);
	// Where a step's bar starts: everything before it; an agent's bar spans its sub-steps
	const offset = (st: CostStep) => leaves.filter((x) => steps.indexOf(x) < steps.indexOf(st)).reduce((n, x) => n + val(x), 0);
	const width = (st: CostStep) => (st.kind === 'agent' ? arrived.filter((x) => x.parent === st.id).reduce((n, x) => n + val(x), 0) : val(st));
	const fmtv = (v: number) => (measure === 'cost' ? '$' + v.toFixed(2) : (v / 1000).toFixed(0) + 'k');
	const color = { llm: '#a76bf0', agent: '#a3a3a3', tool: '#5b9cf6' } as const;
</script>

<div class="ui-ag ui-ag-panel ui-cwf">
	<div class="ui-ag-head"><span style:color="var(--ag-blue)">✦</span><b>Run cost <span class="ui-ag-muted">{run}</span></b><div class="ui-ag-tabs" role="tablist"><button class="ui-ag-tab" role="tab" aria-selected={measure === 'cost'} onclick={() => (measure = 'cost')}>Cost</button><button class="ui-ag-tab" role="tab" aria-selected={measure === 'tokens'} onclick={() => (measure = 'tokens')}>Tokens</button></div>{#if live}<span class="ui-ag-pill" data-tone="blue"><i class="ui-cwf__pulse"></i>Live</span>{/if}</div>
	<div class="ui-cwf__stats"><div><small>Total cost</small><b>${total.toFixed(2)}</b></div><div><small>Total tokens</small><b>{(tokens / 1000).toFixed(1)}k <small class="ui-cwf__io">{(tin / 1000).toFixed(1)}k in · {tout.toLocaleString('en-US')} out</small></b></div><div><small>Most expensive</small><b>{top?.name} <span class="ui-ag-muted">${top?.cost.toFixed(2)}</span></b></div></div>
	<table>
		<thead><tr><th>Step</th><th class="ui-cwf__barcol"><span class="ui-cwf__axis"><span>{fmtv(0)}</span><span>{fmtv(max / 2)}</span></span></th><th>In</th><th>Out</th><th>Cost</th><th>Time</th></tr></thead>
		<tbody>
			{#each shown as s, i (s.id)}
				<tr class="ui-cwf__row" data-new={i === shown.length - 1 && live ? '' : undefined}>
					<td style:padding-left="{12 + s.depth * 14}px">{#if s.kind === 'agent'}<button class="ui-cwf__fold" aria-expanded={!folded.has(s.id)} aria-label="Fold {s.name}" onclick={() => fold(s.id)}>{folded.has(s.id) ? '›' : '⌄'}</button>{/if}<span class="ui-cwf__k" data-kind={s.kind}>{s.kind === 'tool' ? '⌕' : '✳'}</span><b>{s.name}</b> <small class="ui-ag-muted">{s.note}</small>{#if folded.has(s.id)}<span class="ui-ag-pill" data-tone="gray">+{kids(s.id)}</span>{/if}{#if s.id === top?.id}<span class="ui-ag-pill" data-tone="amber">Top</span>{/if}</td>
					<td class="ui-cwf__barcol"><i data-agent={s.kind === 'agent' || undefined} style:margin-left="{(offset(s) / max) * 100}%" style:width="{Math.max(1.5, (width(s) / max) * 100)}%" style:background={color[s.kind]}></i></td>
					<td>{s.tin ? (s.tin / 1000).toFixed(1) + 'k' : '–'}</td><td>{s.tout ?? '–'}</td><td>{s.cost ? '$' + s.cost.toFixed(2) : '–'}</td><td data-fail={s.failed || undefined}>{s.failed ? '⚠ ' : ''}{s.time < 1 ? Math.round(s.time * 1000) + 'ms' : s.time.toFixed(1) + 's'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.ui-cwf__pulse {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		animation: ui-ag-breathe 1.2s ease-in-out infinite;
	}
	.ui-cwf__io {
		font-size: 10px;
		color: var(--ag-muted);
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
	}
	.ui-cwf__axis {
		display: flex;
		justify-content: space-between;
		width: 50%;
	}
	.ui-cwf__row {
		animation: ui-ag-rise 0.4s var(--ag-ease) both;
	}
	.ui-cwf__row[data-new] i {
		animation: ui-cwf-grow 0.7s var(--ag-ease) both;
	}
	@keyframes ui-cwf-grow {
		from {
			transform: scaleX(0);
		}
	}
	.ui-cwf__barcol i {
		transform-origin: left;
	}
	.ui-cwf__barcol i[data-agent] {
		opacity: 0.25 !important;
	}
	.ui-cwf__k {
		font-size: 9px;
		margin-right: 5px;
		color: #d97757;
	}
	.ui-cwf__k[data-kind='tool'] {
		color: var(--ag-blue);
	}
	td[data-fail] {
		color: var(--ag-red);
	}
	.ui-cwf {
		max-width: 540px;
		font-size: 11px;
	}
	.ui-cwf__stats {
		display: grid;
		grid-template-columns: 1fr 1fr 1.6fr;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-cwf__stats div {
		padding: 8px 12px;
		display: grid;
	}
	.ui-cwf__stats div + div {
		border-left: 1px solid var(--ag-line);
	}
	.ui-cwf__stats small,
	th {
		font-size: 9.5px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ag-subtle);
		font-weight: 500;
	}
	.ui-cwf__stats b {
		font-weight: 500;
		font-size: 12.5px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: 5px 8px;
		text-align: right;
		white-space: nowrap;
	}
	th:first-child,
	td:first-child {
		text-align: left;
	}
	td b {
		font-weight: 500;
	}
	.ui-cwf__barcol {
		width: 30%;
		border-left: 1px solid var(--ag-line);
		border-right: 1px solid var(--ag-line);
	}
	.ui-cwf__barcol i {
		display: block;
		height: 8px;
		border-radius: 2px;
		opacity: 0.7;
	}
	.ui-cwf__fold {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		padding: 0 3px 0 0;
	}
	.ui-ag-pill {
		height: 15px;
		font-size: 9px;
		margin-left: 4px;
	}
</style>
