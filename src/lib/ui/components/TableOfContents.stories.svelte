<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TableOfContents from './TableOfContents.svelte';
	const { Story } = defineMeta({ title: 'Components/Navigation/TableOfContents', component: TableOfContents, tags: ['autodocs'] });
</script>

<Story name="Rail" args={{ title: "On this page", activeId: "pricing", items: [{ id: "overview", label: "Overview" }, { id: "pricing", label: "Pricing" }, { id: "limits", label: "Usage limits", level: 2 }, { id: "billing", label: "Billing" }] }} />
<Story name="No title" args={{ title: false, items: [{ id: "overview", label: "Overview" }, { id: "billing", label: "Billing" }] }} />
