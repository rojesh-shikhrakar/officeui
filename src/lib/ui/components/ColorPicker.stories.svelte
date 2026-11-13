<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ColorPicker from './ColorPicker.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Color Picker',
		component: ColorPicker,
		tags: ['autodocs'], args: { value: '#3b82f6' }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: '#10b981' }));
		await expect(c.getByLabelText('Hex value')).toHaveValue('#10b981');
	}} />
<Story name="In a popover" args={{ inline: false, label: 'Accent' }} />
<Story name="No swatches" args={{ swatches: [] }} />
