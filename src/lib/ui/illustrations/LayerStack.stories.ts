import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import LayerStack from './LayerStack.svelte';

const meta = { title: 'Illustrations/Layer Stack', component: LayerStack, tags: ['autodocs'], args: { class: 'sb-wide', onchange: fn() } } satisfies Meta<typeof LayerStack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Connected to your apps/ }));
		await expect(c.getByRole('tab', { name: /Connected to your apps/ })).toHaveAttribute('aria-selected', 'true');
		await expect(args.onchange).toHaveBeenCalledWith(2);
		await userEvent.keyboard('{ArrowDown}');
		await expect(c.getByRole('tab', { name: /Works with any model/ })).toHaveFocus();
	}
};
export const BottomLayer: Story = { args: { defaultIndex: 4 } };
export const ThreeLayers: Story = { args: { items: [{ title: 'Plan', hint: 'Step 1', icon: 'spark' }, { title: 'Build', hint: 'Step 2', icon: 'plug' }, { title: 'Ship', hint: 'Step 3', icon: 'bolt' }] } };
export const Dark: Story = { globals: { theme: 'dark' } };
