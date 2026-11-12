import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentGraph from './AgentGraph.svelte';

const meta = { title: 'Components/Agents/Agent Graph', component: AgentGraph, tags: ['autodocs'], args: { class: 'sb-wide' } } satisfies Meta<typeof AgentGraph>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.hover(c.getByRole('button', { name: /Writer/ }));
		await expect(canvasElement.querySelectorAll('line[data-dim]').length).toBeGreaterThan(0);
	}
};
export const Small: Story = {
	args: {
		nodes: [
			{ id: 'a', label: 'Support agent', kind: 'agent', x: 50, y: 25, active: true },
			{ id: 'b', label: 'lookup_order', kind: 'tool', x: 25, y: 75, active: true },
			{ id: 'c', label: 'refund', kind: 'tool', x: 75, y: 75 }
		],
		edges: [
			['a', 'b'],
			['a', 'c']
		]
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
