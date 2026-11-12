import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import RegionDach from './RegionDach.svelte';

const meta = {
	title: 'Illustrations/Region Map',
	component: RegionDach,
	tags: ['autodocs'],
	args: { class: 'sb-illo-lg', onregionchange: fn() },
	argTypes: { region: { control: 'select', options: ['dach', 'us', 'cn', 'in', 'br', 'jp'] } }
} satisfies Meta<typeof RegionDach>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Region: DACH' }));
		await userEvent.click(c.getByRole('option', { name: 'Japan' }));
		await expect(args.onregionchange).toHaveBeenCalledWith('jp');
		await expect(c.getByRole('img', { name: 'Map of Japan' })).toBeInTheDocument();
	}
};
export const UnitedStates: Story = { args: { region: 'us' } };
export const Brazil: Story = { args: { region: 'br' } };
export const NoMenu: Story = { args: { region: 'in', showSwitcher: false } };
export const Dark: Story = { globals: { theme: 'dark' } };
