import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsPrivacy from './SettingsPrivacy.svelte';

const meta = { title: 'Screens/Settings/Privacy', component: SettingsPrivacy, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsPrivacy>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Sign out others/ }));
		await expect(canvasElement.textContent).not.toContain('Desktop app on Windows');
		await userEvent.click(c.getByRole('button', { name: 'Subscribe' }));
		await expect(c.getByRole('button', { name: 'Unsubscribe' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
