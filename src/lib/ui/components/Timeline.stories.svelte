<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Timeline from './Timeline.svelte';

	const { Story } = defineMeta({
		title: 'Components/Data/Timeline',
		component: Timeline,
		tags: ['autodocs'],
		args: { items: [{ title: 'Order placed', time: '09:12', description: 'Payment confirmed', tone: 'success' }, { title: 'Packed', time: '11:40', tone: 'info' }, { title: 'Out for delivery', time: 'Now', current: true, tone: 'accent' }] }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(3)} />
<Story name="Compact" args={{ compact: true }} />
