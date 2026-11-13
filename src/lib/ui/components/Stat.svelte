<!-- Stat – A labelled metric with optional unit, delta badge and caption. -->
<script lang="ts">
	import Badge from './Badge.svelte';
	import './stat.css';
	type Props = { label: string; value: string | number; unit?: string; delta?: string; deltaTone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent'; caption?: string; size?: 'lg'; class?: string };
	let { label, value, unit, delta, deltaTone = 'neutral', caption, size, class: cls }: Props = $props();
</script>

<div class={['ui-stat', size === 'lg' && 'ui-stat--lg', cls]}>
	<p class="ui-stat__label">{label}</p>
	<p class="ui-stat__value">{value}{#if unit}<span class="ui-stat__unit">{unit}</span>{/if}</p>
	{#if delta || caption}<p class="ui-stat__foot">{#if delta}<Badge tone={deltaTone} size="sm">{delta}</Badge>{/if}{#if caption}<span>{caption}</span>{/if}</p>{/if}
</div>
