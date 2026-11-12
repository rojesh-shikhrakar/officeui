import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Integrations from './Integrations.svelte';

const meta = { title: 'Screens/Integrations', component: Integrations, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Integrations>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Connect Notes' }));
		await userEvent.click(c.getByRole('tab', { name: 'Connected' }));
		await expect(canvasElement.textContent).toContain('Notes');
		await expect(canvasElement.textContent).not.toContain('Tracker');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
