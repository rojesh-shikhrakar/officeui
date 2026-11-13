<!-- ActionSheet – A mobile-style stack of actions rising from the bottom, with a separate Cancel button. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type SheetAction = { label: string; icon?: string | Snippet; danger?: boolean; disabled?: boolean; onselect?: () => void };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import { modal } from '../utils/modal.svelte';
	import './dialog.css';
	import './bottom-sheet.css';
	import './action-sheet.css';

	type Props = { open?: boolean; title?: string; message?: string; actions?: SheetAction[]; cancelLabel?: string; inline?: boolean; noAutofocus?: boolean; onclose?: () => void };
	let { open = false, title, message, actions = [], cancelLabel, inline = false, noAutofocus = false, onclose }: Props = $props();
	const tid = $props.id();
	let ref: HTMLElement | undefined = $state();
	const m = modal(() => ({ open, ref, onclose, noAutofocus }));
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class={['ui-scrim ui-scrim--bottom ui-scrim--sheet', inline && 'is-inline']} onmousedown={(e) => { if (e.target === e.currentTarget) onclose?.(); }}>
		<div bind:this={ref} role="dialog" aria-modal="true" aria-labelledby={title ? tid : undefined} aria-label={title ? undefined : 'Actions'} tabindex="-1" onkeydown={m.onkey} class="ui-ash">
			<div class="ui-ash__card">
				{#if title || message}
					<div class="ui-ash__head">
						{#if title}<p id={tid} class="ui-ash__title">{title}</p>{/if}
						{#if message}<p class="ui-ash__msg">{message}</p>{/if}
					</div>
				{/if}
				{#each actions as a, i (i)}
					<button type="button" disabled={a.disabled} class={['ui-ash__btn', a.danger && 'is-danger']} onclick={() => { a.onselect?.(); onclose?.(); }}>
						{#if typeof a.icon === 'string'}<Icon name={a.icon} size={16} />{:else if a.icon}{@render a.icon()}{/if}<span>{a.label}</span>
					</button>
				{/each}
			</div>
			<button type="button" class="ui-ash__cancel" onclick={onclose}>{cancelLabel || 'Cancel'}</button>
		</div>
	</div>
{/if}
