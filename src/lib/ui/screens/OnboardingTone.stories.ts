import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import OnboardingTone from './OnboardingTone.svelte';

const meta = { title: 'Screens/Onboarding/Tone', component: OnboardingTone, tags: ['autodocs'], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof OnboardingTone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: 'Friendly' }));
		const email = c.getByRole('textbox', { name: 'Hand-over email' });
		await userEvent.clear(email);
		await expect(c.getByRole('button', { name: /Continue/ })).toBeDisabled();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const NoHandover: Story = { args: { handover: false, tone: 'Formal' } };
