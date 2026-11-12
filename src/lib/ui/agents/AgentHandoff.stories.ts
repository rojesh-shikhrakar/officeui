import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentHandoff from './AgentHandoff.svelte';

const meta = { title: 'Components/Agents/Agent Handoff', component: AgentHandoff, tags: ['autodocs'] } satisfies Meta<typeof AgentHandoff>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getAllByRole('button', { name: /Reply to churned team/ })[0]);
		await expect(canvasElement.textContent).toContain('Got lost');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
