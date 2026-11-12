import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentChat from './AgentChat.svelte';

const meta = { title: 'Screens/AI Chat/Agents', component: AgentChat, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentChat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: /Social proof/ }));
		await userEvent.click(c.getByRole('button', { name: 'Generate ads' }));
		await expect(canvasElement.textContent).toContain('social proof angle');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
