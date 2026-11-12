import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import EnrichmentOrbit from './EnrichmentOrbit.svelte';

const meta = { title: 'Illustrations/Enrichment Orbit', component: EnrichmentOrbit, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof EnrichmentOrbit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const CustomMark: Story = { args: { mark: 'M12 2 22 20H2Z', class: 'sb-illo' } };
