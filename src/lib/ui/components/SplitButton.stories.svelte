<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import SplitButton from './SplitButton.svelte';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Split Button',
		component: SplitButton,
		tags: ['autodocs'], args: { variant: 'primary', label: 'Publish' }
	});
</script>

<Story
	name="Default"
	args={{ items: [{ label: 'Publish now' }, { label: 'Schedule…' }, { label: 'Save as draft' }] }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'More options' }));
		await expect(c.getByRole('menu')).toBeInTheDocument();
	}}>
	{#snippet children()}Publish{/snippet}
</Story>
<Story name="Secondary" args={{ variant: 'secondary', items: [{ label: 'Duplicate' }, { label: 'Archive' }] }}>
	{#snippet children()}Edit{/snippet}
</Story>
<Story name="Disabled" args={{ disabled: true, items: [{ label: 'One' }] }}>
	{#snippet children()}Publish{/snippet}
</Story>
