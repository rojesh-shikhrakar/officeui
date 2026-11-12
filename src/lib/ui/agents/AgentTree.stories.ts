import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentTree from './AgentTree.svelte';

const meta = {
	title: 'Components/Agents/Agent Tree',
	component: AgentTree,
	tags: ['autodocs'],
	argTypes: { expanded: { control: 'boolean' } }
} satisfies Meta<typeof AgentTree>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('Orchestrator')).toBeInTheDocument();
		await expect(c.getByText('Researcher')).toBeInTheDocument();
		// Folding hides the sub-agents, unfolding brings them back
		await userEvent.click(c.getByRole('button', { name: 'Fold' }));
		await expect(c.queryByText('Researcher')).toBeNull();
		await userEvent.click(c.getByRole('button', { name: '2 sub-agents' }));
		await expect(c.getByText('Coder')).toBeInTheDocument();
	}
};

export const Folded: Story = { args: { expanded: false } };

export const Failed: Story = {
	args: {
		root: {
			id: 'o',
			name: 'Orchestrator',
			model: 'Opus 5.5',
			task: 'Migrate the billing service',
			cost: 0.11,
			secs: 140,
			status: 'failed',
			children: [{ id: 'a', name: 'Migrator', model: 'GPT-6 Sol', task: 'Hit the API rate limit', cost: 0.32, secs: 96, status: 'failed' }]
		}
	},
	play: async ({ canvasElement }) => {
		await expect(within(canvasElement).getAllByText('Failed')).toHaveLength(2);
	}
};

export const SingleAgent: Story = {
	args: { root: { id: 'o', name: 'Writer', model: 'Sonnet 5.5', task: 'Draft the launch email', cost: 0.02, secs: 12, status: 'waiting' } }
};
