import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import MetricsDashboard from './MetricsDashboard.svelte';

const meta = { title: 'Blocks/Metrics Dashboard', component: MetricsDashboard, tags: ['autodocs'] } satisfies Meta<typeof MetricsDashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Orders/ }));
		await expect(c.getByRole('img', { name: /Orders/ })).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Bar chart' }));
		await userEvent.click(c.getByRole('switch'));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
