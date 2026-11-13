<!-- SearchBar – role="search" input with clear button, loading spinner and optional shortcut hint; Escape clears. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';
	import Kbd from './Kbd.svelte';
	import './search-bar.css';

	type Props = {
		id?: string;
		value?: string;
		/** Accessible name (default "Search") */
		label?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		/** Keyboard hint shown while empty, e.g. "⌘K" */
		shortcut?: string;
		class?: string;
		onchange?: (v: string) => void;
		/** Enter pressed */
		onsearch?: (v: string) => void;
	};
	let { id, value = $bindable(''), label, placeholder = 'Search', size = 'md', disabled = false, loading = false, shortcut, class: cls, onchange, onsearch }: Props = $props();
	const uid = $props.id();
	const fid = $derived(id ?? uid);
	let inp: HTMLInputElement | undefined = $state();
	function set(v: string) {
		value = v;
		onchange?.(v);
	}
</script>

<form
	role="search"
	class={['ui-srch', `ui-srch--${size}`, disabled && 'is-disabled', cls]}
	onsubmit={(e) => {
		e.preventDefault();
		onsearch?.(value);
	}}>
	<Icon name="search" size={16} class="ui-srch__icon" />
	<input
		bind:this={inp}
		id={fid}
		type="search"
		class="ui-srch__input"
		aria-label={label || 'Search'}
		{placeholder}
		{value}
		{disabled}
		oninput={(e) => set(e.currentTarget.value)}
		onkeydown={(e) => {
			if (e.key === 'Escape' && value) {
				e.preventDefault();
				set('');
			}
		}} />
	{#if loading}
		<Spinner size="sm" label="Searching" showLabel={false} />
	{:else if value}
		<button type="button" class="ui-srch__clear" aria-label="Clear search" onclick={() => { set(''); inp?.focus(); }}><Icon name="x" size={14} /></button>
	{:else if shortcut}
		<Kbd>{shortcut}</Kbd>
	{/if}
</form>
