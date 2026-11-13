<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Link from './Link.svelte';

	const { Story } = defineMeta({
		title: 'Components/Navigation/Link',
		component: Link,
		tags: ['autodocs'],
		args: { variant: 'inline', external: false, current: false, disabled: false },
		argTypes: { variant: { control: 'inline-radio', options: ['inline', 'standalone', 'subtle'] } }
	});
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '#docs')}>
	<Link href="#docs">Read the docs</Link>
</Story>
<Story
	name="External"
	asChild
	play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')}>
	<Link href="https://example.com" external>Example</Link>
</Story>
<Story name="Variants" asChild>
	<div style="display: grid; gap: 10px; justify-items: start">
		<Link href="#a" variant="standalone">Standalone</Link>
		<Link href="#b" variant="subtle">Subtle</Link>
		<Link href="#c" current>Current page</Link>
		<Link href="#d" disabled>Disabled</Link>
	</div>
</Story>
