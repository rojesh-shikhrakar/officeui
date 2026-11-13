<!-- BottomSheet – A sheet from the bottom with peek / half / full snaps; drag, click or arrow keys on the grabber resize it. Modal by default, or modeless. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import { modal } from '../utils/modal.svelte';
	import './dialog.css';
	import './bottom-sheet.css';

	type Snap = 'peek' | 'half' | 'full';
	const SNAPS: Snap[] = ['peek', 'half', 'full'];
	type Props = {
		open?: boolean;
		title?: string;
		snap?: Snap;
		/** false: no scrim or focus trap, the page behind stays usable */
		modal?: boolean;
		/** Position inside the nearest positioned ancestor instead of the viewport */
		inline?: boolean;
		noAutofocus?: boolean;
		class?: string;
		footer?: Snippet;
		children?: Snippet;
		onclose?: () => void;
		onsnapchange?: (s: Snap) => void;
	};
	let { open = false, title, snap = $bindable('half'), modal: isModal = true, inline = false, noAutofocus = false, class: cls, footer, children, onclose, onsnapchange }: Props = $props();
	const tid = $props.id();
	let ref: HTMLElement | undefined = $state();
	let y0: number | null = null;
	const m = modal(() => ({ open: open && isModal, ref, onclose, noAutofocus: noAutofocus || !isModal }));
	const i = $derived(SNAPS.indexOf(snap));
	function go(n: number) {
		n = Math.max(0, Math.min(2, n));
		snap = SNAPS[n];
		onsnapchange?.(SNAPS[n]);
	}
</script>

{#snippet sheet()}
	<div bind:this={ref} role={isModal ? 'dialog' : 'region'} aria-modal={isModal ? 'true' : undefined} aria-labelledby={title ? tid : undefined} aria-label={title ? undefined : 'Sheet'} tabindex="-1"
		onkeydown={isModal ? m.onkey : (e) => { if (e.key === 'Escape') onclose?.(); }}
		class={['ui-bsh', `ui-bsh--${snap}`, !isModal && 'is-modeless', inline && 'is-inline', cls]}>
		<button type="button" class="ui-bsh__grab" aria-label="Resize sheet. Currently {snap}." onclick={() => go(i === 2 ? 0 : i + 1)}
			onkeydown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowDown') { e.preventDefault(); go(i - 1); } }}
			onpointerdown={(e) => (y0 = e.clientY)}
			onpointerup={(e) => { if (y0 == null) return; const d = e.clientY - y0; y0 = null; if (d < -40) go(i + 1); else if (d > 40) { if (i === 0 && onclose) onclose(); else go(i - 1); } }}><span></span></button>
		{#if title || onclose}
			<div class="ui-bsh__head">
				{#if title}<h2 id={tid} class="ui-bsh__title">{title}</h2>{/if}
				{#if onclose}<Button variant="ghost" size="sm" aria-label="Close" onclick={onclose}>{#snippet icon()}<Icon name="x" size={16} />{/snippet}</Button>{/if}
			</div>
		{/if}
		<div class="ui-bsh__body">{@render children?.()}</div>
		{#if footer}<div class="ui-bsh__foot">{@render footer()}</div>{/if}
	</div>
{/snippet}

{#if open}
	{#if !isModal}
		{@render sheet()}
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class={['ui-scrim ui-scrim--bottom ui-scrim--sheet', inline && 'is-inline']} onmousedown={(e) => { if (e.target === e.currentTarget) onclose?.(); }}>{@render sheet()}</div>
	{/if}
{/if}
