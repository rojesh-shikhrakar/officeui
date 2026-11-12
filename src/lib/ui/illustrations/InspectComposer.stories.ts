import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import InspectComposer from './InspectComposer.svelte';

const meta = { title: 'Illustrations/Inspect Composer', component: InspectComposer, tags: ['autodocs'] } satisfies Meta<typeof InspectComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('img', { name: /chat composer/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Other: Story = { args: { prompt: 'Summarise the board memo', mode: 'Ask' } };
