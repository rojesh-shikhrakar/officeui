<!-- ToastStack – A live region of tone-coded toasts; pair with useToasts() from toasts.svelte. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Toast } from '../utils/toasts.svelte';
	import './toast-stack.css';
	type Props = {
		toasts?: Toast[];
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom';
		/** Positioned in its parent instead of the viewport */
		inline?: boolean;
		ondismiss?: (id: number) => void;
		class?: string;
	};
	let { toasts = [], position = 'bottom-right', inline, ondismiss, class: cls }: Props = $props();
	const TG = { info: 'info', success: 'circle-check', warning: 'alert', danger: 'alert' };
</script>

<div class={['ui-tsk', `ui-tsk--${position}`, inline && 'is-inline', cls]} role="region" aria-label="Notifications" aria-live="polite">
	{#each toasts as t (t.id)}
		{@const tone = t.tone || 'info'}
		<div class={['ui-tsk__toast', `ui-tsk__toast--${tone}`]} role={tone === 'danger' ? 'alert' : 'status'}>
			<span class="ui-tsk__icon"><Icon name={TG[tone]} size={16} /></span>
			<div class="ui-tsk__main">
				{#if t.title}<p class="ui-tsk__title">{t.title}</p>{/if}
				{#if t.description}<p class="ui-tsk__desc">{t.description}</p>{/if}
				{#if t.action}<div class="ui-tsk__act">{#if typeof t.action === 'function'}{@render t.action()}{:else}{t.action}{/if}</div>{/if}
			</div>
			{#if ondismiss}<button type="button" class="ui-tsk__x" aria-label="Dismiss" onclick={() => ondismiss(t.id)}><Icon name="x" size={14} /></button>{/if}
		</div>
	{/each}
</div>
