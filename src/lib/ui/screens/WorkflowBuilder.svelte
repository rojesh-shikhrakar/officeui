<!-- Workflow Builder – nodes on a dotted canvas joined by curves: add them from the palette, drag them around, select one to see its settings, zoom, and publish. -->
<script lang="ts" module>
	export type WNode = { id: string; kind: 'trigger' | 'agent' | 'tool' | 'logic' | 'action'; title: string; sub: string; code?: string; x: number; y: number; ready?: boolean; tags?: string[] };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import './shell/screen.css';
	let {
		nodes = $bindable([
			{ id: 'n1', kind: 'trigger', title: 'New signup', sub: 'When a user signs up', code: 'auth.user_created · Sign-up form', x: 180, y: 20, ready: true },
			{ id: 'n6', kind: 'trigger', title: 'Document upload', sub: 'Choose where events come from', code: '.pdf · .docx', x: 420, y: 20, ready: false },
			{ id: 'n2', kind: 'agent', title: 'Classify customer', sub: 'Classifies plan and size', x: 180, y: 120, ready: true, tags: ['Auto', 'CRM lookup', 'Web search'] },
			{ id: 'n3', kind: 'tool', title: 'Enrich company', sub: 'Looks the company up by its domain', code: 'GET api.example.com/v2/companies/find', x: 180, y: 215, ready: true },
			{ id: 'n4', kind: 'logic', title: 'Branch', sub: 'plan = Pro', code: 'Yes → Notify team · No → Create record', x: 180, y: 310, ready: true },
			{ id: 'n5', kind: 'action', title: 'Notify team', sub: '#sales in Chat', code: 'New Pro signup: {{user.name}}', x: 80, y: 410, ready: true },
			{ id: 'n7', kind: 'action', title: 'Create record', sub: 'Adds the customer', code: 'customers · insert', x: 290, y: 410, ready: true }
		] as WNode[]),
		edges = $bindable([['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n5', 'Yes'], ['n4', 'n7', 'No']] as [string, string, string?][]),
		onpublish
	}: { nodes?: WNode[]; edges?: [string, string, string?][]; onpublish?: () => void } = $props();
	let active = $state('wf');
	let zoom = $state(0.94);
	let sel = $state<string | null>(null);
	let drag: { id: string; dx: number; dy: number } | null = null;
	let palette = $state(true);
	let published = $state(false);
	const W = 150,
		H = 70;
	const nav = [{ items: [{ id: 'wf', label: 'Workflows', icon: '⛬' }, { id: 'runs', label: 'Runs', icon: '◷', count: 3 }, { id: 'tpl', label: 'Templates', icon: '▤' }, { id: 'int', label: 'Integrations', icon: '⊞' }, { id: 'vars', label: 'Variables', icon: '{}' }, { id: 'data', label: 'Data tables', icon: '▦' }] }, { label: 'Workspace', items: [{ id: 'kn', label: 'Knowledge', icon: '▤' }, { id: 'set', label: 'Settings', icon: '⚙' }] }];
	const groups: [string, WNode['kind'], string[]][] = [['Triggers', 'trigger', ['New signup', 'Document upload', 'Schedule', 'Webhook']], ['Tools', 'tool', ['AI Agent', 'HTTP request', 'Calculation', 'File parser', 'Validation']], ['Logic', 'logic', ['Branch', 'Merge', 'Wait', 'Loop']], ['Actions', 'action', ['Database', 'Notification', 'Send email', 'Webhook call', 'End']]];
	const byId = (id: string) => nodes.find((n) => n.id === id)!;
	function add(kind: WNode['kind'], title: string) {
		const id = 'n' + (nodes.length + 10);
		const last = sel ? byId(sel) : nodes[nodes.length - 1];
		nodes = [...nodes, { id, kind: kind === 'tool' && title === 'AI Agent' ? 'agent' : kind, title, sub: 'Not configured', x: last.x + 20, y: last.y + 100, ready: false }];
		if (last) edges = [...edges, [last.id, id]];
		sel = id;
	}
	function down(e: PointerEvent, n: WNode) {
		sel = n.id;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		drag = { id: n.id, dx: e.clientX / zoom - n.x, dy: e.clientY / zoom - n.y };
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const d = drag;
		nodes = nodes.map((n) => (n.id === d.id ? { ...n, x: Math.round(e.clientX / zoom - d.dx), y: Math.round(e.clientY / zoom - d.dy) } : n));
	}
	const curve = (a: WNode, b: WNode) => `M${a.x + W / 2},${a.y + H} C${a.x + W / 2},${a.y + H + 30} ${b.x + W / 2},${b.y - 30} ${b.x + W / 2},${b.y}`;
	const selNode = $derived(sel ? nodes.find((n) => n.id === sel) : undefined);
