import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Projects from './Projects.svelte';

const meta = {
	title: 'Screens/Projects',
	component: Projects,
	tags: ['autodocs'],
	parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof Projects>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The dashboard: filter, sort, and open a project – it then appears under "Projects" in the sidebar. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.selectOptions(c.getByLabelText('Sort by'), 'Name');
		await userEvent.selectOptions(c.getByLabelText('Status'), 'At risk');
		await expect(c.queryByRole('button', { name: 'Open Pricing launch' })).toBeNull();
		await userEvent.click(c.getByRole('button', { name: 'Open Mobile app v2' }));
		await expect(c.getByRole('button', { name: 'Mobile app v2' })).toBeInTheDocument();
	}
};

/** A project open on each tab; comments only appear once a task is opened. */
export const Tabs: Story = {
	args: { current: 'launch', recent: ['launch'] },
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.queryByText('Great summary – can we add the enterprise tiers too?')).toBeNull();
		await userEvent.click(c.getByRole('button', { name: 'Competitor pricing research' }));
		await expect(
			c.getByText('Great summary – can we add the enterprise tiers too?')
		).toBeInTheDocument();
		for (const t of ['Board', 'Roadmap', 'Insights'])
			await userEvent.click(c.getByRole('tab', { name: t }));
		await expect(c.getByRole('img', { name: /Burn-up/ })).toBeInTheDocument();
	}
};

export const Roadmap: Story = {
	args: { current: 'launch', recent: ['launch', 'mobile'], tab: 'Roadmap' }
};
export const Insights: Story = { args: { current: 'launch', recent: ['launch'], tab: 'Insights' } };
export const Dark: Story = { globals: { theme: 'dark' } };
