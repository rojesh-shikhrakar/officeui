import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ReviewCenter from './ReviewCenter.svelte';

const meta = { title: 'Components/Agents/Review Center', component: ReviewCenter, tags: ['autodocs'] } satisfies Meta<typeof ReviewCenter>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Approve/ }));
		await expect(canvasElement.textContent).toContain('25 of 32');
		await userEvent.click(c.getByRole('tab', { name: /High risk/ }));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
