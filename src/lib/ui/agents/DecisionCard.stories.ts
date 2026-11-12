import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import DecisionCard from './DecisionCard.svelte';

const meta = { title: 'Components/Agents/Decision Card', component: DecisionCard, tags: ['autodocs'] } satisfies Meta<typeof DecisionCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.keyboard('1');
		await expect(canvasElement.textContent).toContain('Kafka – on it.');
		await userEvent.click(c.getByRole('option', { name: /Setup checklist/ }));
		await expect(canvasElement.textContent).toContain('Setup checklist – on it.');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
