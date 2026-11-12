import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import PermissionRequest from './PermissionRequest.svelte';

const meta = { title: 'Components/Agents/Permission Request', component: PermissionRequest, tags: ['autodocs'] } satisfies Meta<typeof PermissionRequest>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: '1 hour' }));
		await userEvent.click(c.getByRole('button', { name: /Allow for 1 hour/ }));
		await expect(canvasElement.textContent).toContain('Allowed for 1 hour');
		await userEvent.click(c.getByRole('button', { name: 'Revoke' }));
		await expect(canvasElement.textContent).toContain('Revoked');
		await expect(c.queryByRole('radio', { name: 'Always' })).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
