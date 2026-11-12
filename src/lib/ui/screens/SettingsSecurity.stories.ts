import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsSecurity from './SettingsSecurity.svelte';

const meta = { title: 'Screens/Settings/Security', component: SettingsSecurity, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsSecurity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Verify' }));
		await expect(canvasElement.textContent).not.toContain('Pending');
		await userEvent.click(c.getByRole('switch', { name: /single sign-on/ }));
		await expect(canvasElement.textContent).not.toContain('Identity provider');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
