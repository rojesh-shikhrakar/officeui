import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AppShellFlat from './AppShellFlat.svelte';

const meta = { title: 'Screens/App Shell/Flat', component: AppShellFlat, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AppShellFlat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Search the menu' }), 'hir');
		await expect(c.getByRole('button', { name: /Hiring/ })).toBeInTheDocument();
		await expect(c.queryByRole('button', { name: /Research/ })).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
