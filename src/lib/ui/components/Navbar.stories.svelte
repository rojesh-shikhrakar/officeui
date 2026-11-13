<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Navbar from './Navbar.svelte';
	import Button from './Button.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Navigation/Navbar', component: Navbar, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ label: "Main", links: [{ label: "Invoices", href: "#", active: true }, { label: "Customers", href: "#" }, { label: "Reports", href: "#" }] }}>
	{#snippet template(args)}<Navbar {...args}>{#snippet brand()}<strong>OfficeUI</strong>{/snippet}{#snippet actions()}<Button size="sm">New invoice</Button>{/snippet}</Navbar>{/snippet}
</Story>
<Story name="Sticky" args={{ sticky: true, label: "Main", links: [{ label: "Invoices", href: "#", active: true, icon: "file" }, { label: "Settings", href: "#", icon: "settings" }] }}>
	{#snippet template(args)}<Navbar {...args}>{#snippet brand()}<strong>OfficeUI</strong>{/snippet}</Navbar>{/snippet}
</Story>
<Story name="Link click" args={{ label: "Main", links: [{ label: "Invoices", href: "#", onclick: fn() }, { label: "Customers", href: "#" }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getAllByRole('link', { name: 'Invoices' })[0]);
		await expect(args.links![0].onclick).toHaveBeenCalledTimes(1);
	}}>
	{#snippet template(args)}<Navbar {...args}>{#snippet brand()}<strong>OfficeUI</strong>{/snippet}</Navbar>{/snippet}
</Story>
