import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentSchedules from './AgentSchedules.svelte';

const meta = { title: 'Screens/Agent/Schedules', component: AgentSchedules, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentSchedules>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('switch', { name: 'Inbox triage on' }));
		await expect(canvasElement.textContent).toContain('5 / 7');
		await userEvent.click(c.getByRole('button', { name: /Run now/ }));
		await expect(canvasElement.textContent).toContain('Running…');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
