import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentUsage from './AgentUsage.svelte';

const meta = { title: 'Screens/Agent/Usage', component: AgentUsage, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentUsage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: 'Models' }));
		await expect(canvasElement.textContent).toContain('Atlas Max');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const SmallBudget: Story = { args: { budget: 300 } };
