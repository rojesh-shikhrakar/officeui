import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import WorldMap from './WorldMap.svelte';

const meta = { title: 'Illustrations/World Map', component: WorldMap, tags: ['autodocs'] } satisfies Meta<typeof WorldMap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.selectOptions(c.getByRole('combobox', { name: 'Continent' }), 'Africa');
		await expect(c.getByRole('img', { name: /Africa/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Asia: Story = { args: { continent: 'Asia', showSwitcher: false } };
