import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import ClientContext from './ClientContext.svelte';

const meta = { title: 'Blocks/Client Context', component: ClientContext, tags: ['autodocs'] } satisfies Meta<typeof ClientContext>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Add context' }), 'Board meets on the 12th');
		await userEvent.click(c.getByRole('button', { name: 'Add context' }));
		await expect(canvasElement.textContent).toContain('Board meets on the 12th');
		await userEvent.click(c.getByRole('button', { name: /Switch client/ }));
		await expect(canvasElement.textContent).toContain('Harbor Health');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
