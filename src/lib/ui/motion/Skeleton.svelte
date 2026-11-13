<!-- Skeleton – A placeholder block with a shimmer while content loads. -->
<script lang="ts">
	import './shimmer-loader.css';
	let {
		width,
		height,
		radius,
		circle = false,
		lines = 1,
		class: cls,
		style
	}: {
		/** A number is px, a string any CSS length; defaults to 100% */
		width?: number | string;
		/** Defaults to 12px */
		height?: number | string;
		/** Defaults to 6px */
		radius?: number | string;
		/** Round shape – uses width for both sides */
		circle?: boolean;
		/** More than 1 renders a paragraph of lines, the last one shorter */
		lines?: number;
		class?: string;
		style?: string;
	} = $props();
	const len = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);
	const w = $derived(len(width));
</script>

{#if lines > 1}
	<div class={cls} aria-hidden="true" {style} style:display="grid" style:gap="8px">
		{#each Array(lines) as _, i (i)}<span class="ui-shm" style:width={i === lines - 1 ? '62%' : w} style:height={len(height)} style:border-radius={len(radius)}></span>{/each}
	</div>
{:else}
<span
	class={['ui-shm', cls]}
	aria-hidden="true"
	{style}
	style:flex-shrink={circle || typeof width === 'number' ? 0 : undefined}
	style:width={w}
	style:height={circle ? (w ?? len(height)) : len(height)}
	style:border-radius={circle ? '50%' : len(radius)}
></span>
{/if}
