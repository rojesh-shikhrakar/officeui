<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Tree from './Tree.svelte';

	const { Story } = defineMeta({
		title: 'Components/Navigation/Tree',
		component: Tree,
		tags: ['autodocs'],
		args: { label: 'Files', icons: true, expanded: ['src'], nodes: [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'App.svelte', meta: '2 KB' }, { id: 'lib', label: 'lib', children: [{ id: 'x', label: 'x.ts' }] }] }, { id: 'readme', label: 'README.md' }] }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => {
	const c = within(canvasElement);
	await userEvent.click(c.getByText('App.svelte'));
	await expect(c.getByRole('treeitem', { name: /App.svelte/ })).toHaveAttribute('aria-selected', 'true');
}} />
<Story name="Checkable" args={{ checkable: true, expanded: ['src', 'lib'], checked: ['x'] }} />
