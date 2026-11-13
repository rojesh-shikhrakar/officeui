<!-- Banner – A full-width page message, optionally sticky, with action and dismiss. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './banner.css';
	type Tone = 'info' | 'success' | 'warning' | 'danger' | 'brand';
	type Props = { tone?: Tone; title?: string; sticky?: boolean; action?: Snippet; ondismiss?: () => void; children?: Snippet; class?: string };
	let { tone = 'info', title, sticky, action, ondismiss, children, class: cls }: Props = $props();
	const BI = { info: 'info', success: 'circle-check', warning: 'alert', danger: 'alert', brand: 'bell' };
	const BW = { info: 'Information', success: 'Success', warning: 'Warning', danger: 'Error', brand: 'Announcement' };
</script>

<div role={tone === 'danger' ? 'alert' : 'status'} class={['ui-bnr', `ui-bnr--${tone}`, sticky && 'is-sticky', cls]}>
	<span class="ui-bnr__ic"><Icon name={BI[tone]} size={16} /><span class="ui-bnr__sr">{BW[tone]}: </span></span>
	<p class="ui-bnr__text">{#if title}<b>{title} </b>{/if}{@render children?.()}</p>
	{#if action}<span class="ui-bnr__act">{@render action()}</span>{/if}
	{#if ondismiss}<button type="button" class="ui-bnr__x" aria-label="Dismiss" onclick={ondismiss}><Icon name="x" size={14} /></button>{/if}
</div>
