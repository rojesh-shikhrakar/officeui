<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Spinner from './Spinner.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Spinner',
		component: Spinner,
		tags: ['autodocs'],
		args: { variant: 'ring', size: 'md', label: 'Loading data', showLabel: true },
		argTypes: { variant: { control: 'inline-radio', options: ['ring', 'dots', 'bars'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading data')} />
<Story name="Variants" asChild>
	<div style="display: flex; gap: 24px; align-items: center">
		<Spinner variant="ring" size="sm" /><Spinner variant="dots" /><Spinner variant="bars" size="lg" />
	</div>
</Story>
