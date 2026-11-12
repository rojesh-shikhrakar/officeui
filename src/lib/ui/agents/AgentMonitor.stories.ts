import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentMonitor from './AgentMonitor.svelte';

const meta = { title: 'Components/Agents/Agent Monitor', component: AgentMonitor, tags: ['autodocs'] } satisfies Meta<typeof AgentMonitor>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Allow/ }));
		await expect(canvasElement.textContent).toContain('Posting the changelog');
		await userEvent.click(c.getByRole('button', { name: 'Fold away' }));
		await expect(c.getByRole('button', { name: 'Open the agent monitor' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
