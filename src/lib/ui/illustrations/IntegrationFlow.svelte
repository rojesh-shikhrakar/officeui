<!-- Integration Flow – integration pills ride along a dashed arc, and the one passing the centre beams its data into your product's pill on a warm gradient. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { mark, type Mark } from './marks';
	let {
		product = { title: 'Data Analysis', sub: 'Centralized data processing' },
		items = [
			{ title: 'API Integration', sub: 'Identity', m: mark(5) },
			{ title: 'API Integration', sub: 'Warehouse', m: mark(10) },
			{ title: 'API Integration', sub: 'Chat', m: mark(3) },
			{ title: 'API Integration', sub: 'Payments', m: mark(1) },
			{ title: 'API Integration', sub: 'CRM', m: mark(7) }
		] as { title: string; sub: string; m: Mark }[],
		autoplay = true
	}: { product?: { title: string; sub: string }; items?: { title: string; sub: string; m: Mark }[]; autoplay?: boolean } = $props();
	let at = $state(1);
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = setInterval(() => (at = (at + 1) % items.length), 2200);
		return () => clearInterval(t);
	});
	const off = (i: number) => ((i - at + items.length + Math.floor(items.length / 2)) % items.length) - Math.floor(items.length / 2);
</script>

<div class="ui-ifl">
	<svg class="ui-ifl__arc" viewBox="0 0 400 400" aria-hidden="true"><circle cx="560" cy="200" r="290" /></svg>
	<div class="ui-ifl__beam" aria-hidden="true"></div>
	<div class="ui-ifl__pill ui-ifl__main"><span><b>{product.title}</b><small>{product.sub}</small></span><i>✺</i></div>
	{#each items as it, i (i)}
		{@const o = off(i)}
		<button class="ui-ifl__pill ui-ifl__item" style:--o={o} style:--a={Math.abs(o)} data-on={o === 0 || undefined} aria-label="{it.title}: {it.sub}" onclick={() => (at = i)}>
			<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d={it.m.d} fill={it.m.color} fill-rule="evenodd" /></svg></i><span><b>{it.title}</b><small>{it.sub}</small></span>
		</button>
	{/each}
</div>

<style>
	.ui-ifl {
		position: relative;
		width: 680px;
		max-width: 100%;
		aspect-ratio: 894 / 520;
		overflow: hidden;
		border-radius: 16px;
		background:
			radial-gradient(60% 70% at 30% 55%, #f9855f, transparent 70%),
			radial-gradient(60% 80% at 80% 30%, #f87171, transparent 70%),
			linear-gradient(180deg, #fda4a4, #fbd4c8 75%, #fff);
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
		container-type: inline-size;
	}
	.ui-ifl__arc {
		position: absolute;
		inset: -20% 0 -20% 50%;
		height: 140%;
		fill: none;
		stroke: rgba(255, 255, 255, 0.7);
		stroke-dasharray: 6 8;
	}
	.ui-ifl__beam {
		position: absolute;
		left: 42%;
		width: 17%;
		top: 50%;
		height: 2px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
		animation: ui-ifl-beam 2.2s ease-in-out infinite;
	}
	@keyframes ui-ifl-beam {
		0%,
		100% {
			opacity: 0.2;
		}
		50% {
			opacity: 1;
		}
	}
	.ui-ifl__pill {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 1.2cqw;
		padding: 1cqw 2.4cqw 1cqw 1cqw;
		border: 0;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(8px);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
		font: inherit;
		color: #1f1f1f;
		text-align: left;
	}
	.ui-ifl__pill b {
		display: block;
		font-weight: 400;
		font-size: 2cqw;
	}
	.ui-ifl__pill small {
		font-size: 1.6cqw;
		color: #5a5a5a;
	}
	.ui-ifl__pill i {
		width: 4.4cqw;
		height: 4.4cqw;
		border-radius: 50%;
		background: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 2.4cqw;
		flex: none;
	}
	.ui-ifl__pill i svg {
		width: 55%;
	}
	.ui-ifl__main {
		left: 7%;
		top: 50%;
		transform: translateY(-50%);
		padding: 1cqw 1cqw 1cqw 3cqw;
		text-align: right;
		background: rgba(255, 255, 255, 0.75);
	}
	.ui-ifl__item {
		left: 57%;
		top: 50%;
		cursor: pointer;
		transform: translate(calc(var(--a) * 4cqw), calc(-50% + var(--o) * 15.5cqw));
		opacity: calc(1 - var(--a) * 0.4);
		transition:
			transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.8s;
	}
	.ui-ifl__item[data-on] {
		background: rgba(255, 255, 255, 0.75);
	}
</style>
