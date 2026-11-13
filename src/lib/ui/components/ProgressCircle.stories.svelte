<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ProgressCircle from './ProgressCircle.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/ProgressCircle',
		component: ProgressCircle,
		tags: ['autodocs'],
		args: { value: 65, size: 72, thickness: 6, tone: 'brand' }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65')} />
<Story name="Indeterminate" args={{ value: null }} />
<Story name="Sizes and tones" asChild>
	<div style="display: flex; gap: 16px; align-items: center">
		<ProgressCircle value={100} tone="success" size={48} thickness={4} />
		<ProgressCircle value={40} tone="warning" size={96} />
		<ProgressCircle value={20} tone="danger">{#snippet children()}2/10{/snippet}</ProgressCircle>
	</div>
</Story>
