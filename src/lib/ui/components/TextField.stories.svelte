<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import TextField from './TextField.svelte';
	import Ico from '../demo/Ico.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Text Field',
		component: TextField,
		tags: ['autodocs'],
		args: { label: 'Workspace name', placeholder: 'Acme Inc.', size: 'md', onclear: fn() },
		argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story
	name="Default"
	play={async ({ canvasElement }) => {
		const input = within(canvasElement).getByLabelText('Workspace name');
		await userEvent.type(input, 'Northwind');
		await expect(input).toHaveValue('Northwind');
	}}
/>
<Story name="With hint" args={{ hint: 'You can change this later.' }} />
<Story name="Error" args={{ value: 'ac', error: 'Use at least 3 characters.' }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')} />
<Story name="Optional" args={{ label: 'Company', optional: true, placeholder: '' }} />
<Story name="Prefix and suffix" args={{ label: 'Subdomain', prefix: 'https://', suffix: '.acme.app', placeholder: 'team' }} />
<Story
	name="Clearable"
	args={{ label: 'Search', value: 'agent runs', clearable: true }}
	play={async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Clear' }));
		await expect(c.getByRole('textbox')).toHaveValue('');
		await expect(args.onclear).toHaveBeenCalledOnce();
	}}
/>
<Story
	name="Password"
	args={{ label: 'Password', type: 'password', value: 'hunter22' }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		const input = c.getByLabelText('Password');
		await expect(input).toHaveAttribute('type', 'password');
		await userEvent.click(c.getByRole('button', { name: 'Show password' }));
		await expect(input).toHaveAttribute('type', 'text');
	}}
/>
<Story name="Copyable" args={{ label: 'API key', value: 'sk_live_51H8…9fQ', readonly: true, copyable: true }} />
<Story
	name="Counter"
	args={{ label: 'Bio', maxlength: 40, counter: true, value: 'Design lead' }}
	play={async ({ canvasElement }) => expect(within(canvasElement).getByText('11/40')).toBeInTheDocument()}
/>
<Story name="Sizes" asChild>
	<div style="display: grid; gap: 12px; width: 280px">
		<TextField size="sm" placeholder="Small" aria-label="Small" />
		<TextField size="md" placeholder="Medium" aria-label="Medium" />
		<TextField size="lg" placeholder="Large" aria-label="Large" />
	</div>
</Story>
<Story name="Search icon" asChild>
	<div style="width: 280px">
		<TextField placeholder="Search…" clearable>{#snippet prefix()}<Ico name="search" size={16} />{/snippet}</TextField>
	</div>
</Story>
<Story name="Disabled" args={{ disabled: true, value: 'Locked' }} />
