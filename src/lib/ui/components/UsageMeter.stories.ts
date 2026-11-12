import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import UsageMeter from './UsageMeter.svelte';

const meta = { title: 'Components/Data display/Usage Meter', component: UsageMeter, tags: ['autodocs'] } satisfies Meta<typeof UsageMeter>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: 'Last month' }));
		await expect(canvasElement.textContent).toContain('Limit reached');
		await expect(c.getByRole('button', { name: 'Add credits' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
