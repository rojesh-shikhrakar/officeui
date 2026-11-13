<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import Card from './Card.svelte';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Layout/Card',
		component: Card,
		tags: ['autodocs'],
		args: { variant: 'raised', compact: false, eyebrow: 'Report', title: 'Quarterly summary' },
		argTypes: { variant: { control: 'inline-radio', options: ['raised', 'flat', 'inverse', 'accent'] } }
	});
	const onclick = fn();
</script>

<Story name="Default" asChild>
	<div style="width: 340px"><Card eyebrow="Report" title="Quarterly summary">Revenue is up 12% on the previous quarter.{#snippet footer()}<Button size="sm" variant="secondary" label="Open" />{/snippet}</Card></div>
</Story>
<Story
	name="Interactive"
	asChild
	play={async ({ canvasElement }) => {
		const card = within(canvasElement).getByRole('button');
		await userEvent.click(card);
		await userEvent.keyboard('{Enter}');
		await expect(onclick).toHaveBeenCalled();
	}}>
	<div style="width: 340px"><Card title="Click me" {onclick}>The whole card is a button.</Card></div>
</Story>
<Story name="Variants" asChild>
	<div style="display: grid; gap: 12px; width: 340px">
		<Card variant="flat" compact title="Flat">No shadow.</Card>
		<Card variant="inverse" compact title="Inverse">Dark surface.</Card>
		<Card variant="accent" compact title="Accent">Tinted.</Card>
	</div>
</Story>
