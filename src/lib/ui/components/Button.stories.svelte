<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import Button from './Button.svelte';
	import Ico from '../demo/Ico.svelte';
	import Section from '../demo/Section.svelte';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Button',
		component: Button,
		tags: ['autodocs'],
		args: { label: 'Continue', variant: 'primary', size: 'md', loading: false, disabled: false, onclick: fn() },
		argTypes: {
			variant: { control: 'inline-radio', options: ['primary', 'accent', 'secondary', 'ghost', 'destructive', 'link'] },
			size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
		}
	});
</script>

<Story name="Showcase" asChild>
	<div>
		<Section label="Styles" zoom={1.15}>
			<Button label="Save changes" />
			<Button variant="secondary" label="Secondary" />
			<Button variant="ghost" label="Ghost" />
			<Button variant="accent" label="Accent" />
			<Button variant="link" label="Link" />
			<Button variant="destructive" label="Delete">{#snippet icon()}<Ico name="trash" />{/snippet}</Button>
		</Section>
		<Section label="Full width">
			<div style="width: 280px"><Button variant="secondary" fullWidth label="Full width" /></div>
		</Section>
		<Section label="Icons and sizes" zoom={1.15}>
			<Button variant="secondary" size="sm" label="Add item">{#snippet icon()}<Ico name="plus" size={16} />{/snippet}</Button>
			<Button label="Continue">{#snippet iconRight()}<Ico name="arrow" />{/snippet}</Button>
			<Button variant="ghost" size="sm" aria-label="More">{#snippet icon()}<Ico name="dots" size={16} />{/snippet}</Button>
			<Button variant="secondary" size="lg" label="Large" />
		</Section>
		<Section label="Feedback and states" zoom={1.15}>
			<Button variant="secondary" label="Copy link">{#snippet icon()}<Ico name="copy" />{/snippet}</Button>
			<Button variant="secondary" aria-label="Copy">{#snippet icon()}<Ico name="copy" />{/snippet}</Button>
			<Button variant="secondary" label="Upload file">{#snippet icon()}<Ico name="upload" />{/snippet}</Button>
			<Button variant="secondary" label="Disabled" disabled />
		</Section>
	</div>
</Story>

<Story
	name="Primary"
	play={async ({ args, canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Continue' }));
		await expect(args.onclick).toHaveBeenCalledOnce();
	}}
/>
<Story name="Secondary" args={{ variant: 'secondary', label: 'Secondary' }} />
<Story name="Ghost" args={{ variant: 'ghost', label: 'Ghost' }} />
<Story name="Destructive" args={{ variant: 'destructive', label: 'Delete' }} />
<Story name="Small" args={{ size: 'sm', label: 'Small' }} />
<Story name="Large" args={{ size: 'lg', label: 'Large' }} />
<Story
	name="Loading"
	args={{ loading: true, label: 'Saving' }}
	play={async ({ args, canvasElement }) => {
		const b = within(canvasElement).getByRole('button', { name: 'Saving' });
		await expect(b).toHaveAttribute('aria-busy', 'true');
		await userEvent.click(b);
		await expect(args.onclick).not.toHaveBeenCalled();
	}}
/>
<Story
	name="Disabled"
	args={{ disabled: true, label: 'Disabled' }}
	play={async ({ canvasElement }) => {
		await expect(within(canvasElement).getByRole('button')).toBeDisabled();
	}}
/>
<Story name="Icon only" asChild>
	<Button variant="secondary" aria-label="Settings">{#snippet icon()}<Ico name="settings" />{/snippet}</Button>
</Story>
