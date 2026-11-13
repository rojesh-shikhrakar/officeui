<!-- VStack – A vertical Stack. -->
<script lang="ts">
	import Stack from './Stack.svelte';
	import type { ComponentProps } from 'svelte';
	let { children, ...rest }: Omit<ComponentProps<typeof Stack>, 'direction'> = $props();
</script>

<Stack {...rest} direction="column">{@render children?.()}</Stack>
