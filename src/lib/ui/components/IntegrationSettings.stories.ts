import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import IntegrationSettings from './IntegrationSettings.svelte';

const meta = { title: 'Components/Inputs/Integration Settings', component: IntegrationSettings, tags: ['autodocs'] } satisfies Meta<typeof IntegrationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const site = c.getByRole('textbox', { name: 'Site address' });
		await userEvent.clear(site);
		await userEvent.type(site, 'bad');
		await expect(canvasElement.textContent).toContain('Enter a domain like');
		await expect(c.getByRole('button', { name: 'Save' })).toBeDisabled();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Disabled: Story = { args: { enabled: false } };
