<!-- Shimmer Text – A light band sweeps across text, e.g. "Thinking…". -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './shimmer-loader.css';
	let { text, duration = 2, children, class: cls }: { text?: string; /** Seconds per pass */ duration?: number; children?: Snippet; class?: string } = $props();
</script>

<span class={['ui-shm-text', cls]} style:--ui-shm-text-dur="{duration}s">{#if children}{@render children()}{:else}{text}{/if}</span>
