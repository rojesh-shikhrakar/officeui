<!-- Tooltip – shows on hover and focus-within; wires aria-describedby onto the first child element. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './tooltip.css';

	type Props = { content?: string | Snippet; side?: 'top' | 'bottom'; /** Force it visible */ open?: boolean; children?: Snippet; class?: string };
	let { content, side = 'top', open = false, children, class: cls }: Props = $props();
	const id = $props.id();
	let wrap: HTMLElement | undefined = $state();
	$effect(() => {
		wrap?.firstElementChild?.setAttribute('aria-describedby', id);
	});
</script>

<span bind:this={wrap} class={['ui-tip', open && 'ui-tip--open', cls]}>
	{@render children?.()}
	<span {id} role="tooltip" class="ui-tip__bubble ui-tip__bubble--{side}">{#if typeof content === 'function'}{@render content()}{:else}{content}{/if}</span>
</span>
