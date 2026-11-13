<!-- Carousel – snippet slides, swipe + arrow keys, overlay or below controls, dot pager. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './carousel.css';

	type Props = {
		/** One snippet per slide */
		slides?: Snippet[];
		perView?: number;
		/** px between slides */
		gap?: number;
		index?: number;
		loop?: boolean;
		controls?: 'overlay' | 'below' | 'none';
		dots?: boolean;
		label?: string;
		class?: string;
		onchange?: (i: number) => void;
	};
	let { slides = [], perView: pv = 1, gap: g = 16, index = $bindable(0), loop = false, controls = 'overlay', dots = true, label, class: cls, onchange }: Props = $props();
	let x0: number | null = null;
	const pages = $derived(Math.max(1, Math.ceil(slides.length / pv)));
	const idx = $derived(Math.max(0, Math.min(pages - 1, index)));
	function go(n: number) {
		if (loop) n = (n + pages) % pages;
		n = Math.max(0, Math.min(pages - 1, n));
		index = n;
		onchange?.(n);
	}
</script>

{#snippet nav(dir: 'prev' | 'next', cls: string)}
	{@const prev = dir === 'prev'}
	<button type="button" class={['ui-car__nav', cls]} aria-label={prev ? 'Previous slide' : 'Next slide'} disabled={!loop && idx === (prev ? 0 : pages - 1)} onclick={() => go(idx + (prev ? -1 : 1))}><Icon name={prev ? 'chevron-left' : 'chevron-right'} size={16} /></button>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<section aria-roledescription="carousel" aria-label={label || 'Carousel'} class={['ui-car', cls]} tabindex="0"
	onkeydown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); } }}>
	<div class="ui-car__view" role="presentation" onpointerdown={(e) => (x0 = e.clientX)} onpointerup={(e) => { if (x0 == null) return; const d = e.clientX - x0; x0 = null; if (d < -48) go(idx + 1); else if (d > 48) go(idx - 1); }}>
		<div class="ui-car__track" style="gap: {g}px; transform: translateX(calc({-idx} * (100% + {g}px)))">
			{#each slides as sl, i (i)}
				{@const vis = Math.floor(i / pv) === idx}
				<div role="group" aria-roledescription="slide" aria-label="{i + 1} of {slides.length}" aria-hidden={vis ? undefined : 'true'} class={['ui-car__slide', !vis && 'is-off']} style="flex: 0 0 calc((100% - {g * (pv - 1)}px) / {pv})">{@render sl()}</div>
			{/each}
		</div>
		{#if controls === 'overlay'}
			{@render nav('prev', 'ui-car__nav--prev')}
			{@render nav('next', 'ui-car__nav--next')}
		{/if}
	</div>
	{#if dots || controls === 'below'}
		<div class="ui-car__foot">
			{#if controls === 'below'}{@render nav('prev', 'ui-car__nav--inline')}{/if}
			{#if dots}
				<div role="group" aria-label="Choose slide" class="ui-car__dots">
					{#each { length: pages } as _, i (i)}
						<button type="button" class={['ui-car__dot', i === idx && 'is-on']} aria-label="Slide {i + 1} of {pages}" aria-current={i === idx ? 'true' : undefined} onclick={() => go(i)}></button>
					{/each}
				</div>
			{/if}
			{#if controls === 'below'}{@render nav('next', 'ui-car__nav--inline')}{/if}
		</div>
	{/if}
</section>
