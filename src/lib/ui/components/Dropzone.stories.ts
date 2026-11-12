import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Dropzone from './Dropzone.svelte';

const meta = { title: 'Components/Inputs/Dropzone', component: Dropzone, tags: ['autodocs'] } satisfies Meta<typeof Dropzone>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('Connection lost');
		await userEvent.click(c.getByRole('button', { name: 'Retry Budget-2027.xlsx' }));
		await expect(canvasElement.textContent).not.toContain('Connection lost');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Empty: Story = { args: { autoplay: false } };
