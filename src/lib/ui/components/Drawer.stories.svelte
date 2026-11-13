<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Drawer from './Drawer.svelte';
	import Button from './Button.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Overlays/Drawer', component: Drawer, tags: ['autodocs'] });
</script>

<Story name="Right" args={{ open: true, title: "INV-20418", eyebrow: "Invoice" }}>
	{#snippet template(args)}<Drawer {...args}>Acme Ltd, due 12 Nov 2026.</Drawer>{/snippet}
</Story>
<Story name="Left with footer" args={{ open: true, side: "left", size: "sm", title: "Filters" }}>
	{#snippet template(args)}<Drawer {...args}>{#snippet footer()}<Button>Apply filters</Button>{/snippet}Status, customer and date range.</Drawer>{/snippet}
</Story>
<Story name="Large" args={{ open: true, size: "lg", title: "Release 2.14", eyebrow: "Changelog" }}>
	{#snippet template(args)}<Drawer {...args}>312 checks passed.</Drawer>{/snippet}
</Story>
<Story name="Closes" args={{ open: true, title: "INV-20418", onclose: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('dialog', { name: 'INV-20418' })).toBeInTheDocument();
		await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
		await expect(args.onclose).toHaveBeenCalledTimes(1);
		await userEvent.keyboard('{Escape}');
		await expect(args.onclose).toHaveBeenCalledTimes(2);
	}}>
	{#snippet template(args)}<Drawer {...args}>Acme Ltd, due 12 Nov 2026.</Drawer>{/snippet}
</Story>
