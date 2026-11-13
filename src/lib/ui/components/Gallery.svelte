<!-- Gallery – image grid or mosaic; clicking opens a lightbox (native <dialog>) with prev/next. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import './gallery.css';

	type Item = { id?: string | number; src?: string; alt?: string; caption?: string; wide?: boolean; tall?: boolean };
	type Props = {
		items?: Item[];
		variant?: 'grid' | 'mosaic';
		columns?: number;
		/** CSS aspect-ratio of grid cells */
		ratio?: string;
		label?: string;
		lightbox?: boolean;
		class?: string;
		onopen?: (it: Item, i: number) => void;
	};
	let { items = [], variant = 'grid', columns = 3, ratio = '4 / 3', label, lightbox = true, class: cls, onopen }: Props = $props();
	let openI: number | null = $state(null);
	let dlg: HTMLDialogElement | undefined = $state();
	const cur = $derived(openI != null ? items[openI] : null);
	$effect(() => {
		if (!dlg) return;
		if (openI != null && !dlg.open) dlg.showModal();
		else if (openI == null && dlg.open) dlg.close();
	});
	function step(d: number) { openI = Math.max(0, Math.min(items.length - 1, (openI ?? 0) + d)); }
</script>

<div class={['ui-gal', cls]}>
	<ul class="ui-gal__grid" data-variant={variant} style:grid-template-columns="repeat({columns}, minmax(0, 1fr))" style:--ui-gal-ratio={ratio} aria-label={label || 'Gallery'}>
		{#each items as it, i (it.id ?? i)}
			<li class={['ui-gal__item', variant === 'mosaic' && it.wide && 'is-wide', variant === 'mosaic' && it.tall && 'is-tall']}>
				<button type="button" class="ui-gal__btn" aria-label="{it.caption || it.alt || `Item ${i + 1}`}, open" onclick={() => { if (lightbox) openI = i; onopen?.(it, i); }}>
					{#if it.src}<img src={it.src} alt={it.alt || ''} loading="lazy" />{:else}<span class="ui-gal__ph" aria-hidden="true"><Icon name="image" size={22} /></span>{/if}
					{#if it.caption}<span class="ui-gal__cap">{it.caption}</span>{/if}
				</button>
			</li>
		{/each}
	</ul>
	{#if lightbox}
		<dialog bind:this={dlg} class="ui-gal__dlg" aria-label={cur ? cur.caption || cur.alt || `Image ${(openI ?? 0) + 1}` : 'Image'} onclose={() => (openI = null)} onclick={(e) => { if (e.target === dlg) openI = null; }}>
			{#if cur && openI != null}
				<div class="ui-gal__bar"><span>{cur.caption || cur.alt || ''}</span><span class="ui-gal__count">{openI + 1} of {items.length}</span><button type="button" class="ui-gal__x" aria-label="Close" onclick={() => (openI = null)}><Icon name="x" size={16} /></button></div>
				<div class="ui-gal__stage">
					<button type="button" class="ui-gal__nav" aria-label="Previous" disabled={openI === 0} onclick={() => step(-1)}><Icon name="chevron-left" size={18} /></button>
					<div class="ui-gal__big">{#if cur.src}<img src={cur.src} alt={cur.alt || ''} />{:else}<span class="ui-gal__ph ui-gal__ph--big"><Icon name="image" size={40} /></span>{/if}</div>
					<button type="button" class="ui-gal__nav" aria-label="Next" disabled={openI === items.length - 1} onclick={() => step(1)}><Icon name="chevron-right" size={18} /></button>
				</div>
			{/if}
		</dialog>
	{/if}
</div>
