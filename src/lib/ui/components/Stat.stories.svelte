<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Stat from './Stat.svelte';

	const { Story } = defineMeta({
		title: 'Components/Data/Stat',
		component: Stat,
		tags: ['autodocs'],
		args: { label: 'Revenue', value: '8.2k', delta: '+12%', deltaTone: 'success', caption: 'vs last month' }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByText('8.2k')).toBeInTheDocument()} />
<Story name="Large with unit" args={{ size: 'lg', value: 99.9, unit: '%', label: 'Uptime', delta: undefined, caption: 'last 30 days' }} />
