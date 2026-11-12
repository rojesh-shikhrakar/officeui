import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import LogoMarquee from './LogoMarquee.svelte';

const meta = {
	title: 'Blocks/Logo Marquee',
	component: LogoMarquee,
	tags: ['autodocs'],
	args: { class: 'sb-wide' },
	argTypes: { labels: { control: 'inline-radio', options: ['none', 'below', 'beside'] }, direction: { control: 'inline-radio', options: ['left', 'right'] }, rows: { control: 'inline-radio', options: [1, 2] } }
} satisfies Meta<typeof LogoMarquee>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const region = within(canvasElement).getByRole('region', { name: /Logos/ });
		await expect(within(region).getAllByText('Northwind').length).toBeGreaterThan(0);
	}
};
export const MarksOnly: Story = { args: { labels: 'none' } };
export const LabelsBelow: Story = { args: { labels: 'below', gap: 40 } };
export const TwoRows: Story = { args: { rows: 2, speed: 30 } };
export const InColour: Story = { args: { grayscale: false, direction: 'right' } };
