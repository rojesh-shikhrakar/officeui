import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import PromptLibrary from './PromptLibrary.svelte';

const meta = { title: 'Components/Inputs/Prompt Library', component: PromptLibrary, tags: ['autodocs'] } satisfies Meta<typeof PromptLibrary>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'product' }), 'Relay');
		await userEvent.type(c.getByRole('textbox', { name: 'version' }), 'v2.4');
		await userEvent.type(c.getByRole('textbox', { name: 'audience' }), 'admins');
		await expect(c.getByRole('button', { name: /Use prompt/ })).toBeEnabled();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
