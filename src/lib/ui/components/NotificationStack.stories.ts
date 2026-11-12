import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import NotificationStack from './NotificationStack.svelte';

const meta = {
	title: 'Components/Feedback/Notification Stack',
	component: NotificationStack,
	tags: ['autodocs'],
	args: { ondismiss: fn() }
} satisfies Meta<typeof NotificationStack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Dismiss Agent Graph is here' }));
		await expect(args.ondismiss).toHaveBeenCalledOnce();
		await waitFor(() => expect(c.queryByText('Agent Graph is here')).toBeNull(), { timeout: 1500 });
	}
};
export const Single: Story = { args: { notices: [{ id: 'x', badge: 'Update', title: 'Billing moved', text: 'Invoices now live under Settings → Billing.', action: { label: 'Open billing' } }] } };
export const Patterns: Story = {
	args: {
		notices: [
			{ id: 'g', badge: 'Grid', title: 'Grid pattern', text: 'Line art in the corner.', pattern: 'grid' },
			{ id: 'r', badge: 'Rays', title: 'Rays pattern', text: 'Behind the first card.', pattern: 'rays' }
		]
	}
};
export const Empty: Story = { args: { notices: [] } };
