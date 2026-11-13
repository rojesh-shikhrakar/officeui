<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import Menu, { type MenuEntry } from './Menu.svelte';

	const onpick = fn();
	const items: MenuEntry[] = [
		{ label: 'Edit', icon: 'edit', shortcut: '⌘E' },
		{ label: 'Duplicate', icon: 'copy', description: 'Make a copy' },
		{ label: 'Move to', icon: 'folder', items: [{ label: 'Inbox' }, { label: 'Archive' }] },
		{ type: 'separator' },
		{ type: 'label', label: 'View' },
		{ type: 'checkbox', label: 'Show details', checked: true },
		{ type: 'radio', label: 'Compact', checked: true },
		{ type: 'separator' },
		{ label: 'Delete', icon: 'trash', danger: true },
		{ label: 'Disabled', disabled: true }
	];

	const { Story } = defineMeta({
		title: 'Components/Overlays/Menu',
		component: Menu,
		tags: ['autodocs'],
		args: { items, label: 'Actions', onpick }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('menuitem', { name: /Edit/ }));
		await expect(onpick).toHaveBeenCalled();
		c.getByRole('menuitem', { name: /Edit/ }).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect(c.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus();
	}} />
