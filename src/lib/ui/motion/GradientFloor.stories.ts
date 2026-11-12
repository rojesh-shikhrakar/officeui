import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import GradientFloor from './GradientFloor.svelte';

const meta = { title: 'Motion/Gradient Floor', component: GradientFloor, tags: ['autodocs'] } satisfies Meta<typeof GradientFloor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.querySelector('.ui-gfl')).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Ocean: Story = { args: { colors: ['#22d3ee', '#6366f1', '#a855f7'], height: 260 } };
export const Wide: Story = { args: { height: 200 }, parameters: { layout: 'fullscreen' } };
