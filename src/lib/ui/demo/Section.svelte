<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		zoom?: number;
		children?: Snippet;
	};

	let { label, zoom = 1, children }: Props = $props();
	const contentZoom = $derived(Number.isFinite(zoom) && zoom > 0 ? zoom : 1);
</script>

<section class="demo-section" aria-label={label}>
	<h2 class="demo-section__label">{label}</h2>
	<div class="demo-section__content" style:--demo-section-zoom={contentZoom}>
		{@render children?.()}
	</div>
</section>

<style>
	.demo-section {
		display: grid;
		gap: 10px;
		min-width: 0;
		padding: 14px;
		border: 1px solid var(--aui-border, rgba(28, 25, 23, 0.1));
		border-radius: var(--aui-radius-lg, 10px);
		background: var(--aui-surface-muted, #f7f6f3);
		color: var(--aui-ink, rgba(28, 25, 23, 0.88));
		font-family: var(--aui-font, ui-sans-serif, system-ui, sans-serif);
	}

	.demo-section__label {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		line-height: 16px;
		letter-spacing: 0.045em;
		color: var(--aui-muted, rgba(28, 25, 23, 0.58));
	}

	.demo-section__content {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		transform: scale(var(--demo-section-zoom, 1));
		transform-origin: top left;
	}
</style>
