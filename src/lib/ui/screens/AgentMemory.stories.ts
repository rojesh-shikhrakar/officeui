import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentMemory from './AgentMemory.svelte';

const meta = { title: 'Screens/Agent/Memory', component: AgentMemory, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentMemory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Remember something' }), 'Prefers morning meetings{Enter}');
		await expect(canvasElement.textContent).toContain('Prefers morning meetings');
		await userEvent.click(c.getByRole('tab', { name: /To review/ }));
		await expect(canvasElement.textContent).toContain('version field');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
