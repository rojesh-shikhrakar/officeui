import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Files from './Files.svelte';

const meta = { title: 'Screens/Folders/Overview', component: Files, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Files>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: '+ Create folder' }));
		await expect(canvasElement.textContent).toContain('New folder 1');
		await userEvent.click(c.getByRole('tab', { name: 'Private' }));
		await expect(c.queryByRole('button', { name: /Brand assets.*Shared/ })).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
