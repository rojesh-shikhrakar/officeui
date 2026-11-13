<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusDot from './StatusDot.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/StatusDot',
		component: StatusDot,
		tags: ['autodocs'],
		args: { tone: 'success', size: 'md', pulse: false },
		argTypes: { tone: { control: 'select', options: ['neutral', 'success', 'danger', 'warning', 'info', 'accent'] }, size: { control: 'inline-radio', options: ['md', 'lg'] } }
	});
</script>

<Story name="Default" asChild><StatusDot tone="success">Online</StatusDot></Story>
<Story name="All tones" asChild>
	<div style="display: grid; gap: 8px">
		<StatusDot>Idle</StatusDot><StatusDot tone="success" pulse>Running</StatusDot><StatusDot tone="warning">Degraded</StatusDot>
		<StatusDot tone="danger" size="lg">Down</StatusDot><StatusDot tone="info">Queued</StatusDot><StatusDot tone="accent">Review</StatusDot>
	</div>
</Story>
