import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import TagInput from './TagInput.svelte';

const email = (t: string) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t) ? true : `“${t}” isn't an email address.`);
const meta = { title: 'Components/Inputs/Tag Input', component: TagInput, tags: ['autodocs'], args: { label: 'Topics', onchange: fn() } } satisfies Meta<typeof TagInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		const input = c.getByLabelText('Topics');
		await userEvent.type(input, 'motion{Enter}');
		await expect(c.getByText('motion')).toBeInTheDocument();
		await expect(args.onchange).toHaveBeenLastCalledWith(['design', 'research', 'motion']);
		await userEvent.click(c.getByRole('button', { name: 'Remove design' }));
		await expect(c.queryByText('design')).toBeNull();
	}
};
export const Emails: Story = {
	args: { label: 'Invite people', value: [], placeholder: 'name@company.com', splitOnSpace: true, avatar: true, validate: email, normalize: (t) => t.trim().toLowerCase() },
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByLabelText('Invite people'), 'ana@acme.com nope ');
		await expect(c.getByText('ana@acme.com')).toBeInTheDocument();
		await expect(c.getByText("“nope” isn't an email address.")).toBeInTheDocument();
	}
};
export const WithMax: Story = { args: { max: 3, hint: 'Pick up to three' } };
export const Error: Story = { args: { error: 'Add at least one topic', value: [] } };
export const Disabled: Story = { args: { disabled: true } };
