import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import AiChatStart from './AiChatStart.svelte';

const meta = { title: 'Screens/AI Chat/Start', component: AiChatStart, tags: ['autodocs'], args: { onsend: fn() }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AiChatStart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.type(c.getByRole('textbox', { name: 'Message' }), 'Draft the launch email{Enter}');
		await expect(args.onsend).toHaveBeenCalledWith('Draft the launch email');
		await userEvent.click(c.getByRole('button', { name: 'Collapse sidebar' }));
		await expect(c.getByRole('button', { name: 'Open sidebar' })).toBeInTheDocument();
	}
};
export const OtherWorkspace: Story = { args: { workspace: 'Northwind', user: 'Sam Lee', greeting: 'Good morning, Sam. Where should we start?' } };
export const Dark: Story = { globals: { theme: 'dark' } };
