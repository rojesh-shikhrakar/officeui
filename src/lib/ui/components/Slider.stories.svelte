<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Slider from './Slider.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Slider',
		component: Slider,
		tags: ['autodocs'], args: { label: 'Volume', value: 40, min: 0, max: 100, showValue: true }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const t = within(canvasElement).getByRole('slider');
		t.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(t).toHaveAttribute('aria-valuenow', '41');
		await userEvent.keyboard('{End}');
		await expect(t).toHaveAttribute('aria-valuenow', '100');
	}} />
<Story name="Range" args={{ label: 'Price', value: [20, 70], showValue: true, format: (v: number) => `$${v}` }} play={async ({ canvasElement }) => expect(within(canvasElement).getAllByRole('slider')).toHaveLength(2)} />
<Story name="With marks" args={{ step: 25, value: 50, marks: [{ value: 0, label: '0' }, { value: 25, label: '25' }, { value: 50, label: '50' }, { value: 75, label: '75' }, { value: 100, label: '100' }] }} />
<Story name="Disabled" args={{ disabled: true }} />
