import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import SettingsMembers from './SettingsMembers.svelte';

const meta = { title: 'Screens/Settings/Teams', component: SettingsMembers, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SettingsMembers>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Invite members' }));
		await userEvent.type(c.getByRole('textbox', { name: 'Email to invite' }), 'kim@acme.com{Enter}');
		await expect(canvasElement.textContent).toContain('kim@acme.com');
		await expect(canvasElement.textContent).toContain('7 of 10');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
