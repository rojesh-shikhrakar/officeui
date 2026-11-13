<!-- Chip – A compact tag: static, toggleable (onclick) and/or removable (onremove). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './chip.css';

	type Props = {
		tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';
		/** outline: bordered · soft: tinted fill */
		variant?: 'outline' | 'soft';
		size?: 'sm' | 'md';
		selected?: boolean;
		disabled?: boolean;
		avatar?: Snippet;
		icon?: Snippet;
		/** Accessible name for the remove button ("Remove <label>") */
		label?: string;
		onclick?: (e: MouseEvent) => void;
		onremove?: (e: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	};
	let { tone = 'neutral', variant = 'outline', size = 'md', selected, disabled, avatar, icon, label = '', onclick, onremove, children, class: cls }: Props = $props();
</script>

{#snippet inner()}{@render avatar?.()}{#if icon}<span class="ui-chip__icon">{@render icon()}</span>{/if}<span class="ui-chip__label">{@render children?.()}</span>{/snippet}
<span class={['ui-chip', `ui-chip--${variant}`, `ui-chip--${tone}`, size === 'sm' && 'ui-chip--sm', selected && 'is-selected', disabled && 'is-disabled', onclick && 'is-action', cls]}>
	{#if onclick}
		<button type="button" class="ui-chip__main" aria-pressed={selected ? 'true' : 'false'} {disabled} {onclick}>{#if selected}<Icon name="check" size={12} />{/if}{@render inner()}</button>
	{:else}
		<span class="ui-chip__main">{@render inner()}</span>
	{/if}
	{#if onremove}<button type="button" class="ui-chip__x" aria-label="Remove {label}" {disabled} onclick={onremove}><Icon name="x" size={12} /></button>{/if}
</span>
