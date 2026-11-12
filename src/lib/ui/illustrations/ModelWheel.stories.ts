import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import ModelWheel from './ModelWheel.svelte';

const meta = { title: 'Illustrations/Model Wheel', component: ModelWheel, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof ModelWheel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const Fast: Story = { args: { hold: 700, class: 'sb-illo' } };
