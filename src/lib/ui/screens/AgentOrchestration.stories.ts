import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentOrchestration from './AgentOrchestration.svelte';

const meta = { title: 'Screens/Agent/Orchestration', component: AgentOrchestration, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AgentOrchestration>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: /Pause run/ }));
		await expect(c.getByRole('button', { name: /Resume/ })).toBeInTheDocument();
		await userEvent.click(c.getByRole('tab', { name: /Events/ }));
		await expect(canvasElement.textContent).toContain('Claim check failed');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };
