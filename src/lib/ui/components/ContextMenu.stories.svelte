<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ContextMenu from './ContextMenu.svelte';

	const { Story } = defineMeta({
		title: 'Components/Overlays/ContextMenu',
		component: ContextMenu,
		tags: ['autodocs'],
		args: { items: [{ label: 'Open', icon: 'external' }, { label: 'Copy link', icon: 'copy' }, { type: 'separator' }, { label: 'Delete', icon: 'trash', danger: true }] }
	});
</script>

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.pointer({ keys: '[MouseRight]', target: c.getByText('Right-click anywhere here') });
		await expect(await within(document.body).findByRole('menu')).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
	}}>
	<ContextMenu items={[{ label: 'Open', icon: 'external' }, { label: 'Copy link', icon: 'copy' }, { type: 'separator' }, { label: 'Delete', icon: 'trash', danger: true }]}>
		<div style="width: 360px; height: 160px; display: grid; place-items: center; border: 1px dashed var(--aui-border, #ccc); border-radius: 12px">Right-click anywhere here</div>
	</ContextMenu>
</Story>
