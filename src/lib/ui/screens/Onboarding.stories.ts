import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import Onboarding from './Onboarding.svelte';

const meta = { title: 'Screens/Onboarding/In-app', component: Onboarding, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Onboarding>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('switch', { name: 'Connect Notes' }));
		await userEvent.click(c.getByRole('button', { name: /Continue/ }));
		await expect(c.getByRole('heading', { name: 'Invite your team' })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const OtherUser: Story = { args: { user: 'Sam', workspace: 'Northwind' } };
