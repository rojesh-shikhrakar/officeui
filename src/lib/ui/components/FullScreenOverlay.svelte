<!-- FullScreenOverlay – takes over the viewport with a top bar (close, title, actions); default or immersive (dark) look. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { modal } from '../utils/modal.svelte';
	import './dialog.css';
	import './full-screen-overlay.css';

	type Props = {
		open?: boolean;
		title?: string;
		/** Keep the title for screen readers only */
		hideTitle?: boolean;
		variant?: 'default' | 'immersive';
		/** Fill the nearest positioned ancestor instead of the viewport */
		inline?: boolean;
		noAutofocus?: boolean;
		class?: string;
		actions?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		onclose?: () => void;
	};
	let { open = false, title, hideTitle = false, variant = 'default', inline = false, noAutofocus = false, class: cls, actions, footer, children, onclose }: Props = $props();
	const tid = $props.id();
	let ref: HTMLElement | undefined = $state();
	const m = modal(() => ({ open, ref, onclose, noAutofocus }));
</script>

{#if open}
	<div bind:this={ref} role="dialog" aria-modal="true" aria-labelledby={tid} tabindex="-1" onkeydown={m.onkey} class={['ui-fso', variant === 'immersive' && 'ui-fso--immersive', inline && 'is-inline', cls]}>
		<div class="ui-fso__bar">
			<Button variant="ghost" size="sm" aria-label="Close" onclick={onclose}>{#snippet icon()}<Icon name="x" size={18} />{/snippet}</Button>
			<h2 id={tid} class={['ui-fso__title', hideTitle && 'is-sr']}>{title}</h2>
			<span class="ui-fso__act">{@render actions?.()}</span>
		</div>
		<div class="ui-fso__body">{@render children?.()}</div>
		{#if footer}<div class="ui-fso__foot">{@render footer()}</div>{/if}
	</div>
{/if}
