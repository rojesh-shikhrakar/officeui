<!-- A labelled code block with copy and "Show all" (Tool Call Card helper) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toText, highlight, copyText } from './tool-call.svelte';
	let { label, value, cap }: { label: string; value: unknown; cap: number } = $props();
	const OPEN_MAX = 640;
	const t = $derived(toText(value));
	let pre: HTMLPreElement;
	let full = $state(false);
	let height = $state(0);
	let copied = $state(false);
	const capped = $derived(height > cap + 24);
	onMount(() => {
		const measure = () => (height = pre.scrollHeight);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(pre.firstElementChild!);
		return () => ro.disconnect();
	});
	$effect(() => {
		if (!copied) return;
		const x = setTimeout(() => (copied = false), 1400);
		return () => clearTimeout(x);
	});
</script>

<div class="ui-tclc__section">
	<div class="ui-tclc__section-head">
		<span class="ui-tclc__label">{label}</span>
		<button
			type="button"
			class="ui-tclc__copy"
			data-copied={copied || undefined}
			aria-label={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}
			title={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}
			onclick={() => copyText(t.text).then((ok) => ok && (copied = true))}
		>
			<svg class="ui-tclc__copy-icon" viewBox="0 0 16 16" aria-hidden="true"
				><rect x="5.5" y="5.5" width="8.5" height="8.5" rx="2" /><path d="M10.5 3.75v-.25A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h.25" /></svg
			>
			<svg class="ui-tclc__copy-done" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength="1" /></svg>
		</button>
	</div>
	<pre
		bind:this={pre}
		class="ui-tclc__code"
		data-capped={(capped && !full) || undefined}
		data-scroll={(capped && full && height > OPEN_MAX) || undefined}
		style:max-height={capped ? `${full ? Math.min(height, OPEN_MAX) : cap}px` : undefined}><code
			>{#if t.json}{#each highlight(t.text) as [s, k], i (i)}{#if k}<span class="ui-tclc__t-{k}">{s}</span>{:else}{s}{/if}{/each}{:else}{t.text}{/if}</code
		></pre>
	{#if capped}<button type="button" class="ui-tclc__more" aria-expanded={full} onclick={() => (full = !full)}>{full ? 'Show less' : 'Show all'}</button>{/if}
</div>
