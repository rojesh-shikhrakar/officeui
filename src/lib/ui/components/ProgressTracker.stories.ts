import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ProgressTracker from './ProgressTracker.svelte';

const meta = { title: 'Components/Feedback/Progress Tracker', component: ProgressTracker, tags: ['autodocs'], args: { onchange: fn() } } satisfies Meta<typeof ProgressTracker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		const bar = c.getByRole('progressbar');
		await expect(bar).toHaveAttribute('aria-valuenow', '2');
		await userEvent.click(c.getByRole('checkbox', { name: 'Invite your team' }));
		await expect(bar).toHaveAttribute('aria-valuenow', '3');
		await expect(args.onchange).toHaveBeenCalledOnce();
	}
};
export const AutoPlay: Story = {
	args: { autoPlay: true, interval: 300 },
	play: async ({ canvasElement }) => waitFor(() => expect(within(canvasElement).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3'), { timeout: 2000 })
};
export const Complete: Story = { args: { title: 'All set', steps: [{ id: '1', label: 'Profile', done: true }, { id: '2', label: 'Billing', done: true }, { id: '3', label: 'Team', done: true }] } };
export const Fresh: Story = { args: { steps: [{ id: '1', label: 'Pick a template' }, { id: '2', label: 'Name your agent' }, { id: '3', label: 'Give it a tool' }] } };
