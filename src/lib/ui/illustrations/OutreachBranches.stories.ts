import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import OutreachBranches from './OutreachBranches.svelte';

const meta = { title: 'Illustrations/Outreach Branches', component: OutreachBranches, tags: ['autodocs'] } satisfies Meta<typeof OutreachBranches>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.hover(c.getAllByRole('button')[0]);
		await expect(c.getAllByRole('button')[0]).toHaveAttribute('data-hot');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
