<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Accordion from './Accordion.svelte';

	const { Story } = defineMeta({
		title: 'Components/Navigation/Accordion',
		component: Accordion,
		tags: ['autodocs'],
		args: { multiple: false, items: [{ id: 'a', title: 'What is included?' }, { id: 'b', title: 'Can I cancel?' }] }
	});
</script>

{#snippet a()}Everything in the plan.{/snippet}
{#snippet b()}Yes, any time.{/snippet}

<Story name="Default" asChild play={async ({ canvasElement }) => {
	const b = within(canvasElement).getByRole('button', { name: 'What is included?' });
	await expect(b).toHaveAttribute('aria-expanded', 'false');
	await userEvent.click(b);
	await expect(b).toHaveAttribute('aria-expanded', 'true');
}}>
	<Accordion items={[{ id: 'a', title: 'What is included?', content: a }, { id: 'b', title: 'Can I cancel?', content: b }]} />
</Story>
<Story name="Boxed multiple" asChild>
	<Accordion variant="boxed" multiple open={['a', 'b']} items={[{ id: 'a', title: 'What is included?', content: a }, { id: 'b', title: 'Can I cancel?', content: b }]} />
</Story>
