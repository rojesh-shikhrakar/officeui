import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import MissionTimeline from './MissionTimeline.svelte';

const meta = { title: 'Blocks/Mission Timeline', component: MissionTimeline, tags: ['autodocs'] } satisfies Meta<typeof MissionTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('tab', { name: /Needs you/ }));
		await expect(canvasElement.textContent).toContain('Rotate API keys');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const ShortWindow: Story = { args: { span: 20 } };
