<!-- Drawer – A modal panel sliding in from the left or right edge, with eyebrow, title and footer. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { modal } from '../utils/modal.svelte';
	import './dialog.css';
	import './drawer.css';

	type Props = { open?: boolean; onclose?: () => void; title: string; eyebrow?: string; side?: 'left' | 'right'; size?: 'sm' | 'md' | 'lg'; noAutofocus?: boolean; footer?: Snippet; children?: Snippet };
	let { open = false, onclose, title, eyebrow, side = 'right', size = 'md', noAutofocus = false, footer, children }: Props = $props();
	const tid = $props.id();
	let el = $state<HTMLDivElement>();
	const m = modal(() => ({ open, ref: el, onclose, noAutofocus }));
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ui-scrim ui-scrim--{side}" onmousedown={(e) => { if (e.target === e.currentTarget) onclose?.(); }}>
		<div bind:this={el} role="dialog" aria-modal="true" aria-labelledby={tid} tabindex="-1" onkeydown={m.onkey} class="ui-drw ui-drw--{side} ui-drw--{size}">
			<div class="ui-drw__head">
				<div>{#if eyebrow}<p class="ui-drw__eyebrow">{eyebrow}</p>{/if}<h2 id={tid} class="ui-dlg__title">{title}</h2></div>
				{#if onclose}<Button variant="ghost" size="sm" aria-label="Close" onclick={onclose}>{#snippet icon()}<Icon name="x" />{/snippet}</Button>{/if}
			</div>
			<div class="ui-drw__body">{@render children?.()}</div>
			{#if footer}<div class="ui-dlg__foot">{@render footer()}</div>{/if}
		</div>
	</div>
{/if}
