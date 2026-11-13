<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Avatar from './Avatar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		args: { name: 'Ada Lovelace', size: 'md', tone: 'neutral' },
		argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, tone: { control: 'inline-radio', options: ['neutral', 'brand', 'accent'] } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL')} />
<Story name="Sizes and tones" asChild>
	<div style="display: flex; gap: 10px; align-items: center">
		<Avatar name="Sam Lee" size="sm" /><Avatar name="Sam Lee" /><Avatar name="Sam Lee" size="lg" tone="brand" />
		<Avatar name="Sam Lee" tone="accent" /><Avatar name="Sam Lee" shape="square" />
	</div>
</Story>
