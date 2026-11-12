import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import MissionControl from './MissionControl.svelte';

const meta = { title: 'Blocks/Mission Control', component: MissionControl, tags: ['autodocs'] } satisfies Meta<typeof MissionControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Failed/ }));
		await userEvent.click(c.getByRole('button', { name: /Merge the checkout fix/ }));
		await userEvent.click(c.getByRole('button', { name: 'Yes, go ahead' }));
		await expect(c.queryByRole('button', { name: /Merge the checkout fix/ })).toBeNull();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
