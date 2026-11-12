import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import EmailDraft from './EmailDraft.svelte';

const meta = { title: 'Components/Cards/Email Draft', component: EmailDraft, tags: ['autodocs'], args: { onsend: fn(), ondiscard: fn() } } satisfies Meta<typeof EmailDraft>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Short' }));
		await expect(c.getByText(/Quote for changes/)).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: /Jonas Weber/ }));
		await userEvent.click(c.getByRole('option', { name: /Lena Hart/ }));
		await expect(c.getByText(/Hi Lena/)).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Send email' }));
		await expect(await c.findByText('Sent', {}, { timeout: 2000 })).toBeInTheDocument();
		await expect(args.onsend).toHaveBeenCalledOnce();
	}
};
export const Discard: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Discard' }));
		await expect(c.getByRole('status')).toHaveTextContent('Draft discarded');
		await expect(args.ondiscard).toHaveBeenCalledOnce();
		await userEvent.click(c.getByRole('button', { name: 'Undo' }));
		await expect(c.getByRole('button', { name: 'Send email' })).toBeInTheDocument();
	}
};
export const NoAttachment: Story = { args: { attachment: null, reference: 'INV-2291', status: 'Overdue 3 days', amount: '$1,240', agent: 'Collections agent' } };
export const NoContacts: Story = { args: { contacts: [] } };
