import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsNotifications from './SettingsNotifications.svelte';

const meta = { title: 'Screens/Settings/Notifications', component: SettingsNotifications, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsNotifications>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('switch', { name: /Daily digest/ }));
		await expect(canvasElement.textContent).not.toContain('Send at');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
