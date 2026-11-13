<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Table from './Table.svelte';

	const { Story } = defineMeta({
		title: 'Components/Data/Table',
		component: Table,
		tags: ['autodocs'],
		args: { columns: [{ key: 'name', label: 'Name', sortable: true }, { key: 'role', label: 'Role' }, { key: 'seats', label: 'Seats', numeric: true, sortable: true }], rows: [{ name: 'Ada', role: 'Admin', seats: 4 }, { name: 'Grace', role: 'Editor', seats: 12 }, { name: 'Linus', role: 'Viewer', seats: 1, _selected: true }], dense: false }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => {
	const c = within(canvasElement);
	await expect(c.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none');
	await expect(c.getAllByRole('row')).toHaveLength(4);
}} />
<Story name="Dense" args={{ dense: true, caption: 'Team' }} />
<Story name="Sorted" args={{ sortKey: 'seats', sortDir: 'desc' }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('columnheader', { name: 'Seats' })).toHaveAttribute('aria-sort', 'descending')} />
<Story name="Empty" args={{ rows: [] }} />
