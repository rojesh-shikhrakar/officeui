<!-- PageControl – page dots for a carousel or pager; buttons when onchange is set, a read-only indicator otherwise. -->
<script lang="ts">
	import './page-control.css';

	type Props = { count?: number; /** Current page, 0-based */ current?: number; label?: string; /** inverse: for dark backgrounds */ tone?: 'default' | 'inverse'; size?: 'sm' | 'md'; class?: string; onchange?: (i: number) => void };
	let { count: n = 0, current: cur = 0, label, tone = 'default', size, class: cls, onchange }: Props = $props();
</script>

<div role="group" aria-label={label || 'Pages'} class={['ui-pgc', tone === 'inverse' && 'ui-pgc--inverse', size === 'sm' && 'ui-pgc--sm', cls]}>
	{#each { length: n } as _, i (i)}
		{@const on = i === cur}
		{#if onchange}
			<button type="button" class={['ui-pgc__dot', on && 'is-on']} aria-label="Page {i + 1} of {n}" aria-current={on ? 'true' : undefined} onclick={() => onchange(i)}><span></span></button>
		{:else}
			<span class={['ui-pgc__dot', on && 'is-on']} aria-hidden="true"><span></span></span>
		{/if}
	{/each}
	{#if !onchange}<span class="ui-pgc__sr">Page {cur + 1} of {n}</span>{/if}
</div>
