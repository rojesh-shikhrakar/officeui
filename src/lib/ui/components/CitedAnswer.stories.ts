import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import CitedAnswer from './CitedAnswer.svelte';

const meta = { title: 'Components/Chat/Cited Answer', component: CitedAnswer, tags: ['autodocs'] } satisfies Meta<typeof CitedAnswer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getAllByRole('button', { name: /Latency Notes/ })[0]);
		await expect(canvasElement.textContent).toContain('Quote from');
		await expect(c.getByRole('button', { name: /Copy quote/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
