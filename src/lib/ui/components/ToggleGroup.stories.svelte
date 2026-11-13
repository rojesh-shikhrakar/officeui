<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ToggleGroup from './ToggleGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Toggle Group',
		component: ToggleGroup,
		tags: ['autodocs'], args: { label: 'View', value: 'list', options: [{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }, { value: 'cal', label: 'Calendar' }] }, argTypes: { variant: { control: 'inline-radio', options: ['segmented', 'outline'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: 'Board' }));
		await expect(c.getByRole('radio', { name: 'Board' })).toBeChecked();
	}} />
<Story name="Outline" args={{ variant: 'outline' }} />
<Story
	name="Multiple"
	args={{ type: 'multiple', value: ['bold'], label: 'Format', variant: 'outline', options: [{ value: 'bold', label: 'Bold' }, { value: 'italic', label: 'Italic' }, { value: 'under', label: 'Underline' }] }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Italic' }));
		await expect(c.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
	}} />
<Story name="Full width" args={{ fullWidth: true }} />
