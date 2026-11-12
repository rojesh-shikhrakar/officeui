import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, within } from 'storybook/test';
import AgentTeam from './AgentTeam.svelte';

const meta = { title: 'Illustrations/Agent Team', component: AgentTeam, tags: ['autodocs'], args: { class: 'sb-illo' } } satisfies Meta<typeof AgentTeam>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getAllByRole('img').length).toBeGreaterThan(0);
	}
};
export const Dark: Story = { globals: { theme: 'dark' } };
export const CustomPrompt: Story = { args: { prompt: 'Plan a product launch for next week', class: 'sb-illo' } };
