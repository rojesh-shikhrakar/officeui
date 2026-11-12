import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import MemoryPanel from './MemoryPanel.svelte';

const meta = { title: 'Components/Agents/Memory Panel', component: MemoryPanel, tags: ['autodocs'] } satisfies Meta<typeof MemoryPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: '+ New memory' }));
		await userEvent.type(c.getByRole('textbox', { name: 'New memory' }), 'Prefers dark mode{Enter}');
		await expect(canvasElement.textContent).toContain('9 memories');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Off: Story = { args: { enabled: false } };
