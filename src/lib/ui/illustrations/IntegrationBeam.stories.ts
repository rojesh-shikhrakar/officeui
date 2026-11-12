import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import IntegrationBeam from './IntegrationBeam.svelte';

const meta = { title: 'Illustrations/Integration Beam', component: IntegrationBeam, tags: ['autodocs'], args: { class: 'sb-wide' } } satisfies Meta<typeof IntegrationBeam>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const tool = c.getByRole('button', { name: 'Orbit, connected' });
		await userEvent.click(tool);
		await expect(c.getByRole('button', { name: 'Orbit, paused' })).toHaveAttribute('aria-pressed', 'false');
		await expect(c.getByText('5 connected')).toBeInTheDocument();
	}
};
export const TwoInOneOut: Story = { args: { left: [{ name: 'Wave', d: 'M2 9c3-4 7-4 10 0s7 4 10 0v6c-3 4-7 4-10 0s-7-4-10 0V9Z', color: '#0ea5e9' }, { name: 'Spark', d: 'M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8L12 1Z', color: '#f59e0b' }], right: [{ name: 'Grid', d: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z', color: '#16a34a' }] } };
export const Narrow: Story = { args: { class: 'sb-narrow' } };
export const Dark: Story = { globals: { theme: 'dark' } };
