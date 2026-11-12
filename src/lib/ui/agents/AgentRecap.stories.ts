import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentRecap from './AgentRecap.svelte';

const meta = { title: 'Components/Agents/Agent Recap', component: AgentRecap, tags: ['autodocs'] } satisfies Meta<typeof AgentRecap>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Approve: Refund $240 to Acme Corp' }));
		await expect(canvasElement.textContent).toContain('Approved just now');
		await userEvent.click(c.getByRole('button', { name: 'Undo: Answered support tickets' }));
		await expect(canvasElement.textContent).toContain('Undone');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
