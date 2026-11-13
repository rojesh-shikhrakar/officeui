<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import DatePicker from './DatePicker.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Date Picker',
		component: DatePicker,
		tags: ['autodocs'], args: { label: 'Due date', mode: 'single' }, argTypes: { mode: { control: 'inline-radio', options: ['single', 'range'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Due date/ }));
		await expect(c.getByRole('grid')).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		await expect(c.queryByRole('grid')).toBeNull();
	}} />
<Story name="Range with presets" args={{ mode: 'range', label: 'Period', defaultOpen: true, presets: [{ label: 'Last 7 days', range: { start: new Date(2026, 10, 5), end: new Date(2026, 10, 12) } }, { label: 'This month', range: { start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) } }] }} />
<Story name="With time" args={{ withTime: true, value: new Date(2026, 10, 12, 14, 30) }} />
<Story name="Error" args={{ error: 'Pick a date.' }} />
