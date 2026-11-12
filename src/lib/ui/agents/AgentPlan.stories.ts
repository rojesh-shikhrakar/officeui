import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentPlan from './AgentPlan.svelte';

const meta = { title: 'Components/Agents/Agent Plan', component: AgentPlan, tags: ['autodocs'] } satisfies Meta<typeof AgentPlan>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Remove step 1: Pull Q3 revenue and ARR' }));
		await userEvent.type(c.getByRole('textbox', { name: 'Add a step at the end' }), 'Ship it{Enter}');
		await expect(canvasElement.textContent).toContain('Ship it');
		await userEvent.click(c.getByRole('button', { name: /Run plan/ }));
		await expect(canvasElement.textContent).toContain('Running');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
