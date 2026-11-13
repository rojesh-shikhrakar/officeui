<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Popover from './Popover.svelte';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Overlays/Popover',
		component: Popover,
		tags: ['autodocs'],
		args: { placement: 'bottom-start' },
		argTypes: { placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] } }
	});
</script>

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const btn = within(canvasElement).getByRole('button', { name: 'Details' });
		await userEvent.click(btn);
		await expect(within(canvasElement).getByRole('dialog')).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		await expect(within(canvasElement).queryByRole('dialog')).toBeNull();
	}}>
	<div style="min-height: 160px">
		<Popover width="260px">
			{#snippet trigger(props)}<Button variant="secondary" label="Details" {...props} />{/snippet}
			{#snippet children({ close })}
				<p style="margin: 0 0 12px; font-size: 14px">Anything goes in here.</p>
				<Button size="sm" label="Done" onclick={close} />
			{/snippet}
		</Popover>
	</div>
</Story>
