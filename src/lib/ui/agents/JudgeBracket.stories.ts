import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import JudgeBracket from './JudgeBracket.svelte';

const meta = { title: 'Components/Agents/Judge Bracket', component: JudgeBracket, tags: ['autodocs'], args: {"autoplay": false} } satisfies Meta<typeof JudgeBracket>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		for (let i = 0; i < 7; i++) await userEvent.click(c.getByRole('button', { name: 'Decide' }));
		await expect(canvasElement.textContent).toContain('Winner');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
