import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import GhostedChat from './GhostedChat.svelte';

const meta = { title: 'Illustrations/Ghosted Chat', component: GhostedChat, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof GhostedChat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const CustomMessages: Story = { args: { messages: ['Hey!', 'Did you see the proposal?', 'Anyone?'], class: 'sb-illo' } };
