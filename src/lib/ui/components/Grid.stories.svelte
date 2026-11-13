<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Grid from './Grid.svelte';
	import GridItem from './GridItem.svelte';

	const { Story } = defineMeta({ title: 'Components/Layout/Grid', component: Grid, tags: ['autodocs'], args: { columns: 3, gap: 4 } });
	const cell = 'padding: 12px; border: 1px solid var(--aui-border, rgba(0,0,0,.12)); border-radius: 8px';
</script>

<Story name="Three columns" asChild>
	<Grid columns={3} gap={4}>{#each ['Draft', 'In review', 'Approved', 'Shipped', 'Archived', 'Rejected'] as t}<div style={cell}>{t}</div>{/each}</Grid>
</Story>
<Story name="Auto fit" asChild>
	<Grid min={140} gap={3}>{#each ['INV-20418', 'INV-20419', 'INV-20420', 'INV-20421'] as t}<div style={cell}>{t}</div>{/each}</Grid>
</Story>
<Story name="Spans" asChild>
	<Grid columns={4} gap={3}>
		<GridItem span={2} rowSpan={2} style={cell}>Wide and tall</GridItem>
		<GridItem style={cell}>A</GridItem>
		<GridItem style={cell}>B</GridItem>
		<GridItem span={2} style={cell}>C</GridItem>
	</Grid>
</Story>
