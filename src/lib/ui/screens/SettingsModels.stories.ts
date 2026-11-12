import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsModels from './SettingsModels.svelte';

const meta = { title: 'Screens/Settings/Models', component: SettingsModels, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsModels>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('switch', { name: 'Prism Ultra on' }));
		await expect(c.getByRole('switch', { name: 'Prism Ultra on' })).toBeChecked();
		await userEvent.click(c.getByRole('tab', { name: 'Image' }));
		await expect(c.queryByRole('switch', { name: 'Atlas Mini on' })).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
