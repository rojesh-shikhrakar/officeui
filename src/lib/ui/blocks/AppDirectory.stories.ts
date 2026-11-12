import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AppDirectory from './AppDirectory.svelte';

const meta = { title: 'Blocks/App Directory', component: AppDirectory, tags: ['autodocs'] } satisfies Meta<typeof AppDirectory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getAllByRole('button', { name: 'Connect' })[0]);
		await expect(canvasElement.textContent).toContain('2 connected');
		await userEvent.type(c.getByRole('textbox', { name: 'Search apps' }), 'zzz');
		await expect(canvasElement.textContent).toContain('No apps match');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
