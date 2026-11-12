<!-- Context Map – what fills an agent's context window, as a living treemap: system prompt, tools, memory, every file, the chat and tool results as tiles that glide as it grows. Remove a tile, or compact when it gets full and compare before and after. -->
<script lang="ts" module>
	export type ContextPart = { id: string; label: string; tokens: number; kind: 'system' | 'tools' | 'memory' | 'file' | 'chat' | 'result' | 'search' | 'docs' };
	type Box = { x: number; y: number; w: number; h: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	const P = (id: string, label: string, tokens: number, kind: ContextPart['kind']): ContextPart => ({ id, label, tokens, kind });
	let {
		agent = 'Checkout fixer',
		limit = $bindable(200),
		parts = $bindable([P('sys', 'System prompt', 6.2, 'system'), P('tools', 'Tool definitions', 14.8, 'tools'), P('mem', 'Project memory', 9.4, 'memory'), P('spec', 'checkout.spec.ts', 6.8, 'file')] as ContextPart[]),
		autoplay = true,
		oncompact
	}: { agent?: string; limit?: number; parts?: ContextPart[]; autoplay?: boolean; oncompact?: (before: number, after: number) => void } = $props();
	let compacted = $state<{ before: number; after: number } | null>(null);
	let shimmer = $state(false);
	let fresh = $state<string | null>(null);
	const used = $derived(parts.reduce((s, p) => s + p.tokens, 0));
	const pct = $derived(Math.round((used / limit) * 100));
	const kindLabel: Record<string, string> = { file: 'File', chat: 'Chat', result: 'Tool result', search: 'Search', docs: 'Docs', tools: 'Tools', system: 'System prompt', memory: 'Memory' };
	// Binary-split treemap: split the list where the weights balance, cut along the longer side
	function layout(items: { id: string; v: number }[], b: Box, out: Record<string, Box>) {
		if (!items.length) return;
		if (items.length === 1) return void (out[items[0].id] = b);
		const total = items.reduce((s, i) => s + i.v, 0);
		let acc = 0, k = 0;
		while (k < items.length - 1 && acc + items[k].v < total / 2) acc += items[k++].v;
		k = Math.max(1, k);
		const a = items.slice(0, k), c = items.slice(k);
		const fa = a.reduce((s, i) => s + i.v, 0) / total;
		if (b.w * 1.6 >= b.h) (layout(a, { ...b, w: b.w * fa }, out), layout(c, { ...b, x: b.x + b.w * fa, w: b.w * (1 - fa) }, out));
		else (layout(a, { ...b, h: b.h * fa }, out), layout(c, { ...b, y: b.y + b.h * fa, h: b.h * (1 - fa) }, out));
	}
	const boxes = $derived.by(() => {
		const out: Record<string, Box> = {};
		layout([...parts.map((p) => ({ id: p.id, v: p.tokens })), { id: 'free', v: Math.max(limit - used, 0.01) }], { x: 0, y: 0, w: 100, h: 100 }, out);
		return out;
	});
	function add(p: ContextPart) {
		parts = [...parts, p];
		fresh = p.id;
	}
	function compact() {
		const before = used;
		shimmer = true;
		setTimeout(() => {
			parts = parts.map((p) => (p.kind === 'chat' || p.kind === 'result' || p.kind === 'search' ? { ...p, tokens: +(p.tokens * 0.2).toFixed(1) } : p));
			shimmer = false;
			compacted = { before, after: parts.reduce((s, p) => s + p.tokens, 0) };
			oncompact?.(compacted.before, compacted.after);
		}, 1100);
	}
	onMount(() =>
		play(
			[
				[1000, () => add(P('pay', 'payment.ts', 17.6, 'file'))],
				[900, () => add(P('chat', 'Chat', 11.8, 'chat'))],
				[900, () => add(P('co', 'checkout.ts', 8.2, 'file'))],
				[1000, () => add(P('test', 'Test run · 20×', 22.4, 'result'))],
				[900, () => add(P('stripe', 'payments docs', 11.8, 'docs'))],
				[900, () => add(P('rec', 'receipt.tsx', 23.8, 'file'))],
				[900, () => (parts = parts.map((p) => (p.id === 'chat' ? { ...p, tokens: 31.9 } : p)))],
				[900, () => add(P('search', 'Search results', 15.6, 'search'))]
			],
			{ autoplay, still: 3 }
		)
	);
</script>

<div class="ui-ag ui-cmp">
	<div class="ui-ag-title"><span class="ui-cmp__logo"></span><b>Context</b><button class="ui-ag-chip" aria-label="{agent}, {limit}k" onclick={() => (limit = limit === 200 ? 1000 : 200)}><span style:color="#d97757">✳</span> {agent} <em>{limit}k</em> ⌄</button><span class="ui-ag-meta"><b style:color="var(--ag-ink)">{Math.round(used)}k</b> / {limit}k <span class="ui-ag-pill" data-tone={pct >= 80 ? 'amber' : 'gray'}>{pct}%</span>{#if pct >= 80 && !compacted}<button class="ui-ag-btn" disabled={shimmer} onclick={compact}>⇣ Compact</button>{/if}</span></div>
	<div class="ui-ag-card ui-cmp__map" role="img" aria-label="Context: {Math.round(used)}k of {limit}k tokens used">
		{#each [...parts, { id: 'free', label: 'Free', tokens: limit - used, kind: 'free' as const }] as p (p.id)}
			{@const b = boxes[p.id]}
			{#if b}
				<div class="ui-cmp__tile" data-kind={p.kind} data-fresh={fresh === p.id || undefined} data-shimmer={shimmer && (p.kind === 'chat' || p.kind === 'result' || p.kind === 'search') ? '' : undefined} style:left="{b.x}%" style:top="{b.y}%" style:width="{b.w}%" style:height="{b.h}%">
					<span><b>{p.label}</b><small>{p.tokens.toFixed(1)}k{p.id !== 'free' && b.w > 14 ? ` · ${kindLabel[p.kind]}` : ''}</small></span>
					{#if p.kind === 'file' || p.kind === 'search' || p.kind === 'docs'}<button aria-label="Remove {p.label}" onclick={() => (parts = parts.filter((x) => x.id !== p.id))}>×</button>{/if}
				</div>
			{/if}
		{/each}
	</div>
	<small class="ui-cmp__foot">{#if compacted}Compacted: <b>{compacted.before.toFixed(1)}k</b> → <b>{compacted.after.toFixed(1)}k</b>, saved {(compacted.before - compacted.after).toFixed(1)}k tokens{:else}Not compacted yet – once it is, compare before and after here.{/if}</small>
</div>

<style>
	.ui-cmp {
		width: 100%;
		max-width: 640px;
		display: grid;
		gap: 8px;
		font-size: 12px;
	}
	.ui-cmp__logo {
		width: 11px;
		height: 11px;
		border-radius: 2px;
		background: linear-gradient(90deg, var(--ag-blue) 50%, color-mix(in srgb, var(--ag-blue) 40%, transparent) 50%);
	}
	.ui-ag-chip em {
		font-style: normal;
		font-size: 10px;
		padding: 0 4px;
		border-radius: 4px;
		background: var(--ag-fill);
	}
	.ui-cmp__map {
		position: relative;
		height: 170px;
		padding: 0;
		overflow: hidden;
	}
	.ui-cmp__tile {
		position: absolute;
		box-sizing: border-box;
		border: 2px solid var(--ag-surface);
		border-radius: 8px;
		padding: 5px 6px;
		overflow: hidden;
		display: flex;
		align-items: flex-start;
		background: var(--t, var(--ag-fill));
		color: var(--tc, var(--ag-ink));
		transition:
			left 0.6s var(--ag-ease),
			top 0.6s var(--ag-ease),
			width 0.6s var(--ag-ease),
			height 0.6s var(--ag-ease);
	}
	.ui-cmp__tile[data-fresh] {
		animation: ui-ag-rise 0.5s var(--ag-ease);
	}
	.ui-cmp__tile span {
		display: grid;
		min-width: 0;
		flex: 1;
	}
	.ui-cmp__tile b,
	.ui-cmp__tile small {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 10.5px;
	}
	.ui-cmp__tile b {
		font-weight: 500;
	}
	.ui-cmp__tile small {
		opacity: 0.75;
		font-size: 9.5px;
	}
	[data-kind='system'] {
		--t: color-mix(in srgb, var(--ag-ink) 7%, transparent);
	}
	[data-kind='tools'],
	[data-kind='file'],
	[data-kind='docs'] {
		--t: color-mix(in srgb, var(--ag-blue) 11%, transparent);
		--tc: color-mix(in srgb, var(--ag-blue) 85%, var(--ag-ink));
	}
	[data-kind='memory'],
	[data-kind='chat'] {
		--t: color-mix(in srgb, #a855f7 12%, transparent);
		--tc: color-mix(in srgb, #a855f7 80%, var(--ag-ink));
	}
	[data-kind='result'],
	[data-kind='search'] {
		--t: color-mix(in srgb, #f97316 14%, transparent);
		--tc: color-mix(in srgb, #f97316 80%, var(--ag-ink));
	}
	[data-kind='free'] {
		--t: repeating-linear-gradient(135deg, transparent 0 5px, color-mix(in srgb, var(--ag-ink) 4%, transparent) 5px 6px);
		--tc: var(--ag-subtle);
		border-style: solid;
		box-shadow: inset 0 0 0 1px var(--ag-line);
	}
	[data-shimmer] {
		background-image: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.7) 50%, transparent 70%);
		background-size: 250% 100%;
		animation: ui-ag-sheen 0.9s linear infinite;
	}
	.ui-cmp__tile button {
		border: 0;
		background: none;
		color: inherit;
		cursor: pointer;
		opacity: 0;
		padding: 0 2px;
	}
	.ui-cmp__tile:hover button,
	.ui-cmp__tile button:focus-visible {
		opacity: 0.8;
	}
	.ui-cmp__foot {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-cmp__foot b {
		color: var(--ag-ink);
		font-weight: 500;
	}
</style>
