<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Divider from './Divider.svelte';

	const { Story } = defineMeta({
		title: 'Components/Layout/Divider',
		component: Divider,
		tags: ['autodocs'],
		args: { orientation: 'horizontal' },
		argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } }
	});
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('separator')).toBeInTheDocument()}>
	<div style="width: 320px"><Divider /></div>
</Story>
<Story name="Labelled" asChild>
	<div style="width: 320px"><Divider label="or" /></div>
</Story>
<Story name="Vertical" asChild>
	<div style="display: flex; gap: 12px; height: 24px; align-items: center">Edit<Divider orientation="vertical" />Share<Divider orientation="vertical" />Delete</div>
</Story>
