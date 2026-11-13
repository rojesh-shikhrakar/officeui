<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MapPin from './MapPin.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/MapPin',
		component: MapPin,
		tags: ['autodocs'],
		args: { variant: 'pin', tone: 'neutral', name: 'Berlin office', selected: false },
		argTypes: { variant: { control: 'inline-radio', options: ['pin', 'dot', 'label', 'cluster'] }, tone: { control: 'select', options: ['neutral', 'accent', 'danger', 'success', 'info'] } }
	});
</script>

<Story name="Pin" />
<Story name="Label" args={{ variant: 'label', label: 'Berlin office', selected: true }} />
<Story name="Cluster" args={{ variant: 'cluster', count: 12 }} />
<Story name="Dot" args={{ variant: 'dot', tone: 'success', name: 'Warehouse' }} />
<Story name="On a map" asChild>
	<div style="position: relative; width: 320px; height: 200px; border-radius: 12px; background: var(--aui-subtle, rgba(0,0,0,.05)); border: 1px solid var(--aui-border, rgba(0,0,0,.12))">
		<MapPin x={30} y={55} icon="pin" name="HQ" />
		<MapPin x={65} y={40} variant="label" label="Berlin" selected onclick={() => {}} />
		<MapPin x={80} y={75} variant="cluster" count={7} />
	</div>
</Story>
