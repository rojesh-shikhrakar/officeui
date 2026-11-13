<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Progress from './Progress.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Progress',
		component: Progress,
		tags: ['autodocs'],
		args: { value: 60, label: 'Uploading', tone: 'brand', size: 'md' }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')} />
<Story name="Indeterminate" args={{ value: undefined, label: 'Working' }} />
<Story name="Tones" asChild>
	<div style="display: grid; gap: 12px; width: 300px">
		<Progress value={30} tone="success" size="sm" />
		<Progress value={60} tone="warning" />
		<Progress value={90} tone="danger" size="lg" label="Disk" />
	</div>
</Story>
