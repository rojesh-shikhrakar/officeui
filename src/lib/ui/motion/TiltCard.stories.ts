import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import TiltCard from './TiltCard.svelte';

const meta = { title: 'Motion/Tilt Card', component: TiltCard, tags: ['autodocs'] } satisfies Meta<typeof TiltCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		const card = canvasElement.querySelector('.ui-tlt__card') as HTMLElement;
		await userEvent.hover(card);
		await expect(card).toHaveAttribute('data-active');
		await userEvent.unhover(card);
		await expect(card).not.toHaveAttribute('data-active');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Member: Story = { args: { name: 'Sam Rivera', since: '03/27', last4: '0193', tier: 'Team' } };
export const NoGlare: Story = { args: { glare: false, max: 6 } };
