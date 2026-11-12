import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ModelPicker from './ModelPicker.svelte';

const meta = { title: 'Components/Chat/Model Picker', component: ModelPicker, tags: ['autodocs'] } satisfies Meta<typeof ModelPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('option', { name: /Atlas Mini/ }));
		await expect(c.queryByRole('listbox')).toBeNull();
		await expect(c.getByRole('button', { name: /Atlas Mini/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Closed: Story = { args: { open: false, thinking: true, search: true } };
