<!-- Kbd – A keyboard key cap. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './kbd.css';
	let { children, class: cls }: { children?: Snippet; class?: string } = $props();
</script>

<kbd class={['ui-kbd', cls]}>{@render children?.()}</kbd>
