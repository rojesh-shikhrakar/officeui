import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import FilterMenu from './FilterMenu.svelte';

const meta = { title: 'Components/Inputs/Filter Menu', component: FilterMenu, tags: ['autodocs'], args: { onchange: fn() } } satisfies Meta<typeof FilterMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('checkbox', { name: 'Failed' }));
		await expect(args.onchange).toHaveBeenLastCalledWith({ status: ['running', 'waiting', 'failed'] });
		await userEvent.click(c.getByRole('button', { name: 'Remove Running' }));
		await expect(c.getByRole('checkbox', { name: 'Running' })).toHaveAttribute('aria-checked', 'false');
		await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
		await expect(c.getByRole('button', { name: 'Clear all' })).toBeDisabled();
	}
};
export const Keyboard: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		c.getByRole('button', { name: /^Status/ }).focus();
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect(c.getByRole('checkbox', { name: 'Running' })).toHaveAttribute('aria-checked', 'false');
	}
};
export const AllOpen: Story = { args: { defaultOpen: ['status', 'agent', 'score'], value: { score: ['90'] } } };
export const Empty: Story = { args: { value: {}, hints: false } };
