<!-- Toaster – stacked notifications for actions (save, delete with undo, upload with progress, sync); the stack fans out on hover and F8 jumps to it. -->
<script lang="ts" module>
	export type Toast = { id: number; title: string; detail?: string; tone?: 'ok' | 'err' | 'load'; undo?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import '../agents/agents.css';
	let { file = 'Q3 Board Report', meta = 'Finance · edited 2 min ago', toasts = $bindable([{ id: 1, title: 'Draft saved', detail: 'Q3 Board Report · all changes kept', tone: 'ok' }] as Toast[]), autoplay = true }: { file?: string; meta?: string; toasts?: Toast[]; autoplay?: boolean } = $props();
	let hover = $state(false);
	let region = $state<HTMLElement>();
	let n = 10;
	function push(t: Omit<Toast, 'id'>, ms = 4000) {
		const id = ++n;
		toasts = [{ ...t, id }, ...toasts].slice(0, 5);
		if (t.tone === 'load') setTimeout(() => (toasts = toasts.map((x) => (x.id === id ? { ...x, title: 'Report uploaded', detail: 'Shared with 4 people in Finance', tone: 'ok' } : x))), 2200);
		setTimeout(() => dismiss(id), ms);
	}
	const dismiss = (id: number) => (toasts = toasts.filter((t) => t.id !== id));
	const acts: [string, string, () => void][] = [
		['▤', 'Save draft', () => push({ title: 'Draft saved', detail: 'Q3 Board Report · all changes kept', tone: 'ok' })],
		['🗑', 'Delete file', () => push({ title: 'File deleted', detail: file, tone: 'err', undo: true }, 6000)],
		['⇪', 'Upload report', () => push({ title: 'Uploading report…', detail: 'Q3-Board-Report.pdf · 4.2 MB', tone: 'load' })],
		['⟳', 'Sync', () => push({ title: 'Synced', detail: 'Everything is up to date', tone: 'ok' })]
	];
	onMount(() => play([[2600, () => acts[2][2]()], [5200, () => acts[0][2]()], [3600, () => acts[3][2]()]], { autoplay, still: 0, loop: () => {} }));
</script>

<svelte:window onkeydown={(e) => e.key === 'F8' && (e.preventDefault(), region?.focus())} />

<div class="ui-ag ui-tst">
	<div class="ui-ag-card ui-tst__file">
		<div class="ui-ag-row"><span class="ui-tst__doc">▤</span><span><b>{file}</b><small>{meta}</small></span></div>
		<div class="ui-tst__acts">{#each acts as [ic, label, fn] (label)}<button class="ui-ag-btn" onclick={fn}><span>{ic}</span>{label}</button>{/each}</div>
	</div>
	<small class="ui-tst__hint">Press <span class="ui-ag-kbd">F8</span> to jump to notifications</small>
	<section bind:this={region} class="ui-tst__stack" style:--n={toasts.length} data-open={hover || undefined} tabindex="-1" aria-label="Notifications" aria-live="polite" onpointerenter={() => (hover = true)} onpointerleave={() => (hover = false)} onfocusin={() => (hover = true)} onfocusout={() => (hover = false)}>
		{#each toasts as t, i (t.id)}
			<div class="ui-ag-card ui-tst__toast" data-tone={t.tone} style:--i={i} style:z-index={10 - i} aria-hidden={!hover && i > 2}>
				<span class="ui-tst__ic">{#if t.tone === 'load'}<span class="ui-ag-spin"></span>{:else if t.tone === 'err'}!{:else}✓{/if}</span>
				<span class="ui-ag-grow"><b>{t.title}</b>{#if t.detail}<small>{t.detail}</small>{/if}</span>
				{#if t.undo}<button class="ui-ag-btn" onclick={() => (dismiss(t.id), push({ title: 'Restored', detail: file, tone: 'ok' }))}>Undo</button>{/if}
				<button class="ui-ag-btn ui-tst__x" data-variant="ghost" aria-label="Dismiss" onclick={() => dismiss(t.id)}>×</button>
			</div>
		{/each}
	</section>
</div>

<style>
	.ui-tst {
		width: 100%;
		max-width: 280px;
		display: grid;
		gap: 10px;
		font-size: 12px;
	}
	b {
		font-weight: 500;
	}
	small {
		display: block;
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-tst__file {
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-tst__doc {
		width: 28px;
		height: 28px;
		border-radius: 7px;
		box-shadow: var(--ag-shadow);
		display: grid;
		place-items: center;
		color: var(--ag-muted);
	}
	.ui-tst__acts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}
	.ui-tst__hint {
		text-align: center;
	}
	.ui-tst__stack {
		display: grid;
		outline: none;
		min-height: 80px;
	}
	.ui-tst__toast {
		grid-area: 1 / 1;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		transform: translateY(calc(var(--i) * 6px)) scale(calc(1 - var(--i) * 0.04));
		transform-origin: bottom center;
		transition:
			transform 0.3s var(--ag-ease),
			opacity 0.3s;
		animation: ui-ag-in 0.3s var(--ag-ease);
	}
	.ui-tst__toast:nth-child(n + 4) {
		opacity: 0;
	}
	.ui-tst__stack[data-open] .ui-tst__toast {
		transform: translateY(calc(var(--i) * 100% + var(--i) * 6px));
		opacity: 1;
	}
	.ui-tst__stack[data-open] {
		min-height: calc(var(--n, 3) * 60px);
	}
	.ui-tst__ic {
		width: 16px;
		height: 16px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		font-size: 9px;
		color: var(--ag-green);
		box-shadow: inset 0 0 0 1.3px currentColor;
	}
	.ui-tst__toast[data-tone='err'] .ui-tst__ic {
		color: var(--ag-red);
	}
	.ui-tst__toast[data-tone='load'] .ui-tst__ic {
		box-shadow: none;
		color: var(--ag-muted);
	}
	.ui-tst__x {
		opacity: 0;
	}
	.ui-tst__toast:hover .ui-tst__x,
	.ui-tst__x:focus-visible {
		opacity: 1;
	}
</style>
