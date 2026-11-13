<!-- ButtonGroup – role="group" of buttons, attached (shared edges) or spaced, horizontal or vertical. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './button-group.css';

	type Props = { label?: string; attached?: boolean; orientation?: 'horizontal' | 'vertical'; children?: Snippet; class?: string };
	let { label, attached = true, orientation = 'horizontal', children, class: cls }: Props = $props();
</script>

<div role="group" aria-label={label} class={['ui-btng', attached ? 'ui-btng--attached' : 'ui-btng--spaced', orientation === 'vertical' && 'ui-btng--v', cls]}>{@render children?.()}</div>
