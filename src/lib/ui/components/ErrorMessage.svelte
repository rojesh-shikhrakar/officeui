<!-- ErrorMessage – role="alert" error: inline one-liner, block card or centered page, with optional retry. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import './error-message.css';

	type Props = { title?: string; description?: string; code?: string | number; variant?: 'inline' | 'block' | 'page'; onretry?: () => void; retryLabel?: string; actions?: Snippet; class?: string };
	let { title, description, code, variant = 'block', onretry, retryLabel, actions, class: cls }: Props = $props();
</script>

{#if variant === 'inline'}
	<p role="alert" class={['ui-err-inline', cls]}><Icon name="alert" size={14} /><span>Error: {title || description}</span></p>
{:else}
	<div role="alert" class={['ui-err', `ui-err--${variant}`, cls]}>
		<span class="ui-err__icon"><Icon name="alert" size={variant === 'page' ? 26 : 18} /></span>
		<div class="ui-err__main">
			{#if code}<p class="ui-err__code">Error {code}</p>{/if}
			<h3 class="ui-err__title">{title}</h3>
			{#if description}<p class="ui-err__desc">{description}</p>{/if}
			{#if onretry || actions}
				<div class="ui-err__act">{#if onretry}<Button size="sm" variant="secondary" onclick={onretry}>{retryLabel || 'Try again'}</Button>{/if}{@render actions?.()}</div>
			{/if}
		</div>
	</div>
{/if}
