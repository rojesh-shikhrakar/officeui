import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import ChangeSummary from './ChangeSummary.svelte';

const meta = { title: 'Components/Data display/Change Summary', component: ChangeSummary, tags: ['autodocs'] } satisfies Meta<typeof ChangeSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { period: 'This week' },
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('region', { name: "What's changed" })).toBeInTheDocument();
		await expect(c.getAllByRole('term')).toHaveLength(4);
	}
};
export const AllGood: Story = { args: { title: 'Good week', changes: [{ label: 'Revenue', change: 'Up 18% to $42K', tone: 'good' }, { label: 'NPS', change: 'Up 6 to 61', tone: 'good' }] } };
export const BadNews: Story = { args: { title: 'Needs attention', period: 'Today', changes: [{ label: 'Errors', change: 'Up 3× to 1.2K', tone: 'bad', direction: 'up' }, { label: 'Uptime', change: 'Down to 99.2%', tone: 'bad' }] } };
export const Empty: Story = { args: { changes: [], period: 'This month' } };
