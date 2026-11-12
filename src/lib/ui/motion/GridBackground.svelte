<!-- Grid Background – ported from affectUI (MIT). A fine line grid that drifts slowly behind your content and fades out to the edges. -->
<script lang="ts" module>
	export type GridDirection = 'up' | 'down' | 'left' | 'right' | 'diagonal';
	const offsets: Record<GridDirection, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], diagonal: [-1, 1] };
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import './grid-background.css';

	let {
		children,
		size = 48,
		color,
		speed = 3,
		direction = 'diagonal',
		reveal = true,
		fade = 70,
		class: cls
	}: {
		/** Content rendered above the grid */
		children?: Snippet;
		/** Cell size in px */
		size?: number;
		/** Line color – defaults to a faint black, or faint white in dark mode */
		color?: string;
		/** Seconds per cell; 0 keeps the grid still */
		speed?: number;
		direction?: GridDirection;
		/** Uncover the grid with a growing circle when it first comes into view */
		reveal?: boolean;
		/** Radius of the edge fade, in % */
		fade?: number;
		class?: string;
	} = $props();

	let el: HTMLDivElement;
	// svelte-ignore state_referenced_locally
	let shown = $state(!reveal);
	onMount(() => {
		if (!reveal || typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return void (shown = true);
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					shown = true;
					io.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
	const d = $derived(offsets[direction] ?? offsets.diagonal);
</script>

<div
	bind:this={el}
	class={['ui-gb', cls]}
	style:--ui-gb-size="{size}px"
	style:--ui-gb-dx="{d[0] * size}px"
	style:--ui-gb-dy="{d[1] * size}px"
	style:--ui-gb-speed="{Math.max(speed, 0)}s"
	style:--ui-gb-fade="{fade}%"
	style:--ui-gb-line={color}
	data-reveal={reveal ? '' : undefined}
	data-shown={shown ? '' : undefined}
	data-static={speed > 0 ? undefined : ''}
>
	<div class="ui-gb-grid" aria-hidden="true"><div class="ui-gb-reveal"><div class="ui-gb-lines"></div></div></div>
	<div class="ui-gb-content">{#if children}{@render children()}{:else}<p class="ui-gb-demo">Your content, above a drifting grid</p>{/if}</div>
</div>

<style>
	.ui-gb-demo {
		margin: 0;
		padding: 80px 24px;
		text-align: center;
		font: 500 20px/1.3 var(--aui-font, Inter, ui-sans-serif, system-ui, sans-serif);
		color: var(--aui-ink, #171717);
		letter-spacing: -0.02em;
	}
</style>
