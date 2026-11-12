import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AiAnswer from './AiAnswer.svelte';

const meta = { title: 'Components/Chat/AI Answer', component: AiAnswer, tags: ['autodocs'] } satisfies Meta<typeof AiAnswer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Bad answer' }));
		await userEvent.click(c.getByRole('button', { name: 'Too long' }));
		await expect(canvasElement.textContent).toContain('Too long');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
