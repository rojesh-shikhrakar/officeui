<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Banner from './Banner.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Banner',
		component: Banner,
		tags: ['autodocs'],
		args: { tone: 'info', sticky: false }
	});
</script>

<Story name="Default" asChild><Banner title="New:">Agents can now run on a schedule.</Banner></Story>
<Story name="Tones" asChild>
	<div style="display: grid; gap: 8px">
		<Banner tone="success">Deployed.</Banner>
		<Banner tone="warning" title="Maintenance">Tonight at 22:00 UTC.</Banner>
		<Banner tone="danger">Service disruption.</Banner>
		<Banner tone="brand" ondismiss={() => {}}>Announcement</Banner>
	</div>
</Story>
<Story name="With action" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('status')).toBeInTheDocument()}>
	<Banner>{#snippet action()}<a href="#more">Learn more</a>{/snippet}Update available.</Banner>
</Story>
