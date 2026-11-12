import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ProjectFlow from './ProjectFlow.svelte';

const meta = { title: 'Illustrations/Project Flow', component: ProjectFlow, tags: ['autodocs'], args: {"autoplay": false} } satisfies Meta<typeof ProjectFlow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('Assigned Roles')).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Animated: Story = { args: { autoplay: true } };
