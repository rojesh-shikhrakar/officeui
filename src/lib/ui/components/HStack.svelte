<!-- HStack – A horizontal Stack, centered on the cross axis. -->
<script lang="ts">
	import Stack from './Stack.svelte';
	import type { ComponentProps } from 'svelte';
	let { align = 'center', children, ...rest }: Omit<ComponentProps<typeof Stack>, 'direction'> = $props();
</script>

<Stack {...rest} {align} direction="row">{@render children?.()}</Stack>
