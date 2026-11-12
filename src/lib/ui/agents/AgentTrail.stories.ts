import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentTrail from './AgentTrail.svelte';

const meta = { title: 'Components/Agents/Agent Trail', component: AgentTrail, tags: ['autodocs'] } satisfies Meta<typeof AgentTrail>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Patch the checkout form/ }));
		await expect(canvasElement.textContent).not.toContain('Found the empty-cart case');
		await userEvent.click(c.getByRole('button', { name: 'Approval' }));
		await expect(canvasElement.textContent).toContain('Opening');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
