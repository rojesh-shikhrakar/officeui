import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ToolAccessMap from './ToolAccessMap.svelte';

const meta = { title: 'Components/Agents/Tool Access Map', component: ToolAccessMap, tags: ['autodocs'] } satisfies Meta<typeof ToolAccessMap>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Writer/ }));
		await expect(canvasElement.textContent).toContain('Write the launch email');
		await userEvent.click(c.getByRole('button', { name: /CRM/ }));
		await expect(canvasElement.textContent).toContain('Not used yet');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
