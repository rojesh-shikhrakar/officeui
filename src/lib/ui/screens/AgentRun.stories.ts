import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentRun from './AgentRun.svelte';

const meta = { title: 'Screens/AI Chat/Run', component: AgentRun, tags: ['autodocs'], args: {"autoplay": false}, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentRun>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Stop run/ }));
		await expect(canvasElement.textContent).toContain('Stopped');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
