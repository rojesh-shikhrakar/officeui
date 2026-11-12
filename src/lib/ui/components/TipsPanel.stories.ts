import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import TipsPanel from './TipsPanel.svelte';

const meta = { title: 'Components/Cards/Tips Panel', component: TipsPanel, tags: ['autodocs'] } satisfies Meta<typeof TipsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByText('0/4 done')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Turn on' }));
		await expect(c.getByText('1/4 done')).toBeInTheDocument();
		await expect(c.getByRole('status')).toHaveTextContent('On');
	}
};
export const WithClose: Story = {
	args: { onclose: fn(), title: 'Getting started' },
	play: async ({ args, canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Close' }));
		await expect(args.onclose).toHaveBeenCalledOnce();
	}
};
export const TwoTips: Story = {
	args: {
		tips: [
			{ id: 'a', title: 'Connect GitHub', description: 'Let agents open pull requests.', action: 'Connect', primary: true },
			{ id: 'b', title: 'Add a teammate', description: 'Approvals go faster with two.', action: 'Invite' }
		]
	}
};
