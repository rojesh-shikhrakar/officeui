import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AwaySummary from './AwaySummary.svelte';

const meta = { title: 'Components/Agents/Away Summary', component: AwaySummary, tags: ['autodocs'] } satisfies Meta<typeof AwaySummary>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Decide: Ingest pipeline' }));
		await userEvent.click(c.getByRole('button', { name: 'Kafka' }));
		await expect(canvasElement.textContent).toContain('Answered: Kafka');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
