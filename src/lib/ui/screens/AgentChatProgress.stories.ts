import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentChatProgress from './AgentChatProgress.svelte';

const meta = { title: 'Screens/AI Chat/Progress', component: AgentChatProgress, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentChatProgress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Outputs/ }));
		await expect(c.queryByText('Team Directory')).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
