import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentInbox from './AgentInbox.svelte';

const meta = { title: 'Components/Agents/Agent Inbox', component: AgentInbox, tags: ['autodocs'] } satisfies Meta<typeof AgentInbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Board: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('Migrate users table')).toBeInTheDocument();
		await userEvent.click(c.getByRole('tab', { name: 'List' }));
		await expect(c.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true');
	}
};
export const List: Story = { args: { view: 'list' } };
export const Quiet: Story = { args: { columns: [{ id: 'done', label: 'Done', tasks: [{ id: '1', title: 'Nightly backup', text: 'All 14 databases backed up.', status: 'done', time: '2m 04s', tools: 14, edits: 0 }] }] } };
export const Dark: Story = { globals: { theme: 'dark' } };
