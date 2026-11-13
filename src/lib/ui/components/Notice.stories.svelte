<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Notice from './Notice.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Notice',
		component: Notice,
		tags: ['autodocs'],
		args: { tone: 'info', title: 'Heads up', compact: false }
	});
</script>

<Story name="Default" asChild><Notice title="Heads up">Your trial ends in 3 days.</Notice></Story>
<Story name="Tones" asChild>
	<div style="display: grid; gap: 10px; width: 420px">
		<Notice tone="success">Saved.</Notice>
		<Notice tone="warning" title="Almost full">Storage is at 92%.</Notice>
		<Notice tone="danger" compact>Payment failed.</Notice>
	</div>
</Story>
<Story name="Dismissible" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()}>
	<Notice tone="info" ondismiss={() => {}}>Closable message.</Notice>
</Story>
