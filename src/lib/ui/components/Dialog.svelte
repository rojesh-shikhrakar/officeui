<!-- Dialog – A modal with title, body and footer; alert makes it an alertdialog. Esc and scrim click close (when onclose is set). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { modal } from '../utils/modal.svelte';
	import './dialog.css';

	type Props = {
		open?: boolean;
		title: string;
		size?: 'sm' | 'md' | 'lg';
		/** role="alertdialog" for a confirmation that needs an answer */
		alert?: boolean;
		noAutofocus?: boolean;
		onclose?: () => void;
		footer?: Snippet;
		children?: Snippet;
	};
	let { open = $bindable(false), title, size = 'md', alert = false, noAutofocus = false, onclose, footer, children }: Props = $props();
	const tid = $props.id();
	let el: HTMLElement | undefined = $state();
	function close() { open = false; onclose?.(); }
	const m = modal(() => ({ open, ref: el, onclose: onclose ? close : undefined, noAutofocus }));
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ui-scrim" onmousedown={(e) => { if (e.target === e.currentTarget && onclose) close(); }}>
		<div bind:this={el} class="ui-dlg ui-dlg--{size}" role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby={tid} tabindex="-1" onkeydown={m.onkey}>
			<div class="ui-dlg__head">
				<h2 id={tid} class="ui-dlg__title">{title}</h2>
				{#if onclose}<Button variant="ghost" size="sm" aria-label="Close" onclick={close}>{#snippet icon()}<Icon name="x" />{/snippet}</Button>{/if}
			</div>
			<div class="ui-dlg__body">{@render children?.()}</div>
			{#if footer}<div class="ui-dlg__foot">{@render footer()}</div>{/if}
		</div>
	</div>
{/if}
