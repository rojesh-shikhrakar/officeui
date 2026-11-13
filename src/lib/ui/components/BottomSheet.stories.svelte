<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BottomSheet from './BottomSheet.svelte';

	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Overlays/BottomSheet', component: BottomSheet, tags: ['autodocs'] });
</script>

<Story name="Half" args={{ open: true, inline: true, title: "Filters", snap: "half" }}>
	{#snippet template(args)}<BottomSheet {...args}>Show invoices due in the next 30 days.</BottomSheet>{/snippet}
</Story>
<Story name="With footer" args={{ open: true, inline: true, title: "Approve release", snap: "full" }}>
	{#snippet template(args)}<BottomSheet {...args}>{#snippet footer()}<button type="button">Approve release</button>{/snippet}Release 2.14 passed all 312 checks.</BottomSheet>{/snippet}
</Story>
<Story name="Peek" args={{ open: true, inline: true, title: "Selected: 3 invoices", snap: "peek" }} />
<Story name="Resizes and closes" args={{ open: true, inline: true, title: "Filters", snap: "half", onclose: fn(), onsnapchange: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Resize sheet/ }));
		await expect(args.onsnapchange).toHaveBeenCalledTimes(1);
		await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
		await expect(args.onclose).toHaveBeenCalledTimes(1);
	}}>
	{#snippet template(args)}<BottomSheet {...args}>Show invoices due in the next 30 days.</BottomSheet>{/snippet}
</Story>
