<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Cascader from './Cascader.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Cascader',
		component: Cascader,
		tags: ['autodocs'], args: { label: 'Location', options: [{ value: 'eu', label: 'Europe', children: [{ value: 'de', label: 'Germany', children: [{ value: 'ber', label: 'Berlin' }, { value: 'muc', label: 'Munich' }] }, { value: 'fr', label: 'France', children: [{ value: 'par', label: 'Paris' }] }] }, { value: 'na', label: 'North America', children: [{ value: 'us', label: 'United States', children: [{ value: 'nyc', label: 'New York' }] }] }, { value: 'x', label: 'Elsewhere', disabled: true }] }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Location/ }));
		await userEvent.click(c.getByRole('treeitem', { name: /Europe/ }));
		await userEvent.click(c.getByRole('treeitem', { name: /Germany/ }));
		await userEvent.click(c.getByRole('treeitem', { name: /Berlin/ }));
		await expect(c.getByText(/Europe \/ Germany \/ Berlin/)).toBeInTheDocument();
	}} />
<Story name="Open on hover" args={{ expandTrigger: 'hover', defaultOpen: true }} />
<Story name="Preselected" args={{ value: ['na', 'us', 'nyc'] }} />
