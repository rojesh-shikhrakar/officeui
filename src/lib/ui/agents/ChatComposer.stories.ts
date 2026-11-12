import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import ChatComposer from './ChatComposer.svelte';

const meta = { title: 'Components/Chat/Chat Composer', component: ChatComposer, tags: ['autodocs'], args: { onsend: fn() }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ChatComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Message' }), 'Ship the pricing page{Enter}');
		await expect(args.onsend).toHaveBeenCalledWith('Ship the pricing page');
	}
};
export const ModelMenu: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Auto/ }));
		await userEvent.click(c.getByRole('menuitemradio', { name: /GPT-6 Sol/ }));
		await expect(c.getByRole('button', { name: /GPT-6 Sol/ })).toBeInTheDocument();
	}
};
export const ApprovalMenu: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Request approval/ }));
		await expect(c.getByRole('menu', { name: 'How should actions be approved?' })).toBeInTheDocument();
	}
};
export const AddMenu: Story = { play: async ({ canvasElement }) => userEvent.click(within(canvasElement).getByRole('button', { name: 'Add' })) };
export const NoFooter: Story = { args: { footer: false, placeholder: 'Ask anything…' } };
export const Dark: Story = { globals: { theme: 'dark' } };
