<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import ErrorMessage from './ErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/ErrorMessage',
		component: ErrorMessage,
		tags: ['autodocs'],
		args: { title: 'Could not load invoices', description: 'The server did not respond. Check your connection and try again.', variant: 'block', onretry: fn() },
		argTypes: { variant: { control: 'inline-radio', options: ['inline', 'block', 'page'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement, args }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('alert')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Try again' }));
		await expect(args.onretry).toHaveBeenCalled();
	}} />
<Story name="Inline" args={{ variant: 'inline', title: 'Enter a valid email' }} />
<Story name="Page" args={{ variant: 'page', code: 500, title: 'Something went wrong' }} />
