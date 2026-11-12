import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import VoiceOrb from './VoiceOrb.svelte';

const meta = { title: 'Illustrations/Voice Orb', component: VoiceOrb, tags: ['autodocs'] } satisfies Meta<typeof VoiceOrb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: 'Speaking' }));
		await expect(c.getByRole('img', { name: /Speaking/ })).toBeInTheDocument();
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const Idle: Story = { args: { state: 'idle', showControls: false } };
export const Thinking: Story = { args: { state: 'thinking', size: 120 } };
