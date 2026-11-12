<script lang="ts" module>
	export type GNode = { id: string; label: string; kind: 'agent' | 'tool'; x: number; y: number; active?: boolean };
</script>

<script lang="ts">
	import './agents.css';
	let {
		nodes = [
			{ id: 'o', label: 'Orchestrator', kind: 'agent', x: 50, y: 18, active: true },
			{ id: 'r', label: 'Researcher', kind: 'agent', x: 22, y: 52, active: true },
			{ id: 'w', label: 'Writer', kind: 'agent', x: 78, y: 52 },
			{ id: 's', label: 'search_web', kind: 'tool', x: 8, y: 86 },
			{ id: 'd', label: 'read_docs', kind: 'tool', x: 36, y: 86, active: true },
			{ id: 'g', label: 'github', kind: 'tool', x: 64, y: 86 },
			{ id: 'n', label: 'notion', kind: 'tool', x: 92, y: 86 }
		],
		edges = [
			['o', 'r'],
			['o', 'w'],
			['r', 's'],
			['r', 'd'],
			['w', 'g'],
			['w', 'n']
		]
	}: { nodes?: GNode[]; edges?: string[][] } = $props();
	const at = (id: string) => nodes.find((n) => n.id === id)!;
	let hover = $state<string | null>(null);
</script>

<div class="ui-ag ui-agg">
	<svg class="ui-agg__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
		{#each edges as [a, b] (a + b)}
			{@const A = at(a)}
			{@const B = at(b)}
			<line x1={A.x} y1={A.y} x2={B.x} y2={B.y} data-live={(A.active && B.active) || undefined} data-dim={hover && hover !== a && hover !== b ? true : undefined} />
		{/each}
	</svg>
	{#each nodes as n (n.id)}
		<button
			class="ui-agg__node"
			data-kind={n.kind}
			data-active={n.active || undefined}
			style:left="{n.x}%"
			style:top="{n.y}%"
			onpointerenter={() => (hover = n.id)}
			onpointerleave={() => (hover = null)}
			onfocus={() => (hover = n.id)}
			onblur={() => (hover = null)}>{#if n.active}<i class="ui-ag-dot"></i>{/if}{n.label}</button
		>
	{/each}
</div>

<style>
	.ui-agg {
		position: relative;
		width: 100%;
		max-width: 560px;
		aspect-ratio: 16 / 9;
	}
	.ui-agg__edges {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	line {
		/* --ag-line is a hairline-border colour (~7% alpha): too faint for a 1px stroke on white */
		stroke: color-mix(in srgb, var(--ag-ink) 22%, transparent);
		stroke-width: 1.2;
		vector-effect: non-scaling-stroke;
		transition: opacity 0.2s;
	}
	line[data-live] {
		stroke: var(--ag-blue);
		stroke-dasharray: 4 4;
		animation: ui-agg-flow 1s linear infinite;
	}
	line[data-dim] {
		opacity: 0.3;
	}
	.ui-agg__node {
		position: absolute;
		transform: translate(-50%, -50%);
		display: inline-flex;
		align-items: center;
		gap: 5px;
		border: 0;
		font: inherit;
		font-size: 11.5px;
		font-weight: 500;
		padding: 5px 10px;
		border-radius: 999px;
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
		cursor: default;
		white-space: nowrap;
		transition: transform 0.2s var(--ag-ease);
	}
	.ui-agg__node:hover {
		transform: translate(-50%, -50%) scale(1.05);
	}
	.ui-agg__node[data-kind='tool'] {
		border-radius: 7px;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 10.5px;
		color: var(--ag-muted);
	}
	.ui-agg__node[data-active] {
		color: var(--ag-blue);
	}
	@keyframes ui-agg-flow {
		to {
			stroke-dashoffset: -8;
		}
	}
</style>
