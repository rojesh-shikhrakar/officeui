<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Kbd from './Kbd.svelte';

	const { Story } = defineMeta({ title: 'Components/Display/Kbd', component: Kbd, tags: ['autodocs'] });
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByText('K').tagName).toBe('KBD')}>
	<span style="display: inline-flex; gap: 4px; align-items: center">Open palette <Kbd>⌘</Kbd><Kbd>K</Kbd></span>
</Story>
