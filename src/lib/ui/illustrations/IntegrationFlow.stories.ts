import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import IntegrationFlow from './IntegrationFlow.svelte';

const meta = { title: 'Illustrations/Integration Flow', component: IntegrationFlow, tags: ['autodocs'], args: {"autoplay": false} } satisfies Meta<typeof IntegrationFlow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Chat/ }));
		await expect(c.getByRole('button', { name: /Chat/ })).toHaveAttribute('data-on');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Moving: Story = { args: { autoplay: true } };
