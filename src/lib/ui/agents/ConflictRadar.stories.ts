import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ConflictRadar from './ConflictRadar.svelte';

const meta = { title: 'Components/Agents/Conflict Radar', component: ConflictRadar, tags: ['autodocs'] } satisfies Meta<typeof ConflictRadar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('2 conflicts to settle');
		await userEvent.click(c.getAllByRole('button', { name: /Checkout/ })[0]);
		await expect(canvasElement.textContent).toContain('1 conflict to settle');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
