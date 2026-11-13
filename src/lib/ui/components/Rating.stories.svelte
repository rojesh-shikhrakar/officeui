<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Rating from './Rating.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Rating',
		component: Rating,
		tags: ['autodocs'], args: { value: 3, max: 5, size: 'md' }, argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const s = within(canvasElement).getByRole('slider');
		s.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(s).toHaveAttribute('aria-valuenow', '4');
	}} />
<Story name="Half stars" args={{ half: true, value: 3.5 }} />
<Story name="Read only" args={{ readOnly: true, value: 4.5, half: true, showValue: true, count: 1284 }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('img')).toBeInTheDocument()} />
<Story name="Clearable" args={{ clearable: true }} />
