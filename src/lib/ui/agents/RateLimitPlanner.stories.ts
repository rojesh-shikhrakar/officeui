import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import RateLimitPlanner from './RateLimitPlanner.svelte';

const meta = { title: 'Components/Agents/Rate Limit Planner', component: RateLimitPlanner, tags: ['autodocs'] } satisfies Meta<typeof RateLimitPlanner>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: '+ Add run' }));
		await expect(canvasElement.textContent).toContain('5 runs');
		await userEvent.click(c.getByRole('button', { name: /Spread out/ }));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
