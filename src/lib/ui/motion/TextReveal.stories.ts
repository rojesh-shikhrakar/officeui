import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, waitFor, within } from 'storybook/test';
import TextReveal from './TextReveal.svelte';

const meta = {
	title: 'Motion/Text Reveal',
	component: TextReveal,
	tags: ['autodocs'],
	args: { as: 'h2', class: 'sb-display' },
	argTypes: { by: { control: 'inline-radio', options: ['word', 'char'] }, as: { control: 'select', options: ['p', 'h1', 'h2', 'h3', 'span'] } }
} satisfies Meta<typeof TextReveal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ByWord: Story = {
	play: async ({ canvasElement }) => {
		const h = within(canvasElement).getByRole('heading');
		await waitFor(() => expect(h).toHaveAttribute('data-shown'));
		await expect(h).toHaveTextContent('Agents first');
	}
};
export const ByLetter: Story = { args: { by: 'char', stagger: 18, text: 'Motion that feels finished' } };
export const Slow: Story = { args: { stagger: 120, duration: 1200, text: 'One word at a time' } };
export const Paragraph: Story = { args: { as: 'p', class: '', text: 'Every piece is one file with its styles inside. Install it, read it, change it – it is source you own.' } };
