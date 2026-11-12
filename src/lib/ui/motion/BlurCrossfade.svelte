<!-- Blur Crossfade – swaps content with a soft blur while the box glides to the new content's size. Wrap anything; change `key` to swap. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { key, duration = 320, children }: { key: unknown; duration?: number; children: Snippet } = $props();
	let inner = $state<HTMLDivElement>();
	let h = $state<number | null>(null);
	$effect(() => {
		if (!inner) return;
		const ro = new ResizeObserver(() => (h = inner!.offsetHeight));
		ro.observe(inner);
		return () => ro.disconnect();
	});
	function blur(_node: Element, { out = false } = {}) {
		return { duration, css: (t: number) => `opacity:${t};filter:blur(${(1 - t) * 6}px);transform:scale(${0.98 + t * 0.02});${out ? 'position:absolute;inset:0 0 auto 0;' : ''}` };
	}
</script>

<div class="ui-bxf" style:height={h === null ? undefined : `${h}px`} style:--d="{duration}ms">
	<div bind:this={inner}>
		{#key key}<div in:blur out:blur={{ out: true }}>{@render children()}</div>{/key}
	</div>
</div>

<style>
	.ui-bxf {
		position: relative;
		overflow: hidden;
		transition: height var(--d) cubic-bezier(0.16, 1, 0.3, 1);
	}
	.ui-bxf > div {
		position: relative;
	}
</style>
