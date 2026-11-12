import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ApprovalGates from './ApprovalGates.svelte';

const meta = { title: 'Components/Agents/Approval Gates', component: ApprovalGates, tags: ['autodocs'] } satisfies Meta<typeof ApprovalGates>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Approve' }));
		await expect(canvasElement.textContent).toContain('Email 1,284 trial users');
		await userEvent.click(c.getByRole('button', { name: 'Reject' }));
		await expect(canvasElement.textContent).toContain('The run stopped');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
