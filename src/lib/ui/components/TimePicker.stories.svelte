<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import TimePicker from './TimePicker.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Time Picker',
		component: TimePicker,
		tags: ['autodocs'], args: { label: 'Start time', minuteStep: 5 }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Start time/ }));
		await expect(c.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
	}} />
<Story name="With value" args={{ value: new Date(2026, 0, 1, 14, 30) }} />
<Story name="Twenty-four hour" args={{ hour12: false, defaultOpen: true }} />
