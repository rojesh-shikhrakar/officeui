import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import LiveSession from './LiveSession.svelte';

const meta = { title: 'Blocks/Live Session', component: LiveSession, tags: ['autodocs'] } satisfies Meta<typeof LiveSession>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Message the agents' }), '@Writer make it shorter{Enter}');
		await expect(canvasElement.textContent).toContain('make it shorter');
		await userEvent.click(c.getByRole('tab', { name: 'Researcher' }));
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
