import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Crm from './Crm.svelte';

const meta = { title: 'Screens/CRM', component: Crm, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Crm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.dblClick(c.getByText('Northwind'));
		const input = c.getByRole('textbox', { name: 'Edit name' });
		await userEvent.clear(input);
		await userEvent.type(input, 'Northwind Ltd{Enter}');
		await expect(c.getByText('Northwind Ltd')).toBeInTheDocument();
		await userEvent.click(c.getByRole('checkbox', { name: 'Select Taskly' }));
		await expect(canvasElement.textContent).toContain('1 selected');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
