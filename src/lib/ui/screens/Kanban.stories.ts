import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Kanban from './Kanban.svelte';

const meta = { title: 'Screens/Kanban', component: Kanban, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Kanban>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'List' }));
		await expect(c.getByRole('table')).toBeInTheDocument();
		await userEvent.click(c.getByRole('tab', { name: /Completed/ }));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
