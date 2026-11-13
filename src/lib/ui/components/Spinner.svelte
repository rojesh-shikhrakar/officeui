<!-- Spinner – role="status" loading indicator: ring, dots or bars. -->
<script lang="ts">
	import './spinner.css';

	type Props = { variant?: 'ring' | 'dots' | 'bars'; size?: 'sm' | 'md' | 'lg'; label?: string; showLabel?: boolean; class?: string };
	let { variant = 'ring', size = 'md', label, showLabel = true, class: cls }: Props = $props();
</script>

<span role="status" class={['ui-spn', `ui-spn--${size}`, cls]}>
	{#if variant === 'ring'}<span class="ui-spn__ring" aria-hidden="true"></span>
	{:else if variant === 'dots'}<span class="ui-spn__dots" aria-hidden="true"><i></i><i></i><i></i></span>
	{:else}<span class="ui-spn__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>{/if}
	<span class={label && showLabel ? 'ui-spn__label' : 'ui-spn__sr'}>{label || 'Loading'}</span>
</span>
