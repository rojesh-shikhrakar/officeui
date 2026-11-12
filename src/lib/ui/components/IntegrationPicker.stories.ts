import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import IntegrationPicker from './IntegrationPicker.svelte';

const meta = { title: 'Components/Navigation/Integration Picker', component: IntegrationPicker, tags: ['autodocs'] } satisfies Meta<typeof IntegrationPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Search integrations' }), 'canv');
		await userEvent.click(c.getByRole('switch', { name: 'Connect Canvas' }));
		await expect(canvasElement.textContent).toContain('4 of 7 connected');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
