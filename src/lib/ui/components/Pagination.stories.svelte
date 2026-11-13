<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Pagination from './Pagination.svelte';
	import Icon from './Icon.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Navigation/Pagination', component: Pagination, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ page: 3, pageCount: 12 }} />
<Story name="Navigates" args={{ page: 1, pageCount: 5, onchange: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		const prev = canvas.getByRole('button', { name: 'Previous page' });
		await expect(prev).toBeDisabled();
		await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
		await expect(args.onchange).toHaveBeenLastCalledWith(2);
		await expect(canvas.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
		await userEvent.click(canvas.getByRole('button', { name: '5' }));
		await expect(args.onchange).toHaveBeenLastCalledWith(5);
		await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
	}} />
