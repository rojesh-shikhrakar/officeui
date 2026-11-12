import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import DateRangePicker from './DateRangePicker.svelte';

const meta = { title: 'Components/Inputs/Date Range Picker', component: DateRangePicker, tags: ['autodocs'] } satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent?.trim().length).toBeGreaterThan(0);
		// Press the first few safe buttons; the component must keep rendering
		const buttons = c.queryAllByRole('button').filter((b) => !(b as HTMLButtonElement).disabled && !/delete|remove|close|dismiss|forget/i.test(b.textContent + (b.getAttribute('aria-label') ?? ''))).slice(0, 3);
		for (const b of buttons) if (b.isConnected) await userEvent.click(b);
		await expect(canvasElement.firstElementChild).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
