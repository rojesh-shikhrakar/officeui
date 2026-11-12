<!-- Button – ported from affectUI (MIT). Primary, secondary, ghost and destructive, three sizes, loading shimmer, width morph. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';
	import './button.css';

	type Props = HTMLButtonAttributes & {
		/** primary: a dark chip · secondary: white with a hairline shadow · ghost: text only · destructive: a light red fill */
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		/** Shows a shimmer over the label and blocks clicks */
		loading?: boolean;
		/** Plain-text label (or use children) */
		label?: string;
		/** Icon before the label */
		icon?: Snippet;
		/** Icon after the label */
		iconRight?: Snippet;
		children?: Snippet;
		el?: HTMLButtonElement;
	};

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		label,
		icon,
		iconRight,
		children,
		class: cls,
		type = 'button',
		onclick,
		onpointerenter,
		el = $bindable(),
		...rest
	}: Props = $props();

	const tone = $derived(['primary', 'secondary', 'ghost', 'destructive'].includes(variant) ? variant : 'primary');
	const scale = $derived(['sm', 'md', 'lg'].includes(size) ? size : 'md');
	const hasLabel = $derived(Boolean(children || label));
	const iconOnly = $derived(!hasLabel && Boolean(icon || iconRight));
	const contentKey = $derived(`${label ?? 'label'}|${loading && icon ? 'spinner' : 'icon'}`);

	let ready = $state(false);
	let lastWidth = 0;
	let lastContent: unknown[] | null = null;
	onMount(() => (ready = true));
	// Morph: when the content changes, the width glides to its new size
	$effect(() => {
		// Snippets can't be stringified, so compare them by identity
		const content = [contentKey, icon, iconRight];
		if (!el) return;
		const width = el.getBoundingClientRect().width;
		const from = lastWidth;
		const changed = lastContent !== null && content.some((v, i) => v !== lastContent![i]);
		lastWidth = width;
		lastContent = content;
		if (!changed || !from || Math.abs(from - width) < 0.5) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		el.animate([{ width: `${from}px` }, { width: `${width}px` }], { duration: 480, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' });
	});
</script>

<button
	bind:this={el}
	{type}
	class={['ui-buttonc', cls]}
	data-variant={tone}
	data-size={scale}
	data-loading={loading || undefined}
	data-icon-only={iconOnly || undefined}
	data-icon-left={(!iconOnly && Boolean(icon)) || undefined}
	data-icon-right={(!iconOnly && Boolean(iconRight)) || undefined}
	data-ready={ready || undefined}
	aria-busy={loading || undefined}
	aria-disabled={loading || undefined}
	onclick={(e) => {
		if (loading) return e.preventDefault();
		onclick?.(e);
	}}
	onpointerenter={(e) => {
		// A label cut short shows its full text on hover
		const l = e.currentTarget.querySelector<HTMLElement>('.ui-buttonc__label');
		if (l && label && !rest.title) l.title = l.scrollWidth > l.clientWidth + 1 ? label : '';
		onpointerenter?.(e);
	}}
	{...rest}
>
	{#if icon}
		{#key loading}
			<span class="ui-buttonc__icon" aria-hidden="true">
				{#if loading}
					<svg class="ui-buttonc__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						><circle cx="12" cy="12" r="8.5" opacity="0.2" /><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" /></svg
					>
				{:else}{@render icon()}{/if}
			</span>
		{/key}
	{/if}
	{#if hasLabel}
		{#key label}
			<span class="ui-buttonc__label" data-text={label} dir="auto">{#if children}{@render children()}{:else}{label}{/if}</span>
		{/key}
	{/if}
	{#if iconRight}<span class="ui-buttonc__icon" aria-hidden="true">{@render iconRight()}</span>{/if}
</button>
