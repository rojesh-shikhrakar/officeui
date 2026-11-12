import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import RootCauseTree from './RootCauseTree.svelte';

const meta = { title: 'Components/Agents/Root Cause Tree', component: RootCauseTree, tags: ['autodocs'], args: {"autoplay": false} } satisfies Meta<typeof RootCauseTree>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Stale fixtures/ }));
		await expect(canvasElement.textContent).toContain('Found');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
