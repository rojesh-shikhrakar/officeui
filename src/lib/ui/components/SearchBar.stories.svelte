<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import SearchBar from './SearchBar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Search Bar',
		component: SearchBar,
		tags: ['autodocs'], args: { placeholder: 'Search runs', size: 'md' }, argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	args={{ shortcut: '⌘K' }}
	play={async ({ canvasElement }) => {
		const input = within(canvasElement).getByRole('searchbox');
		await userEvent.type(input, 'agent');
		await expect(input).toHaveValue('agent');
		await userEvent.keyboard('{Escape}');
		await expect(input).toHaveValue('');
	}} />
<Story name="With value" args={{ value: 'invoices' }} />
<Story name="Loading" args={{ value: 'invoices', loading: true }} />
<Story name="Disabled" args={{ disabled: true }} />
