<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import RadioGroup from './RadioGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Radio Group',
		component: RadioGroup,
		tags: ['autodocs'], args: { legend: 'Plan', value: 'pro', options: [{ value: 'free', label: 'Free', description: 'For trying things out' }, { value: 'pro', label: 'Pro', description: 'For teams' }, { value: 'ent', label: 'Enterprise', disabled: true }] }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByLabelText(/Pro/)).toBeChecked();
		await userEvent.click(c.getByLabelText(/Free/));
		await expect(c.getByLabelText(/Free/)).toBeChecked();
	}} />
<Story name="Horizontal" args={{ orientation: 'horizontal' }} />
<Story name="Disabled" args={{ disabled: true }} />
