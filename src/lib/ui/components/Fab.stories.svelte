<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Fab from './Fab.svelte';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Floating Action Button',
		component: Fab,
		tags: ['autodocs'], args: { label: 'New item', extended: false, variant: 'primary', size: 'md' }, argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('button', { name: 'New item' })).toBeInTheDocument()} />
<Story name="Extended" args={{ extended: true }} />
<Story
	name="Speed dial"
	args={{ actions: [{ label: 'Note', icon: 'edit' }, { label: 'Folder', icon: 'folder' }, { label: 'Upload', icon: 'upload' }] }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'New item' }));
		await expect(c.getAllByRole('menuitem')).toHaveLength(3);
		await userEvent.keyboard('{Escape}');
		await expect(c.queryByRole('menu')).toBeNull();
	}} />
