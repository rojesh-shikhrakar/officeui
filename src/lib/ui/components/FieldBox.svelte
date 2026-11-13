<!-- FieldBox – label + control + hint/error wrapper. Give the control id={id} and aria-describedby="{id}-n". -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './field-box.css';

	type Props = { id: string; label?: string; hint?: string; error?: string; children?: Snippet; class?: string };
	let { id, label, hint, error, children, class: cls }: Props = $props();
</script>

<div class={['ui-fld', cls]}>
	{#if label}<label class="ui-fld__label" for={id} id="{id}-l">{label}</label>{/if}
	{@render children?.()}
	{#if error}<span id="{id}-n" class="ui-fld__error">Error: {error}</span>
	{:else if hint}<span id="{id}-n" class="ui-fld__hint">{hint}</span>{/if}
</div>
