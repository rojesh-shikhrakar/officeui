<!-- DropdownMenu – A Popover that holds a Menu; the trigger snippet receives the props to spread on your button. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Popover from './Popover.svelte';
	import Menu, { type MenuEntry } from './Menu.svelte';

	type Props = {
		items?: MenuEntry[];
		open?: boolean;
		placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
		width?: string;
		label?: string;
		/** Keep the menu open after toggling a checkbox item */
		keepOpen?: boolean;
		onselect?: (it: MenuEntry) => void;
		class?: string;
		trigger: Snippet<[Record<string, any>]>;
	};
	let { items = [], open = $bindable(false), placement = 'bottom-start', width, label, keepOpen = false, onselect, class: cls, trigger }: Props = $props();
</script>

<Popover role="menu" {placement} class={cls} panelClass="ui-pop__panel--menu" bind:open {trigger}>
	{#snippet children({ close })}
		<Menu
			{items}
			autoFocus
			{width}
			{label}
			bare
			onclose={close}
			onpick={(it) => {
				onselect?.(it);
				if (!(it.type === 'checkbox' && keepOpen)) close();
			}} />
	{/snippet}
</Popover>
