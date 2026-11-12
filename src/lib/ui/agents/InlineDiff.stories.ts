import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import InlineDiff from './InlineDiff.svelte';

const meta = { title: 'Components/Agents/Inline Diff', component: InlineDiff, tags: ['autodocs'] } satisfies Meta<typeof InlineDiff>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Accept all' }));
		await expect(canvasElement.textContent).toContain('All changes reviewed');
		await userEvent.click(c.getByRole('button', { name: /Undo/ }));
		await expect(canvasElement.textContent).toContain('4 suggestions');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const OneEdit: Story = { args: { instruction: 'Fix the typo', parts: ['Thanks for ', { del: 'you', add: 'your' }, ' patience.'] } };
