<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Icon from './Icon.svelte';
	import { ICONS } from '../utils/icons';

	const { Story } = defineMeta({
		title: 'Components/Display/Icon',
		component: Icon,
		tags: ['autodocs'],
		args: { name: 'bell', size: 20 },
		argTypes: { name: { control: 'select', options: Object.keys(ICONS) } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')} />
<Story name="Labelled" args={{ label: 'Notifications' }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('img', { name: 'Notifications' })).toBeInTheDocument()} />
<Story name="All icons" asChild>
	<div style="display: grid; grid-template-columns: repeat(auto-fill, 88px); gap: 12px; width: 560px">
		{#each Object.keys(ICONS) as n (n)}
			<div style="display: grid; justify-items: center; gap: 6px; font-size: 11px; color: var(--aui-muted, #777)"><Icon name={n} size={20} />{n}</div>
		{/each}
	</div>
</Story>
