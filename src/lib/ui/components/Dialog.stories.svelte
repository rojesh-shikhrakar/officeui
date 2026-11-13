<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Dialog from './Dialog.svelte';
	import Button from './Button.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Overlays/Dialog', component: Dialog, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ open: true, title: "Approve release" }}>
	{#snippet template(args)}<Dialog {...args}>Release 2.14 passed all 312 checks.</Dialog>{/snippet}
</Story>
<Story name="With footer" args={{ open: true, title: "Approve release", size: "sm" }}>
	{#snippet template(args)}<Dialog {...args}>{#snippet footer()}<Button variant="secondary">Cancel</Button><Button>Approve release</Button>{/snippet}This sends the release to production.</Dialog>{/snippet}
</Story>
<Story name="Alert" args={{ open: true, alert: true, title: "Delete INV-20418?" }}>
	{#snippet template(args)}<Dialog {...args}>{#snippet footer()}<Button variant="secondary">Cancel</Button><Button variant="danger">Delete invoice</Button>{/snippet}This cannot be undone.</Dialog>{/snippet}
</Story>
<Story name="Closes" args={{ open: true, title: "Approve release", onclose: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('dialog', { name: 'Approve release' })).toBeInTheDocument();
		await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
		await expect(args.onclose).toHaveBeenCalledTimes(1);
		await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
	}} />
<Story name="Closes on Escape" args={{ open: true, title: "Approve release", onclose: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.keyboard('{Escape}');
		await expect(args.onclose).toHaveBeenCalledTimes(1);
		await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
	}} />
