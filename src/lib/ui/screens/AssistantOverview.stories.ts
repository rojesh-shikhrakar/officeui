import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AssistantOverview from './AssistantOverview.svelte';

const meta = { title: 'Screens/AI Chat/Overview', component: AssistantOverview, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AssistantOverview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('img', { name: /Activity/ })).toBeInTheDocument();
		await expect(canvasElement.textContent).toContain('1,284');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const NearlyOut: Story = { args: { used: 1920 } };
