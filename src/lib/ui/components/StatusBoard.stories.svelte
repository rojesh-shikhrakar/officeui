<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import StatusBoard from './StatusBoard.svelte';

	const { Story } = defineMeta({
		title: 'Components/Data/StatusBoard',
		component: StatusBoard,
		tags: ['autodocs'],
		args: { title: 'Service status', updated: '2 min ago', services: [{ name: 'API', status: 'operational', uptime: '99.99%', history: ['operational', 'operational', 'degraded', 'operational'] }, { name: 'Search', description: 'Indexing', status: 'degraded', uptime: '99.2%' }] }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByText('Some systems are degraded')).toBeInTheDocument()} />
<Story name="All operational" args={{ services: [{ name: 'API', status: 'operational' }, { name: 'Web', status: 'operational' }] }} />
<Story name="Outage" args={{ services: [{ name: 'API', status: 'outage' }, { name: 'Web', status: 'maintenance' }] }} />
