import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentPermissions from './AgentPermissions.svelte';

const meta = { title: 'Screens/Agent/Permissions', component: AgentPermissions, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentPermissions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: /Careful/ }));
		await expect(c.getByRole('radio', { name: /Careful/ })).toHaveAttribute('aria-checked', 'true');
		await userEvent.selectOptions(c.getByRole('combobox', { name: 'Issue refunds permission' }), 'never');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
