<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Resizable from './Resizable.svelte';

	const { Story } = defineMeta({
		title: 'Components/Layout/Resizable',
		component: Resizable,
		tags: ['autodocs'],
		args: { height: '200px', label: 'Resize panels', defaultSize: 40 },
		argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } }
	});
</script>

{#snippet inv()}<div style="padding: 1rem">Invoices</div>{/snippet}
{#snippet det()}<div style="padding: 1rem">INV-20418 details</div>{/snippet}

<Story
	name="Horizontal"
	play={async ({ canvasElement }) => {
		const h = within(canvasElement).getByRole('separator');
		h.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(h).toHaveAttribute('aria-valuenow', '42');
		await userEvent.keyboard('{Enter}');
		await expect(h).toHaveAttribute('aria-valuenow', '40');
	}}
>
	{#snippet template(args)}<Resizable {...args} first={inv} second={det} />{/snippet}
</Story>
<Story name="Vertical" args={{ orientation: 'vertical', height: '260px', defaultSize: 50 }}>{#snippet template(args)}<Resizable {...args} first={inv} second={det} />{/snippet}</Story>
