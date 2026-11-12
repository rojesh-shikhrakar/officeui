<!-- Context Window – what fills the model's context as a field of cells: hover a part to light it up, remove files and compact the conversation. -->
<script lang="ts" module>
	export type WindowPart = { id: string; label: string; tokens: number; color: string; compactable?: boolean; files?: { name: string; tokens: number }[] };
</script>

<script lang="ts">
	import NumberTicker from '../motion/NumberTicker.svelte';
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		model = 'sonnet-5-5',
		limit = 200,
		parts = $bindable([
			{ id: 'sys', label: 'System prompt', tokens: 4.2, color: '#2f6bff' },
			{ id: 'tools', label: 'Tools', tokens: 12.8, color: '#5b9cf6' },
			{ id: 'files', label: 'Files', tokens: 46.1, color: '#bcd6fb', files: [{ name: 'schema.prisma', tokens: 9.4 }, { name: 'billing.ts', tokens: 21.3 }, { name: 'meeting-notes.md', tokens: 15.4 }] },
			{ id: 'conv', label: 'Conversation', tokens: 108.6, color: '#a76bf0', compactable: true },
			{ id: 'mem', label: 'Memory', tokens: 3.9, color: '#5fc88a' }
		]),
		autoplay = true,
		onnewchat
	}: { model?: string; limit?: number; parts?: WindowPart[]; autoplay?: boolean; onnewchat?: () => void } = $props();
	let open = $state(false);
	let squeezing = $state(false);
	let saved = $state(0);
	function removeFile(name: string) {
		parts = parts.map((x) => { if (!x.files) return x; const f = x.files.find((y) => y.name === name)!; return { ...x, files: x.files.filter((y) => y.name !== name), tokens: +(x.tokens - f.tokens).toFixed(1) }; });
	}
	onMount(() => play([[2200, () => (open = true)], [2200, () => removeFile('meeting-notes.md')], [1600, () => (open = false)], [1400, () => compact(parts.find((x) => x.compactable)!)]], { autoplay, still: 0 }));
	let hover = $state<string | null>(null);
	const CELLS = 200;
	const used = $derived(parts.reduce((s, p) => s + p.tokens, 0));
	const pct = $derived(Math.round((used / limit) * 100));
	const cells = $derived.by(() => {
		const out: (WindowPart | null)[] = [];
		for (const p of parts) for (let i = 0; i < Math.round((p.tokens / limit) * CELLS); i++) out.push(p);
		while (out.length < CELLS) out.push(null);
		return out.slice(0, CELLS);
	});
	function compact(p: WindowPart) {
		if (!p || squeezing) return;
		squeezing = true;
		setTimeout(() => {
			const before = p.tokens;
			parts = parts.map((x) => (x.id === p.id ? { ...x, tokens: +(x.tokens * 0.28).toFixed(1), compactable: false } : x));
			saved += before - +(before * 0.28).toFixed(1);
			squeezing = false;
		}, 1200);
	}
</script>

<div class="ui-ag ui-ag-panel ui-cwn">
	<div class="ui-ag-head"><b>Context window</b><span class="ui-ag-pill" data-tone="gray">✳ {model}</span></div>
	<div class="ui-ag-body">
		<div class="ui-cwn__big"><NumberTicker value={Math.round(used * 100) / 100} format={{ maximumFractionDigits: 1 }} />K <small class="ui-ag-muted">of {limit}K tokens</small><span class="ui-ag-pill" data-tone={pct > 80 ? 'amber' : 'gray'}>{pct}%</span></div>
		<div class="ui-cwn__grid" aria-hidden="true">{#each cells as c, i (i)}<i style:background={c ? c.color : undefined} data-dim={hover && c?.id !== hover ? '' : undefined} data-squeeze={squeezing && c?.compactable ? '' : undefined} style:animation-delay="{(i % 20) * 30}ms"></i>{/each}</div>
		<ul class="ui-ag-list">
			{#each parts as p (p.id)}
				<li class="ui-ag-item" onpointerenter={() => (hover = p.id)} onpointerleave={() => (hover = null)}>
					<i style:background={p.color}></i>{#if p.files}<button class="ui-cwn__files ui-ag-grow" aria-expanded={open} aria-label="{p.label}{p.tokens}K" onclick={() => (open = !open)}>{p.label} {open ? '⌃' : '⌄'}</button>{:else}<span class="ui-ag-grow">{p.label}</span>{/if}
					{#if p.compactable}<button class="ui-ag-btn" data-variant="ghost" onclick={() => compact(p)}>⇣ Compact</button>{/if}
					<b>{p.tokens}K</b>
				</li>
				{#if p.files && open}{#each p.files as f (f.name)}<li class="ui-cwn__file ui-ag-in"><span class="ui-ag-grow">{f.name}</span><small>{f.tokens}K</small><button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {f.name}" onclick={() => removeFile(f.name)}>×</button></li>{/each}{/if}
			{/each}
		</ul>
	</div>
	<div class="ui-ag-foot"><span style:color={saved ? 'var(--ag-green)' : pct > 80 ? 'var(--ag-amber)' : 'var(--ag-muted)'} style:margin-right="auto">{saved ? `Saved ${saved.toFixed(1)}K tokens` : `${(limit - used).toFixed(1)}K left`}</span><button class="ui-ag-btn" onclick={onnewchat}>New chat →</button></div>
</div>

<style>
	.ui-cwn__files {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 0;
		cursor: pointer;
	}
	.ui-cwn__file {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 4px 2px 22px;
		color: var(--ag-muted);
		font-size: 11px;
	}
	[data-squeeze] {
		animation: ui-ag-breathe 0.6s ease-in-out infinite;
	}
	.ui-cwn {
		max-width: 290px;
		font-size: 12px;
	}
	.ui-cwn__big {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-size: 20px;
		font-weight: 500;
	}
	.ui-cwn__big small {
		font-size: 11px;
		font-weight: 400;
	}
	.ui-cwn__big .ui-ag-pill {
		margin-left: auto;
	}
	.ui-cwn__grid {
		display: grid;
		grid-template-columns: repeat(25, 1fr);
		gap: 2px;
	}
	.ui-cwn__grid i {
		aspect-ratio: 1;
		border-radius: 1.5px;
		background: var(--ag-fill);
		transition: opacity 0.2s;
	}
	.ui-cwn__grid i[data-dim] {
		opacity: 0.2;
	}
	.ui-ag-item {
		padding: 4px 2px;
	}
	.ui-ag-item i {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		flex: none;
	}
	.ui-ag-item b {
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
	.ui-ag-item .ui-ag-btn {
		height: 20px;
		font-size: 11px;
	}
</style>
