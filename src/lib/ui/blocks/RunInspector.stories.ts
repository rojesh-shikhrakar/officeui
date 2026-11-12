import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import RunInspector from './RunInspector.svelte';

const meta = { title: 'Blocks/Run Inspector', component: RunInspector, tags: ['autodocs'] } satisfies Meta<typeof RunInspector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Researcher/ }));
		await expect(canvasElement.textContent).toContain('4 tool calls');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
