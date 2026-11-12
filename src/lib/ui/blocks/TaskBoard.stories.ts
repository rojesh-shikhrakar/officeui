import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import TaskBoard from './TaskBoard.svelte';

const meta = { title: 'Blocks/Task Board', component: TaskBoard, tags: ['autodocs'] } satisfies Meta<typeof TaskBoard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const card = c.getByRole('button', { name: /Add the launch banner/ });
		card.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(c.getByRole('button', { name: /Add the launch banner.*In review/ })).toBeInTheDocument();
		await userEvent.click(c.getAllByRole('button', { name: '+ Add task' })[0]);
		await userEvent.type(c.getByRole('textbox', { name: 'New task in Todo' }), 'Write the FAQ{Enter}');
		await expect(canvasElement.textContent).toContain('Write the FAQ');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