</script>

<AppShell workspace="Northwind" {nav} bind:active cards={false}>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs"><b>Northwind</b> <span class="ui-ag-pill" data-tone="blue">Team</span> / Customer onboarding / Main <span class="ui-ag-pill" data-tone="gray">Production</span></span><button class="ui-ag-btn" data-variant="primary" onclick={() => ((published = true), onpublish?.())}>{published ? '✓ Published' : '⚡ Publish'}</button></div>
	<div class="ui-wfb">
		{#if palette}
			<aside class="ui-ag-card ui-wfb__pal" aria-label="Nodes">
				<div class="ui-ag-row"><b class="ui-ag-grow">Nodes</b><button class="ui-ag-btn" data-variant="ghost" aria-label="Close nodes" onclick={() => (palette = false)}>×</button></div>
				{#each groups as [g, kind, items] (g)}<small>{g} {items.length}</small>{#each items as it (it)}<button class="ui-wfb__pi" onclick={() => add(kind, it)}>{it}</button>{/each}{/each}
			</aside>
		{/if}
		<div class="ui-wfb__canvas" role="application" aria-label="Workflow canvas" onpointermove={move} onpointerup={() => (drag = null)}>
			<div class="ui-wfb__world" style:transform="scale({zoom})">
				<svg aria-hidden="true">{#each edges as [a, b, label] (a + b)}{@const A = byId(a)}{@const B = byId(b)}{#if A && B}<path d={curve(A, B)} />{#if label}<text x={(A.x + B.x) / 2 + W / 2} y={(A.y + H + B.y) / 2}>{label}</text>{/if}{/if}{/each}</svg>
				{#each nodes as n (n.id)}
					<div class="ui-wfb__node" role="button" tabindex="0" data-kind={n.kind} data-sel={sel === n.id || undefined} style:left="{n.x}px" style:top="{n.y}px" aria-label="{n.kind} {n.title}" onpointerdown={(e) => down(e, n)} onkeydown={(e) => { if (e.key === 'Delete') { nodes = nodes.filter((x) => x.id !== n.id); edges = edges.filter(([a, b]) => a !== n.id && b !== n.id); } }}>
						<small class="ui-wfb__kind">{n.kind}</small>
						<div class="ui-ag-row"><b class="ui-ag-grow">{n.title}</b>{#if n.ready}<span class="ui-ag-pill" data-tone="gray">Ready</span>{:else}<span class="ui-ag-pill" data-tone="red">Not configured</span>{/if}</div>
						<small>{n.sub}</small>
						{#if n.tags}<span class="ui-ag-row">{#each n.tags as t (t)}<span class="ui-ag-pill" data-tone="gray">{t}</span>{/each}</span>{:else if n.code}<code>{n.code}</code>{/if}
					</div>
				{/each}
			</div>
			<div class="ui-ag-card ui-wfb__tools"><button class="ui-ag-btn" data-variant="ghost" aria-label="Show nodes" onclick={() => (palette = !palette)}>+</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Zoom out" onclick={() => (zoom = Math.max(0.5, +(zoom - 0.1).toFixed(2)))}>−</button><small>{Math.round(zoom * 100)}%</small><button class="ui-ag-btn" data-variant="ghost" aria-label="Zoom in" onclick={() => (zoom = Math.min(1.5, +(zoom + 0.1).toFixed(2)))}>+</button></div>
			{#if selNode}<div class="ui-ag-card ui-wfb__insp ui-ag-in"><small>{selNode.kind}</small><label>Name<input class="ui-ag-input" value={selNode.title} oninput={(e) => (nodes = nodes.map((n) => (n.id === selNode.id ? { ...n, title: e.currentTarget.value } : n)))} /></label><label class="ui-ag-row"><input type="checkbox" checked={!!selNode.ready} onchange={() => (nodes = nodes.map((n) => (n.id === selNode.id ? { ...n, ready: !n.ready } : n)))} /> Configured</label></div>{/if}
		</div>
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-wfb {
		position: relative;
		display: flex;
		height: calc(100% - 41px);
	}
	.ui-wfb__pal {
		width: 140px;
		margin: 8px;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		overflow-y: auto;
		flex: none;
		z-index: 1;
	}
	.ui-wfb__pal small {
		margin: 8px 4px 2px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 8.5px;
	}
	.ui-wfb__pi {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		text-align: left;
		padding: 4px;
		border-radius: 5px;
		cursor: pointer;
	}
	.ui-wfb__pi:hover {
		background: var(--ag-fill);
	}
	.ui-wfb__canvas {
		position: relative;
		flex: 1;
		overflow: hidden;
		background: radial-gradient(circle, var(--ag-line) 1px, transparent 1.2px) 0 0 / 14px 14px;
		touch-action: none;
	}
	.ui-wfb__world {
		position: absolute;
		inset: 0;
		transform-origin: 0 0;
		transition: transform 0.2s var(--ag-ease);
	}
	svg {
		position: absolute;
		inset: 0;
		width: 1200px;
		height: 1000px;
		overflow: visible;
		fill: none;
		stroke: var(--ag-subtle);
	}
	text {
		font-size: 8px;
		fill: var(--ag-muted);
		stroke: none;
	}
	.ui-wfb__node {
		position: absolute;
		width: 150px;
		box-sizing: border-box;
		padding: 7px 8px;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		display: grid;
		gap: 3px;
		cursor: grab;
		user-select: none;
	}
	.ui-wfb__node[data-sel] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px var(--ag-blue);
	}
	.ui-wfb__kind {
		position: absolute;
		top: -14px;
		left: 0;
		font-size: 7.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 1px 4px;
		border-radius: 3px;
		background: color-mix(in srgb, var(--ag-blue) 10%, transparent);
		color: var(--ag-blue);
	}
	[data-kind='agent'] .ui-wfb__kind {
		background: color-mix(in srgb, #a855f7 12%, transparent);
		color: #a855f7;
	}
	[data-kind='logic'] .ui-wfb__kind {
		background: color-mix(in srgb, var(--ag-amber) 12%, transparent);
		color: var(--ag-amber);
	}
	[data-kind='action'] .ui-wfb__kind {
		background: color-mix(in srgb, var(--ag-green) 12%, transparent);
		color: var(--ag-green);
	}
	code {
		font-size: 8.5px;
		color: var(--ag-muted);
		background: var(--ag-fill);
		border-radius: 4px;
		padding: 3px 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-wfb__tools {
		position: absolute;
		left: 50%;
		bottom: 12px;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 3px;
	}
	.ui-wfb__insp {
		position: absolute;
		right: 10px;
		top: 10px;
		width: 160px;
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-wfb__insp label {
		display: grid;
		gap: 4px;
	}
	.ui-wfb__insp label.ui-ag-row {
		display: flex;
	}
</style>
