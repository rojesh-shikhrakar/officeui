<!-- Tile – A selectable card (role radio or checkbox); TileGroup manages a set. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './tile.css';

	type Props = {
		type?: 'checkbox' | 'radio';
		value?: string;
		title: string;
		description?: string;
		/** An icon name, or a snippet */
		icon?: string | Snippet;
		/** A tabular line at the bottom, e.g. a price */
		meta?: string;
		selected?: boolean;
		disabled?: boolean;
		tabindex?: number;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
	};
	let { type = 'radio', value, title, description, icon, meta, selected = false, disabled = false, tabindex, class: cls, onclick, onkeydown }: Props = $props();
</script>

<button type="button" role={type} aria-checked={selected} {disabled} {tabindex} {onclick} {onkeydown} data-value={value} class={['ui-tile', selected && 'is-selected', cls]}>
	<span class="ui-tile__mark" aria-hidden="true">{#if selected}<Icon name="check" size={12} />{/if}</span>
	{#if icon}<span class="ui-tile__icon">{#if typeof icon === 'string'}<Icon name={icon} size={20} />{:else}{@render icon()}{/if}</span>{/if}
	<span class="ui-tile__title">{title}</span>
	{#if description}<span class="ui-tile__desc">{description}</span>{/if}
	{#if meta}<span class="ui-tile__meta">{meta}</span>{/if}
</button>
