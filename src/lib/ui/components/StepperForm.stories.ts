import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import StepperForm from './StepperForm.svelte';

const meta = { title: 'Components/Inputs/Stepper Form', component: StepperForm, tags: ['autodocs'] } satisfies Meta<typeof StepperForm>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		for (const h of ['Invite your team', 'Pick a plan', 'Review']) {
			await userEvent.click(c.getByRole('button', { name: 'Continue' }));
			await expect(canvasElement.textContent).toContain(h);
		}
		await userEvent.click(c.getByRole('button', { name: 'Create workspace' }));
		await expect(canvasElement.textContent).toContain('is ready');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
