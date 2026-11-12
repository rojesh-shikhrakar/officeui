import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import GlassFolder from './GlassFolder.svelte';

const meta = { title: 'Illustrations/Glass Folder', component: GlassFolder, tags: ['autodocs'] } satisfies Meta<typeof GlassFolder>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const b = c.getByRole('button', { name: 'Folder with documents' });
		await userEvent.click(b);
		await expect(b).toHaveAttribute('aria-pressed', 'true');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Open: Story = { args: { open: true } };
export const Mint: Story = { args: { color: '#34d399' } };
