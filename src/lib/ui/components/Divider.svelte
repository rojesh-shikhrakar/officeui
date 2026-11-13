<!-- Divider – A hairline separator, horizontal (optionally with a centered label) or vertical. -->
<script lang="ts">
	import './divider.css';
	let { orientation = 'horizontal', label, class: cls }: { orientation?: 'horizontal' | 'vertical'; label?: string; class?: string } = $props();
</script>

{#if orientation === 'vertical'}
	<span role="separator" aria-orientation="vertical" class={['ui-div-v', cls]}></span>
{:else}
	<div role="separator" class={['ui-div', label && 'ui-div--label', cls]}>{#if label}<span>{label}</span>{/if}</div>
{/if}
