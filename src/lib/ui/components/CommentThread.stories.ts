import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import CommentThread from './CommentThread.svelte';

const meta = { title: 'Components/Chat/Comment Thread', component: CommentThread, tags: ['autodocs'] } satisfies Meta<typeof CommentThread>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onreply: (text: string) =>
			new Promise((r) => setTimeout(() => r({ id: `a-${Date.now()}`, author: { name: 'Assistant', assistant: true }, createdAt: Date.now(), text: `On it: “${text}”.` }), 400))
	},
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Edited 1 file/ }));
		await expect(c.getByRole('button', { name: /Edited 1 file/ })).toHaveAttribute('aria-expanded', 'true');
		await userEvent.type(c.getByRole('textbox', { name: 'Reply' }), 'Make it bolder{Enter}');
		await expect(await c.findByText('On it: “Make it bolder”.', {}, { timeout: 2000 })).toBeInTheDocument();
		await expect(c.getByText('5 messages')).toBeInTheDocument();
	}
};
export const WithClose: Story = {
	args: { onclose: fn() },
	play: async ({ args, canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Close comment' }));
		await expect(args.onclose).toHaveBeenCalledOnce();
	}
};
export const SingleComment: Story = { args: { assistant: undefined, messages: [{ id: '1', author: { name: 'Priya Patel' }, createdAt: Date.now() - 600e3, text: 'Love the new empty state!' }] } };
