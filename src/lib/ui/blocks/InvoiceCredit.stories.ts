import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import InvoiceCredit from './InvoiceCredit.svelte';

const meta = { title: 'Blocks/Invoice & Credit Note', component: InvoiceCredit, tags: ['autodocs'] } satisfies Meta<typeof InvoiceCredit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(canvasElement.textContent).toContain('$11,359.68');
		await userEvent.click(c.getByRole('button', { name: /Credit invoice/ }));
		await expect(canvasElement.textContent).toContain('−$11,359.68');
	}
};

export const Dark: Story = { globals: { theme: 'dark' } };

/** Themed through the design-system tokens: accent and radius come from the toolbar. */
export const DesignSystem: Story = { globals: { ds: 'on', accent: '#7c3aed', radius: '14px' } };

export const CreditNote: Story = { args: { view: 'credit' } };
