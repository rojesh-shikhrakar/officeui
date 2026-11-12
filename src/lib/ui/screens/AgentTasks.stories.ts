import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentTasks from './AgentTasks.svelte';

const meta = { title: 'Screens/Agent/Tasks', component: AgentTasks, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentTasks>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Decide' }));
		await expect(c.queryByRole('button', { name: 'Decide' })).toBeNull();
		await userEvent.click(c.getByRole('button', { name: /Platform/ }));
		await expect(c.queryByText('Billing webhooks')).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
