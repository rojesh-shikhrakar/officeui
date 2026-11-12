<!-- Skeleton – ported from affectUI (MIT). A placeholder block with a shimmer while content loads. -->
<script lang="ts">
	import './shimmer-loader.css';
	let {
		width,
		height,
		radius,
		circle = false,
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
		class?: string;
		style?: string;
	} = $props();
	const len = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v);
	const w = $derived(len(width));
</script>

<span
	class={['ui-shm', cls]}
	aria-hidden="true"
	{style}
	style:flex-shrink={circle || typeof width === 'number' ? 0 : undefined}
	style:width={w}
	style:height={circle ? (w ?? len(height)) : len(height)}
	style:border-radius={circle ? '50%' : len(radius)}
></span>
