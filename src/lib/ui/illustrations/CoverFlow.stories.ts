import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import CoverFlow from './CoverFlow.svelte';

const meta = { title: 'Illustrations/Cover Flow', component: CoverFlow, tags: ['autodocs'], args: { class: 'sb-wide', onselect: fn() } } satisfies Meta<typeof CoverFlow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('Static Bloom')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Next' }));
		await expect(await c.findByText('Northern Lines')).toBeInTheDocument();
		c.getByRole('region', { name: 'Cover flow' }).focus();
		await userEvent.keyboard('{Home}');
		await expect(await c.findByText('Night Drive')).toBeInTheDocument();
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const NoReflection: Story = { args: { reflection: false, ticks: false } };
export const SteepAngle: Story = { args: { angle: 70, itemWidth: 220, itemHeight: 220 } };
