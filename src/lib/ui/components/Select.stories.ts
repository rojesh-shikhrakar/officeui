import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import Select from './Select.svelte';

const meta = {
	title: 'Components/Inputs/Select',
	component: Select,
	tags: ['autodocs'],
	args: { label: 'Model', onchange: fn() },
	argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		const trigger = c.getByRole('combobox');
		await userEvent.click(trigger);
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(body.getByRole('option', { name: /GPT-6 Sol/ }));
		await expect(trigger).toHaveTextContent('GPT-6 Sol');
		await expect(args.onchange).toHaveBeenCalledWith('sol', expect.objectContaining({ value: 'sol' }));
	}
};
export const Keyboard: Story = {
	play: async ({ canvasElement }) => {
		const trigger = within(canvasElement).getByRole('combobox');
		trigger.focus();
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
		await expect(trigger).toHaveTextContent('Claude Fable 5.1');
	}
};
export const Chosen: Story = { args: { value: 'fable', hint: 'Used for new runs' } };
export const Error: Story = { args: { error: 'Pick a model to continue.', required: true } };
export const Small: Story = { args: { size: 'sm', label: undefined, 'aria-label': 'Model', value: 'auto' } };
export const Disabled: Story = { args: { disabled: true, value: 'auto' } };
