<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Stepper from './Stepper.svelte';

	const { Story } = defineMeta({
		title: 'Components/Navigation/Stepper',
		component: Stepper,
		tags: ['autodocs'],
		args: { steps: [{ label: 'Account', description: 'Your details' }, { label: 'Plan' }, { label: 'Review' }], current: 1 }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => {
	const items = within(canvasElement).getAllByRole('listitem');
	await expect(items[1]).toHaveAttribute('aria-current', 'step');
}} />
<Story name="Vertical" args={{ orientation: 'vertical' }} />
<Story name="Error" args={{ current: 2, errorIndex: 1 }} />
