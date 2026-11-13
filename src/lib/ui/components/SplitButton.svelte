<!-- SplitButton – A primary action plus a chevron that opens a menu of related actions. -->
<script lang="ts">
	import type { Snippet, ComponentProps } from 'svelte';
	import Button from './Button.svelte';
	import ButtonGroup from './ButtonGroup.svelte';
	import DropdownMenu from './DropdownMenu.svelte';
	import Icon from './Icon.svelte';
	import type { MenuEntry } from './Menu.svelte';

	type Props = {
		variant?: ComponentProps<typeof Button>['variant'];
		size?: 'sm' | 'md' | 'lg';
		icon?: Snippet;
		items?: MenuEntry[];
		/** Accessible name of the group */
		label?: string;
		/** Accessible name of the chevron button */
		menuLabel?: string;
		disabled?: boolean;
		loading?: boolean;
		onclick?: (e: MouseEvent) => void;
		onselect?: (it: MenuEntry) => void;
		children?: Snippet;
		class?: string;
	};
	let { variant = 'primary', size, icon, items = [], label, menuLabel = 'More options', disabled, loading, onclick, onselect, children, class: cls }: Props = $props();
</script>

<ButtonGroup class={cls} {label}>
	<Button {variant} {size} {icon} {onclick} {disabled} {loading}>{@render children?.()}</Button>
	<DropdownMenu {items} placement="bottom-end" {onselect}>
		{#snippet trigger(tp)}
			<Button {...tp} {variant} {size} aria-label={menuLabel} {disabled}>{#snippet icon()}<Icon name="chevron-down" size={14} />{/snippet}</Button>
		{/snippet}
	</DropdownMenu>
</ButtonGroup>
