import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import DecisionInbox from './DecisionInbox.svelte';

const meta = { title: 'Components/Feedback/Decision Inbox', component: DecisionInbox, tags: ['autodocs'], args: { ondecide: fn() } } satisfies Meta<typeof DecisionInbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('3 need your input')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Send it' }));
		await expect(args.ondecide).toHaveBeenCalledOnce();
		await expect(c.getByRole('status')).toHaveTextContent('Send it');
		await expect(c.getByText('2 need your input')).toBeInTheDocument();
		// The next folded decision opens on its own after the confirmation
		await waitFor(() => expect(c.getByRole('button', { name: 'Merge' })).toBeInTheDocument(), { timeout: 2500 });
	}
};
export const AllOpen: Story = {
	args: {
		decisions: [
			{ id: '1', title: 'Publish the pricing page?', detail: 'The writer and reviewer both signed off.', primary: 'Publish', secondary: 'Not yet' },
			{ id: '2', title: 'Rotate the API keys now?', detail: 'Two services will restart.', primary: 'Rotate', secondary: 'Tonight' }
		]
	}
};
export const Single: Story = { args: { decisions: [{ id: '1', title: 'Refund order #2291?', primary: 'Refund', secondary: 'Decline' }] } };
export const AllCaughtUp: Story = { args: { decisions: [] } };
