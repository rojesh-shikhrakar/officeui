<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import ShimmerLoader from './ShimmerLoader.svelte';
	import Skeleton from './Skeleton.svelte';
	import ShimmerText from './ShimmerText.svelte';

	const { Story } = defineMeta({ title: 'Motion/Shimmer Loader', component: ShimmerLoader, tags: ['autodocs'] });
</script>

<Story name="Card" play={async ({ canvasElement }) => expect(within(canvasElement).getByText('Generating your report…')).toBeInTheDocument()} />
<Story name="Five lines" args={{ lines: 5, label: 'Reading 12 sources…' }} />
<Story name="Shimmer text" asChild>
	<ShimmerText text="Thinking…" duration={1.6} />
</Story>
<Story name="Skeleton shapes" asChild>
	<div style="display: grid; gap: 10px; width: 280px">
		<Skeleton width={48} circle />
		<Skeleton height={20} radius={8} />
		<Skeleton width="70%" />
		<Skeleton width={120} height={32} radius={999} />
	</div>
</Story>
