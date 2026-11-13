<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TabBar from './TabBar.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Navigation/TabBar', component: TabBar, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ activeId: "home", items: [{ id: "home", label: "Home", icon: "home" }, { id: "invoices", label: "Invoices", icon: "folder", badge: 3 }, { id: "starred", label: "Starred", icon: "star" }] }} />
<Story name="Active labels" args={{ activeId: "invoices", labels: "active", items: [{ id: "home", label: "Home", icon: "home" }, { id: "invoices", label: "Invoices", icon: "folder", badge: true }, { id: "starred", label: "Starred", icon: "star", disabled: true }] }} />
<Story name="Switches item" args={{ activeId: "home", onchange: fn(), items: [{ id: "home", label: "Home", icon: "home" }, { id: "invoices", label: "Invoices", icon: "folder" }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Invoices/ }));
		await expect(args.onchange).toHaveBeenCalledWith('invoices');
	}} />
