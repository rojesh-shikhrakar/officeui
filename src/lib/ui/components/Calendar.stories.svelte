<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Calendar from './Calendar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Calendar',
		component: Calendar,
		tags: ['autodocs'], args: { mode: 'single', weekStart: 1 }, argTypes: { mode: { control: 'inline-radio', options: ['single', 'range'] } }
	});
</script>

<Story
	name="Default"
	args={{ value: new Date(2026, 10, 12), defaultMonth: new Date(2026, 10, 1) }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('gridcell', { name: /November 20, 2026/ }));
		await expect(c.getByRole('gridcell', { name: /November 20, 2026/ })).toHaveAttribute('aria-selected', 'true');
	}} />
<Story name="Range" args={{ mode: 'range', value: { start: new Date(2026, 10, 9), end: new Date(2026, 10, 15) }, defaultMonth: new Date(2026, 10, 1) }} />
<Story name="Min and max" args={{ value: new Date(2026, 10, 12), min: new Date(2026, 10, 5), max: new Date(2026, 10, 25) }} />
