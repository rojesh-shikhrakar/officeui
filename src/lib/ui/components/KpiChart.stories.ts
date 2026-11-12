import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import KpiChart from './KpiChart.svelte';

const meta = { title: 'Components/Data display/KPI Chart', component: KpiChart, tags: ['autodocs'] } satisfies Meta<typeof KpiChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const search = c.getByRole('button', { name: 'Search' });
		await userEvent.click(search);
		await expect(search).toHaveAttribute('aria-pressed', 'false');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Signups: Story = { args: { title: 'Signups', value: '12,480', delta: '+9%', caption: 'Top 2 channels', max: 6, lines: [{ name: 'Organic', color: '#4f9cf9', values: [2, 3, 2.5, 4, 3.5, 4.5, 5] }, { name: 'Paid', color: '#ec4899', values: [1, 1.5, 2, 1.8, 2.4, 2.2, 3] }] } };
