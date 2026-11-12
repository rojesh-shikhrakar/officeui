import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Folder from './Folder.svelte';

const meta = { title: 'Screens/Folders/Detail', component: Folder, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Folder>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Remove Launch-Plan' }));
		await expect(canvasElement.textContent).not.toContain('Launch-Plan');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Empty: Story = { args: { files: [] } };
