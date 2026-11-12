import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentActivity from './AgentActivity.svelte';

const meta = { title: 'Screens/Agent/Activity', component: AgentActivity, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentActivity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getAllByRole('button', { name: /Undo/ })[0]);
		await userEvent.click(c.getByRole('tab', { name: /Undone/ }));
		await expect(canvasElement.textContent).toContain('weekly update');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
