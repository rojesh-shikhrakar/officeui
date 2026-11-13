<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NavigationMenu from './NavigationMenu.svelte';
	const { Story } = defineMeta({ title: 'Components/Navigation/NavigationMenu', component: NavigationMenu, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ label: "Main", items: [{ id: "products", label: "Products", panel: { columns: [{ heading: "Accounting", links: [{ label: "Invoices", href: "#", description: "Send and track payments" }, { label: "Expenses", href: "#" }] }] } }, { id: "pricing", label: "Pricing", href: "#", active: true }, { id: "docs", label: "Docs", href: "#" }] }} />
<Story name="Open panel" args={{ label: "Main", openId: "products", pinned: true, items: [{ id: "products", label: "Products", panel: { columns: [{ heading: "Accounting", links: [{ label: "Invoices", href: "#", icon: "file" }, { label: "Expenses", href: "#", icon: "folder" }] }, { heading: "Reporting", links: [{ label: "Month end", href: "#" }] }], feature: { eyebrow: "New", title: "Release 2.14", description: "Faster reconciliation." } } }, { id: "docs", label: "Docs", href: "#" }] }} />
