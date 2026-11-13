<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActionSheet from './ActionSheet.svelte';

	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Overlays/ActionSheet', component: ActionSheet, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ open: true, inline: true, title: "INV-20418", message: "Choose what to do with this invoice.", cancelLabel: "Cancel", actions: [{ label: "Approve release" }, { label: "Download PDF" }, { label: "Delete invoice", danger: true }] }} />
<Story name="With disabled action" args={{ open: true, inline: true, title: "INV-20418", cancelLabel: "Cancel", actions: [{ label: "Approve release", disabled: true }, { label: "Send reminder" }] }} />
<Story name="Picks action and cancels" args={{ open: true, inline: true, title: "INV-20418", cancelLabel: "Cancel", onclose: fn(), actions: [{ label: "Approve release", onselect: fn() }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Approve release' }));
		await expect(args.actions![0].onselect).toHaveBeenCalledTimes(1);
		await expect(args.onclose).toHaveBeenCalledTimes(1);
		await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
		await expect(args.onclose).toHaveBeenCalledTimes(2);
	}} />
