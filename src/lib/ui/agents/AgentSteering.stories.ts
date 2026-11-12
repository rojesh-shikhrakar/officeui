import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import AgentSteering from './AgentSteering.svelte';

const meta = { title: 'Components/Agents/Agent Steering', component: AgentSteering, tags: ['autodocs'], args: { onsteer: fn() } } satisfies Meta<typeof AgentSteering>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Note for the agent' }), 'Show the annual price first{Enter}');
		await expect(args.onsteer).toHaveBeenCalledWith('Show the annual price first', 'queue');
		await expect(c.getByText(/Queued: “Show the annual price first”/)).toBeInTheDocument();
	}
};
export const Interrupt: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox'), 'Stop – use Stripe instead');
		await userEvent.click(c.getByRole('button', { name: 'Interrupt' }));
		await expect(c.getByText('Paused')).toBeInTheDocument();
	}
};
export const WithQueue: Story = { args: { queued: ['Keep the hero copy as is'] } };
export const Dark: Story = { globals: { theme: 'dark' } };
