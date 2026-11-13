<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Badge',
		component: Badge,
		tags: ['autodocs'],
		args: { tone: 'success', variant: 'soft', size: 'md' },
		argTypes: {
			tone: { control: 'select', options: ['neutral', 'success', 'danger', 'warning', 'info', 'accent'] },
			variant: { control: 'inline-radio', options: ['soft', 'solid', 'outline'] },
			size: { control: 'inline-radio', options: ['sm', 'md'] }
		}
	});
	const tones = ['neutral', 'success', 'danger', 'warning', 'info', 'accent'] as const;
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByText('Active')).toBeInTheDocument()}>
	<Badge tone="success">Active</Badge>
</Story>
<Story name="All tones" asChild>
	<div style="display: grid; gap: 10px">
		{#each ['soft', 'solid', 'outline'] as const as v (v)}
			<div style="display: flex; gap: 8px; flex-wrap: wrap">
				{#each tones as t (t)}<Badge tone={t} variant={v}>{t}</Badge>{/each}
			</div>
		{/each}
		<div style="display: flex; gap: 8px"><Badge size="sm">Small</Badge><Badge tone="danger" size="sm">Small</Badge></div>
	</div>
</Story>
