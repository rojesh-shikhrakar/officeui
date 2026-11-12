<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import GradientText from './GradientText.svelte';

	const { Story } = defineMeta({ title: 'Motion/Gradient Text', component: GradientText, tags: ['autodocs'] });
</script>

<script lang="ts">
	let play = $state(0);
</script>

{#snippet hero(colors?: string[], word = 'feel.')}
	<div style="display: grid; gap: 18px; justify-items: center; text-align: center">
		<h1 style="margin: 0; font: 600 52px/1.05 Inter, sans-serif; letter-spacing: -0.04em; color: var(--ds-text, #171717)">Interfaces people<br />actually <GradientText text={word} {colors} bind:play /></h1>
		<button onclick={() => play++}>Replay</button>
	</div>
{/snippet}

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('feel.')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Replay' }));
		await expect(c.getByText('feel.')).toBeInTheDocument();
	}}
>
	{@render hero()}
</Story>
<Story name="Ocean" asChild>{@render hero(['#0ea5e9', '#6366f1', '#22d3ee'], 'flow.')}</Story>
<Story name="Dark" asChild globals={{ theme: 'dark' }}>{@render hero()}</Story>
