import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentCursors from './AgentCursors.svelte';

const meta = { title: 'Components/Agents/Agent Cursors', component: AgentCursors, tags: ['autodocs'] } satisfies Meta<typeof AgentCursors>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Accept all' }));
		await expect(c.getByRole('button', { name: 'Accept all' })).toBeDisabled();
		await userEvent.click(c.getByRole('button', { name: /Comment from Coder/ }));
		await userEvent.click(c.getByRole('button', { name: /Resolve/ }));
		await userEvent.click(c.getByRole('tab', { name: 'Table' }));
		await expect(canvasElement.textContent).toContain('Milestone');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
