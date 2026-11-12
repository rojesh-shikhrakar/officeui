import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import ReactionBar from './ReactionBar.svelte';

const meta = { title: 'Components/Buttons/Reaction Bar', component: ReactionBar, tags: ['autodocs'], args: { onreact: fn() } } satisfies Meta<typeof ReactionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		const like = c.getByRole('button', { name: /^Like/ });
		await expect(like).toHaveAttribute('aria-pressed', 'true');
		await userEvent.click(like);
		await expect(like).toHaveAttribute('aria-pressed', 'false');
		await expect(args.onreact).toHaveBeenCalledWith('like', { active: false, count: 127 });
		await userEvent.click(c.getByRole('button', { name: /^Share/ }));
		await expect(c.getByRole('button', { name: 'Share, 1 share' })).toBeInTheDocument();
	}
};
export const BigNumbers: Story = { args: { reactions: { like: { count: 12840, active: true }, comment: { count: 1302 }, repost: { count: 999950 }, share: { count: 42 } } } };
export const LikeAndShare: Story = { args: { actions: ['like', 'share'] } };
export const Empty: Story = { args: { reactions: {} } };
