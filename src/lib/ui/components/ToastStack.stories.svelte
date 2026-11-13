<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ToastStack from './ToastStack.svelte';
	import { useToasts } from '../utils/toasts.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/ToastStack',
		component: ToastStack,
		tags: ['autodocs'],
		args: { toasts: [{ id: 1, tone: 'success', title: 'Saved', description: 'All changes kept' }, { id: 2, tone: 'danger', title: 'Upload failed', description: 'Try again' }], position: 'top-right', inline: true }
	});
</script>

<Story name="Default" asChild>
	<div style="position: relative; height: 220px"><ToastStack toasts={[{ id: 1, tone: 'success', title: 'Saved', description: 'All changes kept' }, { id: 2, tone: 'danger', title: 'Upload failed' }]} inline position="top-right" /></div>
</Story>
<Story name="Dismissible" asChild play={async ({ canvasElement }) => {
	const c = within(canvasElement);
	await userEvent.click(c.getByRole('button', { name: 'Push' }));
	await expect(c.getByText('Hello')).toBeInTheDocument();
	await userEvent.click(c.getByRole('button', { name: 'Dismiss' }));
	await expect(c.queryByText('Hello')).toBeNull();
}}>
	{@const t = useToasts(0)}
	<div style="position: relative; height: 220px">
		<button onclick={() => t.push({ title: 'Hello', tone: 'info' })}>Push</button>
		<ToastStack toasts={t.toasts} ondismiss={t.dismiss} inline position="bottom-right" />
	</div>
</Story>
