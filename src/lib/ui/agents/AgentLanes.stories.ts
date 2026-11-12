import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import AgentLanes from './AgentLanes.svelte';

const meta = { title: 'Components/Agents/Agent Lanes', component: AgentLanes, tags: ['autodocs'] } satisfies Meta<typeof AgentLanes>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('1 needs you', { exact: false })).toBeInTheDocument();
		await expect(c.getByText('Rotate API keys')).toBeInTheDocument();
	}
};
export const LastHour: Story = { args: { range: '1h' } };
export const TwoAgents: Story = {
	args: {
		lanes: [
			{ id: 'a', name: 'Planner', model: 'Opus 5.5', runs: [{ label: 'Break down the brief', from: 0, to: 45, tone: 'gray' }, { label: 'Review drafts', from: 70, to: 100, tone: 'blue' }] },
			{ id: 'b', name: 'Builder', model: 'GPT-6 Sol', runs: [{ label: 'Implement checkout', from: 30, to: 100, tone: 'blue' }] }
		]
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
