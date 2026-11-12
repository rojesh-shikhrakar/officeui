import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import KpiBoard from './KpiBoard.svelte';

const meta = { title: 'Blocks/KPI Board', component: KpiBoard, tags: ['autodocs'] } satisfies Meta<typeof KpiBoard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('883 licenses');
		await userEvent.selectOptions(c.getByRole('combobox', { name: 'Period' }), '0');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
