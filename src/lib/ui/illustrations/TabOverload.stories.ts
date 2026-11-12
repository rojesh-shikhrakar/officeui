import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import TabOverload from './TabOverload.svelte';

const meta = { title: 'Illustrations/Tab Overload', component: TabOverload, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof TabOverload>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const Large: Story = { args: { class: 'sb-illo-lg' } };
