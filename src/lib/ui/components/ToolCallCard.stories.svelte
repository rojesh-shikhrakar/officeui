<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import ToolCallCard from './ToolCallCard.svelte';
	import ToolCallGroup from './ToolCallGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/Agents/Tool Call Card',
		component: ToolCallCard,
		tags: ['autodocs'],
		args: { status: 'success' },
		argTypes: { status: { control: 'inline-radio', options: ['running', 'success', 'error'] } }
	});
</script>

<script lang="ts">
	let status = $state<'running' | 'success' | 'error'>('error');
	function retry() {
		status = 'running';
		setTimeout(() => (status = 'success'), 800);
	}
</script>

<Story
	name="Success"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		const head = c.getByRole('button', { name: /search_web/ });
		await userEvent.click(head);
		await expect(head).toHaveAttribute('aria-expanded', 'true');
		await expect(c.getByText('Arguments')).toBeInTheDocument();
	}}
/>
<Story name="Running" args={{ status: 'running', result: undefined, duration: undefined, startedAt: Date.now() - 2300, open: true }} />
<Story name="Error" args={{ status: 'error', error: 'Rate limited by the search API (429).', onretry: fn(), open: true, result: undefined }} />
<Story name="Long result" args={{ open: true, result: { rows: Array.from({ length: 30 }, (_, i) => ({ id: i + 1, company: `Company ${i + 1}`, seats: (i + 1) * 12 })) } }} />
<Story name="Plain text result" args={{ name: 'run_shell', summary: 'Ran the test suite', args: 'bun test', result: '✓ 61 passed\n0 failed', open: true }} />
<Story
	name="Retry flow"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Retry' }));
		await expect(await c.findByText('search_web finished', {}, { timeout: 2000 })).toBeInTheDocument();
	}}
>
	<div style="width: 460px">
		<ToolCallCard {status} error="Timed out after 30s." onretry={retry} result={status === 'success' ? { ok: true } : undefined} duration={status === 'success' ? 812 : undefined} />
	</div>
</Story>
<Story
	name="Group"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Used 3 tools/ }));
		await expect(c.getByRole('button', { name: /read_page/ })).toBeInTheDocument();
	}}
>
	<div style="width: 460px"><ToolCallGroup /></div>
</Story>
<Story name="Group running" asChild>
	<div style="width: 460px">
		<ToolCallGroup calls={[{ name: 'search_web', status: 'success', duration: 1200 }, { name: 'read_page', status: 'running', startedAt: Date.now() - 1500 }]} />
	</div>
</Story>
