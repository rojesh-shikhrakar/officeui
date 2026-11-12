import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentCheckpoints from './AgentCheckpoints.svelte';

const meta = { title: 'Components/Agents/Agent Checkpoints', component: AgentCheckpoints, tags: ['autodocs'] } satisfies Meta<typeof AgentCheckpoints>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('2 attempts');
		await userEvent.click(c.getAllByRole('button', { name: /Rewind/ })[0]);
		await expect(canvasElement.textContent).toContain('New attempt from here');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const BeforeTheRun: Story = { args: { autoplay: false } };
