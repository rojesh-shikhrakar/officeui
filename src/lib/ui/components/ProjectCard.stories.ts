import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ProjectCard from './ProjectCard.svelte';

const meta = { title: 'Components/Cards/Project Card', component: ProjectCard, tags: ['autodocs'] } satisfies Meta<typeof ProjectCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** How it first appears. */
export const Default: Story = {};

/** Clicks, typing and keys, checked step by step. */
export const Interactions: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('checkbox', { name: 'First-run checklist' }));
		await expect(canvasElement.textContent).toContain('1 left');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Done: Story = { args: { title: 'Billing revamp', tasks: [{ title: 'Plans page', done: true }, { title: 'Invoices', done: true }] } };
