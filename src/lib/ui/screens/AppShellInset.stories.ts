import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AppShellInset from './AppShellInset.svelte';

const meta = { title: 'Screens/App Shell/Inset', component: AppShellInset, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AppShellInset>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'New tab' }));
		await expect(c.getAllByRole('button', { name: 'Close tab' })).toHaveLength(2);
		await userEvent.click(c.getByRole('button', { name: 'Collapse sidebar' }));
		await expect(c.getByRole('button', { name: 'Open sidebar' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const NoPanel: Story = { args: { panel: false } };
