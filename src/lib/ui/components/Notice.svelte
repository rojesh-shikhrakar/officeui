<!-- Notice – an inline message; the leading glyph varies by tone so color is never the only signal. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './notice.css';
	type Tone = 'info' | 'success' | 'warning' | 'danger';
	type Props = { tone?: Tone; title?: string; compact?: boolean; action?: Snippet; ondismiss?: () => void; children?: Snippet; class?: string };
	let { tone = 'info', title, compact = false, action, ondismiss, children, class: cls }: Props = $props();
	const G: Record<Tone, string> = { info: '■', success: '●', warning: '◆', danger: '▲' };
</script>

<div class={['ui-ntc', `ui-ntc--${tone}`, compact && 'ui-ntc--compact', cls]} role={tone === 'danger' ? 'alert' : 'status'}>
	<span class="ui-ntc__glyph" aria-hidden="true">{G[tone]}</span>
	<div class="ui-ntc__main">
		{#if title}<p class="ui-ntc__title">{title}</p>{/if}
		<p class="ui-ntc__body">{@render children?.()}</p>
		{#if action}<div class="ui-ntc__action">{@render action()}</div>{/if}
	</div>
	{#if ondismiss}<button type="button" class="ui-ntc__x" aria-label="Dismiss" onclick={ondismiss}><Icon name="x" size={14} /></button>{/if}
</div>
