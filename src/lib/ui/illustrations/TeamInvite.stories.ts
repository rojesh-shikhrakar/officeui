import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import TeamInvite from './TeamInvite.svelte';

const meta = { title: 'Illustrations/Team Invite', component: TeamInvite, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof TeamInvite>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const Large: Story = { args: { class: 'sb-illo-lg' } };
