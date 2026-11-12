import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Toaster from './Toaster.svelte';

const meta = { title: 'Components/Feedback/Toaster', component: Toaster, tags: ['autodocs'] } satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Delete file/ }));
		await expect(canvasElement.textContent).toContain('File deleted');
		await expect(c.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Empty: Story = { args: { toasts: [] } };
