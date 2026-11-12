import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import PlanVsActual from './PlanVsActual.svelte';

const meta = { title: 'Components/Agents/Plan Vs Actual', component: PlanVsActual, tags: ['autodocs'], args: {"autoplay": false} } satisfies Meta<typeof PlanVsActual>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('4s ahead');
		await expect(canvasElement.textContent).toContain('Wire up checkout');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
