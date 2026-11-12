<script lang="ts" module>
	export type Span = { id: string; name: string; kind: 'llm' | 'tool' | 'agent'; start: number; dur: number; tokens?: number; cost: number; depth: number };
</script>

<script lang="ts">
	import './agents.css';
	let {
		spans = [
			{ id: 'a', name: 'Orchestrator · plan', kind: 'llm', start: 0, dur: 2.1, tokens: 1840, cost: 0.012, depth: 0 },
			{ id: 'b', name: 'search_web', kind: 'tool', start: 2.1, dur: 3.4, cost: 0.002, depth: 1 },
			{ id: 'c', name: 'Researcher', kind: 'agent', start: 2.4, dur: 7.8, tokens: 9210, cost: 0.081, depth: 1 },
			{ id: 'd', name: 'read_page × 4', kind: 'tool', start: 3.1, dur: 4.9, cost: 0.004, depth: 2 },
			{ id: 'e', name: 'summarize', kind: 'llm', start: 8.2, dur: 2.0, tokens: 3120, cost: 0.019, depth: 2 },
			{ id: 'f', name: 'Writer · draft', kind: 'llm', start: 10.4, dur: 4.6, tokens: 5400, cost: 0.044, depth: 1 }
		]
	}: { spans?: Span[] } = $props();
	const end = $derived(Math.max(...spans.map((s) => s.start + s.dur)));
	const slowest = $derived(spans.reduce((a, b) => (b.dur > a.dur ? b : a)).id);
	const cost = $derived(spans.reduce((s, x) => s + x.cost, 0));
	const tokens = $derived(spans.reduce((s, x) => s + (x.tokens ?? 0), 0));
</script>

<div class="ui-ag ui-agw ui-ag-card">
	<div class="ui-agw__bar">
		<b>Trace</b><span>{end.toFixed(1)}s</span><span>{tokens.toLocaleString('en-US')} tokens</span><span>${cost.toFixed(3)}</span>
	</div>
	{#each spans as s (s.id)}
		<div class="ui-agw__row" data-slow={s.id === slowest || undefined}>
			<span class="ui-agw__name" style:padding-left="{s.depth * 12}px"><i data-kind={s.kind}></i>{s.name}</span>
			<span class="ui-agw__lane"><span class="ui-agw__span" data-kind={s.kind} style:left="{(s.start / end) * 100}%" style:width="{(s.dur / end) * 100}%"></span></span>
			<span class="ui-agw__dur">{s.dur.toFixed(1)}s</span>
		</div>
	{/each}
</div>

<style>
	.ui-agw {
		width: 100%;
		max-width: 600px;
		padding: 10px 14px 12px;
		font-size: 12px;
	}
	.ui-agw__bar {
		display: flex;
		gap: 14px;
		padding-bottom: 8px;
		margin-bottom: 4px;
		border-bottom: 1px solid var(--ag-line);
		color: var(--ag-muted);
	}
	.ui-agw__bar b {
		color: var(--ag-ink);
		font-weight: 600;
		margin-right: auto;
	}
	.ui-agw__row {
		display: grid;
		grid-template-columns: 170px 1fr 40px;
		align-items: center;
		gap: 8px;
		height: 26px;
	}
	.ui-agw__name {
		display: flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-agw__name i {
		width: 6px;
		height: 6px;
		border-radius: 2px;
		flex: none;
	}
	[data-kind='llm'] {
		--k: #7c5cff;
	}
	[data-kind='tool'] {
		--k: #0f9d76;
	}
	[data-kind='agent'] {
		--k: var(--ag-blue);
	}
	.ui-agw__name i {
		background: var(--k);
	}
	.ui-agw__lane {
		position: relative;
		height: 14px;
	}
	.ui-agw__span {
		position: absolute;
		height: 100%;
		border-radius: 4px;
		background: color-mix(in srgb, var(--k) 22%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--k) 35%, transparent);
		transform-origin: left;
		animation: ui-agw-grow 0.7s var(--ag-ease) both;
	}
	.ui-agw__row[data-slow] .ui-agw__dur {
		color: var(--ag-red);
		font-weight: 600;
	}
	.ui-agw__dur {
		text-align: right;
		color: var(--ag-muted);
		font-variant-numeric: tabular-nums;
	}
	@keyframes ui-agw-grow {
		from {
			transform: scaleX(0);
		}
	}
</style>
