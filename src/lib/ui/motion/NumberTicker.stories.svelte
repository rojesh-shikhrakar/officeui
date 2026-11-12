<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, waitFor, within } from 'storybook/test';
	import NumberTicker from './NumberTicker.svelte';

	const { Story } = defineMeta({ title: 'Motion/Number Ticker', component: NumberTicker, tags: ['autodocs'], args: { value: 48240, class: 'sb-display' } });
</script>

<script lang="ts">
	let n = $state(9998);
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByText('48,240')).toBeInTheDocument()} />
<Story name="Currency" args={{ value: 12480.5, format: { style: 'currency', currency: 'USD' } }} />
<Story name="Percent" args={{ value: 0.873, format: { style: 'percent', maximumFractionDigits: 1 } }} />
<Story name="No data" args={{ value: NaN }} />
<Story
	name="Counting up"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: '+1' }));
		await userEvent.click(c.getByRole('button', { name: '+1' }));
		await waitFor(() => expect(c.getByText('10,000')).toBeInTheDocument());
	}}
>
	<div style="display: grid; gap: 14px; justify-items: center">
		<NumberTicker value={n} class="sb-display" />
		<div style="display: flex; gap: 8px"><button onclick={() => (n -= 1)}>-1</button><button onclick={() => (n += 1)}>+1</button><button onclick={() => (n += 1234)}>+1,234</button></div>
	</div>
</Story>
