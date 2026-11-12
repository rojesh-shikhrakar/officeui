import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Analytics from './Analytics.svelte';

const meta = { title: 'Screens/Analytics', component: Analytics, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Analytics>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Save as report' }));
		await expect(canvasElement.textContent).toContain('Saved');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
