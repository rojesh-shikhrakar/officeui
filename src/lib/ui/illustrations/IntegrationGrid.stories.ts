import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import IntegrationGrid from './IntegrationGrid.svelte';

const meta = { title: 'Illustrations/Integration Grid', component: IntegrationGrid, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof IntegrationGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const SevenColumns: Story = { args: { columns: 7, class: 'sb-illo' } };
export const FiveColumns: Story = { args: { columns: 5, class: 'sb-illo' } };
