<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Tooltip from './Tooltip.svelte';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Overlays/Tooltip',
		component: Tooltip,
		tags: ['autodocs'],
		args: { content: 'Copy link', side: 'top', open: false },
		argTypes: { side: { control: 'inline-radio', options: ['top', 'bottom'] } }
	});
</script>

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const btn = within(canvasElement).getByRole('button');
		await expect(btn).toHaveAccessibleDescription('Copy link');
		await userEvent.hover(btn);
	}}>
	<div style="padding: 40px"><Tooltip content="Copy link"><Button variant="secondary" label="Copy" /></Tooltip></div>
</Story>
<Story name="Bottom, open" asChild>
	<div style="padding: 40px 40px 60px"><Tooltip content="Below the control" side="bottom" open><Button variant="secondary" label="Hover me" /></Tooltip></div>
</Story>
