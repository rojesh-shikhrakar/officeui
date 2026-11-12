import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import GlowCloud from './GlowCloud.svelte';

const meta = { title: 'Illustrations/Glow Cloud', component: GlowCloud, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof GlowCloud>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const Blue: Story = { args: { color: 'blue', class: 'sb-illo' } };
export const NoBackground: Story = { args: { background: false, class: 'sb-illo' } };
