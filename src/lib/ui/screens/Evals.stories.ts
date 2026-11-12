import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Evals from './Evals.svelte';

const meta = { title: 'Screens/Evals', component: Evals, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Evals>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Fail/ }));
		await expect(canvasElement.textContent).toContain('Cancel my account');
		await expect(canvasElement.textContent).not.toContain('Where is my order');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
