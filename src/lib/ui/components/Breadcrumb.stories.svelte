<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Breadcrumb from './Breadcrumb.svelte';
	import Icon from './Icon.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Navigation/Breadcrumb', component: Breadcrumb, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ items: [{ label: "Ledger", href: "#" }, { label: "Invoices", href: "#" }, { label: "INV-20418" }] }} />
<Story name="Link click" args={{ items: [{ label: "Ledger", href: "#", onclick: fn() }, { label: "INV-20418" }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('link', { name: 'Ledger' }));
		await expect(args.items![0].onclick).toHaveBeenCalledTimes(1);
		await expect(canvas.getByText('INV-20418')).toHaveAttribute('aria-current', 'page');
	}} />
