import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import LeadSourcing from './LeadSourcing.svelte';

const meta = { title: 'Illustrations/Lead Sourcing', component: LeadSourcing, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof LeadSourcing>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const OtherMarks: Story = { args: { left: { name: 'Hex', color: '#6366f1', d: 'M12 1.5 21 6.75v10.5L12 22.5 3 17.25V6.75L12 1.5Z' }, class: 'sb-illo' } };
