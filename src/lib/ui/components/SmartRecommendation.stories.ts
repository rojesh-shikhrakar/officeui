import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import SmartRecommendation from './SmartRecommendation.svelte';

const meta = { title: 'Components/Cards/Smart Recommendation', component: SmartRecommendation, tags: ['autodocs'], args: { onaccept: fn(), onundo: fn() } } satisfies Meta<typeof SmartRecommendation>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Accept incremental sync' }));
		await expect(args.onaccept).toHaveBeenCalledOnce();
		await expect(c.getByRole('status')).toHaveTextContent('Incremental sync accepted');
		await userEvent.click(c.getByRole('button', { name: 'Undo' }));
		await expect(args.onundo).toHaveBeenCalledOnce();
	}
};
export const PickAlternative: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Alternatives' }));
		await userEvent.click(c.getByRole('menuitemradio', { name: /Streaming/ }));
		await expect(c.getByText('Alternative')).toBeInTheDocument();
		await expect(c.getByRole('button', { name: 'Accept streaming' })).toBeInTheDocument();
	}
};
export const Collapsed: Story = { args: { defaultOpen: false } };
export const WeakSignal: Story = { args: { options: [{ id: 'x', label: 'Weekly backups', reason: 'Few changes so far – daily may be overkill.', signal: 1 }] } };
