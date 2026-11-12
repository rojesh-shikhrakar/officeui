import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import SegmentedControl from './SegmentedControl.svelte';

const meta = {
	title: 'Components/Navigation/Segmented Control',
	component: SegmentedControl,
	tags: ['autodocs'],
	args: { onchange: fn(), variant: 'buttons', size: 'md' },
	argTypes: { variant: { control: 'inline-radio', options: ['buttons', 'tray', 'underline'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: 'Month' }));
		await expect(c.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true');
		await expect(args.onchange).toHaveBeenCalledWith('month');
		await userEvent.keyboard('{ArrowRight}');
		await expect(c.getByRole('radio', { name: 'Year' })).toHaveAttribute('aria-checked', 'true');
	}
};
export const Tray: Story = { args: { variant: 'tray', value: 'week' } };
export const Underline: Story = {
	args: {
		variant: 'underline',
		kind: 'tabs',
		'aria-label': 'Inbox',
		options: [
			{ value: 'all', label: 'All', count: 128 },
			{ value: 'mentions', label: 'Mentions', count: 4 },
			{ value: 'archived', label: 'Archived' }
		]
	},
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Mentions/ }));
		await expect(c.getByRole('tab', { name: /Mentions/ })).toHaveAttribute('aria-selected', 'true');
	}
};
export const WithBadge: Story = {
	args: { variant: 'tray', 'aria-label': 'Billing period', options: [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly', badge: 'Save 20%' }] }
};
export const FullWidth: Story = { args: { variant: 'tray', fullWidth: true, options: [{ value: 'a', label: 'Light' }, { value: 'b', label: 'Dark' }, { value: 'c', label: 'System' }] } };
export const Small: Story = { args: { size: 'sm', variant: 'tray' } };
export const DisabledOption: Story = { args: { options: [{ value: 'a', label: 'On' }, { value: 'b', label: 'Off' }, { value: 'c', label: 'Beta', disabled: true }] } };
