<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import StackedList from './StackedList.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/StackedList',
		component: StackedList,
		tags: ['autodocs'],
		args: {
			label: 'Recent invoices',
			variant: 'divided',
			items: [
				{ id: 1, title: 'INV-20418', description: 'Acme Ltd', meta: '$4,820.00' },
				{ id: 2, title: 'INV-20419', description: 'Northwind Traders', meta: '$1,260.00' },
				{ id: 3, title: 'INV-20420', description: 'Globex', meta: '$930.50' }
			]
		},
		argTypes: { variant: { control: 'inline-radio', options: ['divided', 'card', 'separated'] }, density: { control: 'inline-radio', options: ['default', 'compact'] } }
	});
	const onselect = fn();
</script>

<Story name="Divided" />
<Story name="Card" args={{ variant: 'card' }} />
<Story name="Separated" args={{ variant: 'separated', selectedId: 2, onselect }} />
<Story name="Selected compact" args={{ density: 'compact', selectedId: 2, items: [{ id: 1, title: 'Approve release' }, { id: 2, title: 'Review changes' }, { id: 3, title: 'Archive project', disabled: true, onselect: () => {} }] }} />
<Story
	name="Interactive"
	args={{ onselect }}
	play={async ({ canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: /INV-20419/ }));
		await expect(onselect).toHaveBeenCalled();
	}}
/>
