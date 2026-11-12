import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import TraceWaterfall from './TraceWaterfall.svelte';

const meta = { title: 'Components/Agents/Trace Waterfall', component: TraceWaterfall, tags: ['autodocs'] } satisfies Meta<typeof TraceWaterfall>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('15.0s')).toBeInTheDocument();
		await expect(c.getByText('19,570 tokens')).toBeInTheDocument();
	}
};
export const ShortRun: Story = { args: { spans: [{ id: 'a', name: 'answer', kind: 'llm', start: 0, dur: 1.2, tokens: 420, cost: 0.002, depth: 0 }, { id: 'b', name: 'lookup_order', kind: 'tool', start: 0.3, dur: 0.4, cost: 0, depth: 1 }] } };
export const Dark: Story = { globals: { theme: 'dark' } };
