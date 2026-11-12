<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Checkbox from './Checkbox.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		args: { label: 'Remember me', checked: false, indeterminate: false, disabled: false, variant: 'plain' },
		argTypes: { variant: { control: 'inline-radio', options: ['plain', 'card'] } }
	});
</script>

<script lang="ts">
	let picks = $state([true, false, false]);
	const all = $derived(picks.every(Boolean));
	const some = $derived(!all && picks.some(Boolean));
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const box = within(canvasElement).getByRole('checkbox');
		await userEvent.click(within(canvasElement).getByText('Remember me'));
		await expect(box).toBeChecked();
	}}
/>
<Story name="With description" args={{ label: 'Share usage data', description: 'Helps us improve – no personal content', checked: true }} />
<Story name="Indeterminate" args={{ label: 'Select all', indeterminate: true }} />
<Story name="Error" args={{ label: 'I accept the terms', error: 'Please accept the terms to continue' }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')} />
<Story name="Card" args={{ variant: 'card', label: 'Pro plan', description: 'Every piece and all updates', checked: true }} />
<Story name="Disabled" args={{ disabled: true, checked: true, label: 'Locked option' }} />
<Story
	name="Select all"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		const master = c.getByLabelText('Select all');
		await expect(master).toHaveProperty('indeterminate', true);
		await userEvent.click(c.getByText('Select all'));
		for (const b of c.getAllByRole('checkbox')) await expect(b).toBeChecked();
	}}
>
	<div style="display: grid; gap: 10px">
		<Checkbox label="Select all" checked={all} indeterminate={some} onchange={(e) => (picks = picks.map(() => e.currentTarget.checked))} />
		{#each ['Agents', 'Tools', 'Traces'] as name, i (name)}
			<div style="padding-left: 26px"><Checkbox label={name} bind:checked={picks[i]} /></div>
		{/each}
	</div>
</Story>
