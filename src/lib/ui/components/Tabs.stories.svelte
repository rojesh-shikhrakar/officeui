<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tabs from './Tabs.svelte';
	import { expect, fn } from 'storybook/test';
	const { Story } = defineMeta({ title: 'Components/Navigation/Tabs', component: Tabs, tags: ['autodocs'] });
</script>

<Story name="Segmented" args={{ active: "all", tabs: [{ id: "all", label: "All", count: 24 }, { id: "open", label: "Open", count: 8 }, { id: "paid", label: "Paid" }] }} />
<Story name="Underline" args={{ variant: "underline", active: "open", tabs: [{ id: "all", label: "All" }, { id: "open", label: "Open", count: 8 }, { id: "paid", label: "Paid" }] }} />
<Story name="With content" args={{ variant: "underline" }}>
	{#snippet template(args)}
		{#snippet a()}<p>Invoices awaiting approval.</p>{/snippet}
		{#snippet b()}<p>Invoices already paid.</p>{/snippet}
		<Tabs {...args} tabs={[{ id: "open", label: "Open", content: a }, { id: "paid", label: "Paid", content: b }]} />
	{/snippet}
</Story>
<Story name="Switches tabs" args={{ active: "all", onchange: fn(), tabs: [{ id: "all", label: "All" }, { id: "open", label: "Open" }, { id: "paid", label: "Paid" }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Open' }));
		await expect(canvas.getByRole('tab', { name: 'Open' })).toHaveAttribute('aria-selected', 'true');
		await expect(args.onchange).toHaveBeenCalledWith('open');
		await userEvent.keyboard('{ArrowRight}');
		await expect(canvas.getByRole('tab', { name: 'Paid' })).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{Home}');
		await expect(canvas.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
	}} />
