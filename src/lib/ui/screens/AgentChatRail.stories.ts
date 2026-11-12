import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentChatRail from './AgentChatRail.svelte';

const meta = { title: 'Screens/AI Chat/Double Sidebar', component: AgentChatRail, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentChatRail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getAllByRole('cell')[5]);
		await userEvent.click(c.getByRole('tab', { name: /sources.md/ }));
		await expect(canvasElement.textContent).toContain('Fabric weight guide');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
