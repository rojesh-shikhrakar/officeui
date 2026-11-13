<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import DropdownMenu from './DropdownMenu.svelte';
	import Button from './Button.svelte';

	const onselect = fn();
	const { Story } = defineMeta({
		title: 'Components/Overlays/DropdownMenu',
		component: DropdownMenu,
		tags: ['autodocs'],
		args: {
			placement: 'bottom-start',
			onselect,
			items: [{ label: 'Rename', icon: 'edit' }, { label: 'Share', icon: 'share' }, { type: 'separator' }, { label: 'Delete', icon: 'trash', danger: true }]
		},
		argTypes: { placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] } }
	});
</script>

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Actions' }));
		await userEvent.click(c.getByRole('menuitem', { name: 'Share' }));
		await expect(onselect).toHaveBeenCalled();
		await expect(c.queryByRole('menu')).toBeNull();
	}}>
	<div style="min-height: 200px">
		<DropdownMenu items={[{ label: 'Rename', icon: 'edit' }, { label: 'Share', icon: 'share' }, { type: 'separator' }, { label: 'Delete', icon: 'trash', danger: true }]} {onselect}>
			{#snippet trigger(props)}<Button variant="secondary" label="Actions" {...props} />{/snippet}
		</DropdownMenu>
	</div>
</Story>
