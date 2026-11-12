import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import CostWaterfall from './CostWaterfall.svelte';

const meta = { title: 'Components/Agents/Cost Waterfall', component: CostWaterfall, tags: ['autodocs'] } satisfies Meta<typeof CostWaterfall>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Fold Researcher' }));
		await expect(canvasElement.textContent).toContain('+4');
		await userEvent.click(c.getByRole('tab', { name: 'Tokens' }));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Finished: Story = { args: { autoplay: false } };
