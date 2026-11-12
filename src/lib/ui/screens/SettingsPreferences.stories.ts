import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsPreferences from './SettingsPreferences.svelte';

const meta = { title: 'Screens/Settings/Preferences', component: SettingsPreferences, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsPreferences>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Switch to Auto' }));
		await expect(c.queryByRole('button', { name: 'Switch to Auto' })).toBeNull();
		await userEvent.click(c.getByRole('radio', { name: 'Dark' }));
		await expect(canvasElement.textContent).toContain('Always dark');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
