<!-- Menu – A keyboard-navigable list of items, checkboxes, radios, separators, labels and submenus. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type MenuEntry = {
		type?: 'item' | 'checkbox' | 'radio' | 'separator' | 'label';
		label?: string;
		description?: string;
		shortcut?: string;
		/** An icon name from icons.ts, or a snippet */
		icon?: string | Snippet;
		disabled?: boolean;
		danger?: boolean;
		checked?: boolean;
		items?: MenuEntry[];
		onSelect?: () => void;
		[k: string]: any;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import MenuItem from './MenuItem.svelte';
	import './menu.css';

	type Props = {
		items?: MenuEntry[];
		/** Focus the first item on mount */
		autoFocus?: boolean;
		width?: string;
		label?: string;
		/** No min-width (inside a popover) */
		bare?: boolean;
		onclose?: () => void;
		onpick?: (it: MenuEntry) => void;
		class?: string;
	};
	let { items = [], autoFocus = false, width, label, bare = false, onclose, onpick, class: cls }: Props = $props();
	let el: HTMLElement | undefined = $state();
	onMount(() => {
		if (autoFocus) el?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])')?.focus();
	});
	function onkeydown(e: KeyboardEvent) {
		const list = [...el!.querySelectorAll<HTMLElement>(':scope > [role^="menuitem"]:not([disabled]), :scope > .ui-menu__subwrap > [role^="menuitem"]:not([disabled])')];
		const i = list.indexOf(document.activeElement as HTMLElement);
		let n = -1;
		if (e.key === 'ArrowDown') n = (i + 1) % list.length;
		else if (e.key === 'ArrowUp') n = (i - 1 + list.length) % list.length;
		else if (e.key === 'Home') n = 0;
		else if (e.key === 'End') n = list.length - 1;
		if (n >= 0) {
			e.preventDefault();
			e.stopPropagation();
			list[n].focus();
		} else if (e.key === 'Tab') onclose?.();
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div bind:this={el} role="menu" aria-label={label} class={['ui-menu', bare && 'ui-menu--bare', cls]} {onkeydown} style:width>
	{#each items as it, i (i)}
		{#if it.type === 'separator'}
			<div role="separator" class="ui-menu__sep"></div>
		{:else if it.type === 'label'}
			<div class="ui-menu__label">{it.label}</div>
		{:else}
			<MenuItem {it} {onpick} {onclose} />
		{/if}
	{/each}
</div>
