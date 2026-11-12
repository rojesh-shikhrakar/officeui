import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import FanOutGrid from './FanOutGrid.svelte';

const meta = { title: 'Components/Agents/Fan Out Grid', component: FanOutGrid, tags: ['autodocs'] } satisfies Meta<typeof FanOutGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('img', { name: /tasks done/ })).toBeInTheDocument();
		await expect(canvasElement.textContent).toContain('Enrich 240 leads');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const SmallJob: Story = { args: { job: 'Tag 60 tickets', total: 60, workers: 6 } };
