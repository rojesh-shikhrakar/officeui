import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Inbox from './Inbox.svelte';

const meta = { title: 'Screens/Agent/Inbox', component: Inbox, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Inbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: /Managed queue/ }));
		await userEvent.click(c.getByRole('button', { name: 'Send ↵' }));
		await expect(c.getByRole('heading', { name: /empty state/ })).toBeInTheDocument();
		await userEvent.click(c.getByRole('tab', { name: 'Done' }));
		await expect(canvasElement.textContent).toContain('Managed queue');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
