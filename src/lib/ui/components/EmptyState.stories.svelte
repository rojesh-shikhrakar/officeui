<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import EmptyState from './EmptyState.svelte';

	const { Story } = defineMeta({
		title: 'Components/Feedback/EmptyState',
		component: EmptyState,
		tags: ['autodocs'],
		args: { title: 'No results', description: 'Try a different search.', icon: 'search', variant: 'plain', size: 'md' }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('heading', { name: 'No results' })).toBeInTheDocument()} />
<Story name="Card" args={{ variant: 'card' }} />
<Story name="Dashed small" args={{ variant: 'dashed', size: 'sm' }} />
