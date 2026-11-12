import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileMenu from './ProfileMenu.svelte';

const meta = { title: 'Components/Navigation/Profile Menu', component: ProfileMenu, tags: ['autodocs'] } satisfies Meta<typeof ProfileMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const settings = fn();
export const Default: Story = {
	args: { items: [{ id: 'settings', label: 'Settings', icon: 'settings', onSelect: settings }, { id: 'docs', label: 'Docs', icon: 'docs' }, { id: 'apps', label: 'Apps', icon: 'apps', badge: 'New' }, { id: 'logout', label: 'Logout', icon: 'logout' }] },
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('menuitem', { name: 'Settings' }));
		await expect(settings).toHaveBeenCalledOnce();
		await userEvent.keyboard('{ArrowDown}');
		await expect(c.getByRole('menuitem', { name: 'Docs' })).toHaveFocus();
		await expect(c.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
	}
};
export const SetupDone: Story = { args: { setup: { done: 5, total: 5 } } };
export const NoSetup: Story = { args: { setup: undefined, name: 'Sam Lee', email: 'sam@northwind.io' } };
export const WithLanguage: Story = { args: { items: [{ id: 'l', label: 'Language', icon: 'language' }, { id: 's', label: 'Settings', icon: 'settings' }, { id: 'o', label: 'Logout', icon: 'logout' }] } };
