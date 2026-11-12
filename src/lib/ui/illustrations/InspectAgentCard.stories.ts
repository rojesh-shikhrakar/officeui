import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import InspectAgentCard from './InspectAgentCard.svelte';

const meta = { title: 'Illustrations/Inspect Agent Card', component: InspectAgentCard, tags: ['autodocs'] } satisfies Meta<typeof InspectAgentCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('img', { name: /agent card/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Writer: Story = { args: { agent: 'Writer', model: 'Atlas Pro', task: 'Write the copy for the three plans' } };
