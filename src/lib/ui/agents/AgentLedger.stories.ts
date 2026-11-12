import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentLedger from './AgentLedger.svelte';

const meta = { title: 'Components/Agents/Agent Ledger', component: AgentLedger, tags: ['autodocs'] } satisfies Meta<typeof AgentLedger>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Undo: Created coupon/ }));
		await expect(canvasElement.textContent).toContain('Undone');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const TwoChanges: Story = { args: { autoplay: false } };
