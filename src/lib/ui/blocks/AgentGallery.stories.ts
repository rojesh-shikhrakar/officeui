import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import AgentGallery from './AgentGallery.svelte';

const meta = { title: 'Blocks/Agent Gallery', component: AgentGallery, tags: ['autodocs'] } satisfies Meta<typeof AgentGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Next agent' }));
		await expect(c.getByRole('heading', { name: 'Onboarding coach' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const FirstAgent: Story = { args: { active: 0 } };
