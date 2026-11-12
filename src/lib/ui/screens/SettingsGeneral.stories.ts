import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsGeneral from './SettingsGeneral.svelte';

const meta = { title: 'Screens/Settings/General', component: SettingsGeneral, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsGeneral>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Delete workspace/ }));
		const del = c.getByRole('button', { name: 'Delete for good' });
		await expect(del).toBeDisabled();
		await userEvent.type(c.getByRole('textbox', { name: /Type the workspace name/ }), 'Acme');
		await expect(del).toBeEnabled();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
