<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Switch from './Switch.svelte';
	import Section from '../demo/Section.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Switch',
		component: Switch,
		tags: ['autodocs'],
		args: { label: 'Email notifications', description: 'Get a message when an agent needs you', checked: false, disabled: false, placement: 'start', size: 'md' },
		argTypes: { placement: { control: 'inline-radio', options: ['start', 'end'] }, size: { control: 'inline-radio', options: ['sm', 'md'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const sw = within(canvasElement).getByRole('switch');
		await expect(sw).not.toBeChecked();
		await userEvent.click(within(canvasElement).getByText('Email notifications'));
		await expect(sw).toBeChecked();
		await userEvent.keyboard(' ');
		await expect(sw).not.toBeChecked();
	}}
/>
<Story name="On" args={{ checked: true }} />
<Story name="Small" args={{ size: 'sm', checked: true }} />
<Story name="Disabled" args={{ disabled: true, checked: true }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('switch')).toBeDisabled()} />
<Story name="Settings rows" asChild>
	<div style="width: 340px; display: grid; gap: 14px">
		<Switch placement="end" label="Auto-approve edits" description="Agents change files without asking" checked />
		<Switch placement="end" label="Weekly digest" description="A summary every Monday" />
		<Switch placement="end" label="Sounds" />
	</div>
</Story>
<Story name="No label" args={{ label: undefined, description: undefined, 'aria-label': 'Dark mode' }} />
