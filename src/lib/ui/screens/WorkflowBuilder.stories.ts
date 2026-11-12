import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import WorkflowBuilder from './WorkflowBuilder.svelte';

const meta = { title: 'Screens/Workflow Builder', component: WorkflowBuilder, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof WorkflowBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Wait' }));
		await expect(c.getByRole('button', { name: 'logic Wait' })).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Zoom in' }));
		await expect(canvasElement.textContent).toContain('104%');
		await userEvent.click(c.getByRole('button', { name: /Publish/ }));
		await expect(canvasElement.textContent).toContain('Published');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
