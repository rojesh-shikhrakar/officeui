import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import TestimonialWall from './TestimonialWall.svelte';

const meta = { title: 'Blocks/Testimonial Wall', component: TestimonialWall, tags: ['autodocs'], args: { class: 'sb-wall' } } satisfies Meta<typeof TestimonialWall>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const region = within(canvasElement).getByRole('region', { name: 'What customers say' });
		await expect(within(region).getAllByText('Ana Ruiz').length).toBeGreaterThan(0);
	}
};
export const TwoColumns: Story = { args: { columns: 2 } };
export const Slow: Story = { args: { speed: 12 } };
export const Empty: Story = { args: { items: [] } };
