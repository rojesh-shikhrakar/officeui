import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsProfile from './SettingsProfile.svelte';

const meta = { title: 'Screens/Settings/Profile', component: SettingsProfile, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsProfile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Change' }));
		await expect(c.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
