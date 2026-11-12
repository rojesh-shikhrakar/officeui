<!-- Gradient Floor – a blurred colour gradient glowing up from the bottom edge; two layers drift against each other so it never looks still. -->
<script lang="ts">
	let { colors = ['#ff8a65', '#f472b6', '#a78bfa', '#60a5fa', '#a5f3fc'], height = 360, speed = 1, class: cls }: { colors?: string[]; height?: number; speed?: number; class?: string } = $props();
	const stops = $derived(colors.map((c, i) => `radial-gradient(40% 70% at ${10 + (i * 80) / Math.max(1, colors.length - 1)}% 100%, ${c}, transparent 70%)`).join(','));
</script>

<div class={['ui-gfl', cls]} style:height="{height}px" style:--s={speed} aria-hidden="true">
	<i style:background={stops}></i>
	<i style:background={stops}></i>
	<b></b>
</div>

<style>
	.ui-gfl {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 16px;
		background: #fafafa;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
	}
	i {
		position: absolute;
		inset: 20% -10% -30%;
		filter: blur(36px) saturate(1.2);
		opacity: 0.85;
		animation: ui-gfl-a calc(14s / var(--s)) ease-in-out infinite alternate;
	}
	i + i {
		opacity: 0.5;
		transform: scaleX(-1);
		animation-name: ui-gfl-b;
		animation-duration: calc(19s / var(--s));
	}
	b {
		position: absolute;
		left: 25%;
		right: 25%;
		bottom: -40px;
		height: 90px;
		background: radial-gradient(closest-side, #fff, transparent);
		filter: blur(10px);
	}
	@keyframes ui-gfl-a {
		to {
			transform: translateX(6%) scaleY(1.1);
		}
	}
	@keyframes ui-gfl-b {
		to {
			transform: scaleX(-1) translateX(8%) scaleY(0.9);
		}
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-gfl {
		background: #0a0a0a;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-gfl b {
		opacity: 0.2;
	}
	@media (prefers-reduced-motion: reduce) {
		i {
			animation: none;
		}
	}
</style>
