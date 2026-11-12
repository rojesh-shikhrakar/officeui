import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import TextArea from './TextArea.svelte';

const meta = { title: 'Components/Inputs/Text Area', component: TextArea, tags: ['autodocs'], args: { label: 'Notes for the agent', placeholder: 'Anything it should know…' } } satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const area = within(canvasElement).getByLabelText('Notes for the agent');
		await userEvent.type(area, 'Use the annual price first.');
		await expect(area).toHaveValue('Use the annual price first.');
	}
};
export const WithCounter: Story = { args: { maxlength: 280, counter: true, value: 'Keep replies short and friendly.', hint: 'Shown to every agent' } };
export const Error: Story = { args: { error: 'Tell the agent what to do.' } };
export const Expandable: Story = {
	args: { expandable: true, value: 'A long brief…' },
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'More room' }));
		await expect(c.getByRole('button', { name: 'Less room' })).toHaveAttribute('aria-pressed', 'true');
	}
};
export const SubmitShortcut: Story = {
	args: { onsubmitshortcut: fn(), hint: '⌘/Ctrl + Enter to send' },
	play: async ({ args, canvasElement }) => {
		const area = within(canvasElement).getByRole('textbox');
		await userEvent.type(area, 'Ship it{Control>}{Enter}{/Control}');
		await expect(args.onsubmitshortcut).toHaveBeenCalledWith('Ship it');
	}
};
export const Disabled: Story = { args: { disabled: true, value: 'Read only notes' } };
