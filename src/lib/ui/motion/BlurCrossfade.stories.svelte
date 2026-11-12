<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import BlurCrossfade from './BlurCrossfade.svelte';

	const { Story } = defineMeta({ title: 'Motion/Blur Crossfade', component: BlurCrossfade, tags: ['autodocs'] });
	const slides = [
		{ tag: 'Shipped', tone: 'green', text: 'Dark mode is live for everyone.' },
		{ tag: 'In review', tone: 'amber', text: 'Usage limits now show on the plan table, with a link to raise them.' },
		{ tag: 'Planned', tone: 'blue', text: 'Shared folders arrive next month.' }
	];
</script>

<script lang="ts">
	import '../agents/agents.css';
	let i = $state(0);
	let tall = $state(false);
</script>

{#snippet card(dark = false)}
	<div class="ui-ag ui-ag-card" data-theme={dark ? 'dark' : undefined} style="width: 340px; padding: 16px; display: grid; gap: 14px">
		<div class="ui-ag-row"><span class="ui-ag-grow"><b style="font-weight: 500">Release 2.4</b><br /><small class="ui-ag-muted">3 changes · draft</small></span><button class="ui-ag-btn" data-variant="primary">Publish</button></div>
		<BlurCrossfade key={i}>
			<div style="background: var(--ag-fill); border-radius: 10px; padding: 12px; display: grid; gap: 8px; justify-items: start">
				<span class="ui-ag-pill" data-tone={slides[i].tone}>{slides[i].tag}</span><span>{slides[i].text}</span>
			</div>
		</BlurCrossfade>
		<div class="ui-ag-row"><span class="ui-ag-grow" style="display: flex; gap: 4px">{#each slides as _, j (j)}<i style="height: 4px; border-radius: 2px; background: {j === i ? 'var(--ag-ink)' : 'var(--ag-line)'}; width: {j === i ? 14 : 4}px"></i>{/each}</span><button class="ui-ag-btn" onclick={() => (i = (i + 1) % slides.length)}>Next</button></div>
	</div>
{/snippet}

<Story
	name="Default"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('Dark mode is live for everyone.')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Next' }));
		await expect(await c.findByText(/Usage limits now show/)).toBeInTheDocument();
	}}
>
	{@render card()}
</Story>

<Story name="Dark" asChild globals={{ theme: 'dark' }}>{@render card()}</Story>

<Story
	name="Size change"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Toggle' }));
		await expect(c.getByText(/Three paragraphs/)).toBeInTheDocument();
	}}
>
	<div style="display: grid; gap: 10px; width: 300px">
		<button onclick={() => (tall = !tall)}>Toggle</button>
		<BlurCrossfade key={tall}><p style="margin: 0; padding: 12px; background: #f4f4f5; border-radius: 10px">{tall ? 'Three paragraphs of detail: the box glides to fit the new content while the old content blurs away and the new one sharpens in. Nothing jumps.' : 'One line.'}</p></BlurCrossfade>
	</div>
</Story>
