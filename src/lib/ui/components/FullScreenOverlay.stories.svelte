<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FullScreenOverlay from './FullScreenOverlay.svelte';
	import Button from './Button.svelte';
	const { Story } = defineMeta({ title: 'Components/Overlays/FullScreenOverlay', component: FullScreenOverlay, tags: ['autodocs'] });
</script>

<Story name="Open" args={{ open: true, inline: true, title: "Release notes" }}>
	{#snippet template(args)}<FullScreenOverlay {...args}>Release 2.14 passed all 312 checks and is ready to approve.{#snippet footer()}<Button>Approve release</Button>{/snippet}</FullScreenOverlay>{/snippet}
</Story>
<Story name="Hidden title" args={{ open: true, inline: true, title: "Invoice INV-20418", hideTitle: true }}>
	{#snippet template(args)}<FullScreenOverlay {...args}>Invoice INV-20418 is due on 30 June.</FullScreenOverlay>{/snippet}
</Story>
