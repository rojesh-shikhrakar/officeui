<!-- Card – A surface with optional media, eyebrow, title and footer; interactive when onclick is set. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './card.css';

	type Props = {
		/** raised: elevated · flat: no shadow · inverse: dark · accent: tinted */
		variant?: 'raised' | 'flat' | 'inverse' | 'accent';
		compact?: boolean;
		eyebrow?: string;
		title?: string;
		media?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		/** Makes the whole card a button (click, Enter, Space) */
		onclick?: (e: Event) => void;
		class?: string;
	};
	let { variant = 'raised', compact = false, eyebrow, title, media, footer, children, onclick, class: cls }: Props = $props();

	function key(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick?.(e);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section class={['ui-card', variant !== 'raised' && `ui-card--${variant}`, compact && 'ui-card--compact', onclick && 'ui-card--interactive', cls]} {onclick} onkeydown={onclick ? key : undefined} tabindex={onclick ? 0 : undefined} role={onclick ? 'button' : undefined}>
	{#if media}<div class="ui-card__media">{@render media()}</div>{/if}
	{#if eyebrow}<p class="ui-card__eyebrow">{eyebrow}</p>{/if}
	{#if title}<h3 class="ui-card__title">{title}</h3>{/if}
	<div class="ui-card__body">{@render children?.()}</div>
	{#if footer}<div class="ui-card__foot">{@render footer()}</div>{/if}
</section>
