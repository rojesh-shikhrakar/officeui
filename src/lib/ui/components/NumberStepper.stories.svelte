<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import NumberStepper from './NumberStepper.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Number Stepper',
		component: NumberStepper,
		tags: ['autodocs'], args: { label: 'Seats', value: 3, min: 1, max: 10, variant: 'attached', size: 'md' }, argTypes: { variant: { control: 'inline-radio', options: ['attached', 'split'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Increase' }));
		await expect(c.getByRole('spinbutton')).toHaveValue('4');
	}} />
<Story name="Split" args={{ variant: 'split' }} />
<Story name="Unit and hint" args={{ label: 'Weight', unit: 'kg', hint: 'Per box', step: 0.5 }} />
<Story name="Error" args={{ error: 'Pick at least 2.' }} />
<Story name="Disabled" args={{ disabled: true }} />
