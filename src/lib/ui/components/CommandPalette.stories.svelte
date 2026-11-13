<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import CommandPalette from './CommandPalette.svelte';

	const { Story } = defineMeta({
		title: 'Components/Overlays/CommandPalette',
		component: CommandPalette,
		tags: ['autodocs'],
		args: { open: true, groups: [{ heading: 'Actions', items: [{ label: 'New document', icon: 'edit', shortcut: ['N'] }, { label: 'Open settings', icon: 'settings', keywords: 'preferences' }] }, { heading: 'Go to', items: [{ label: 'Home', icon: 'home' }] }] }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => {
	const input = within(canvasElement.ownerDocument.body).getByRole('combobox');
	await userEvent.type(input, 'pref');
	await expect(within(canvasElement.ownerDocument.body).getAllByRole('option')).toHaveLength(1);
}} />
<Story name="Empty" args={{ groups: [] }} />
