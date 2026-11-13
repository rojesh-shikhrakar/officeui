<!-- Accordion – disclosure buttons controlling collapsible panels; single or multiple open. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './accordion.css';
	type Props = { items?: { id: string; title: string; content?: Snippet }[]; open?: string[]; multiple?: boolean; variant?: 'boxed'; class?: string };
	let { items = [], open = $bindable([]), multiple = false, variant, class: cls }: Props = $props();
	const uid = $props.id();
	function toggle(id: string) {
		const on = open.includes(id);
		open = multiple ? (on ? open.filter((x) => x !== id) : [...open, id]) : on ? [] : [id];
	}
</script>

<div class={['ui-acc', variant === 'boxed' && 'ui-acc--boxed', cls]}>
	{#each items as it (it.id)}
		{@const on = open.includes(it.id)}
		<div class={['ui-acc__item', on && 'is-open']}>
			<h3 class="ui-acc__h"><button type="button" id="{uid}{it.id}" class="ui-acc__btn" aria-expanded={on ? 'true' : 'false'} aria-controls="{uid}{it.id}p" onclick={() => toggle(it.id)}><span>{it.title}</span><Icon name="chevron-down" size={16} class="ui-acc__chev" /></button></h3>
			<div class="ui-acc__panel" id="{uid}{it.id}p" role="region" aria-labelledby="{uid}{it.id}">
				<div class="ui-acc__inner" inert={!on}><div class="ui-acc__content">{@render it.content?.()}</div></div>
			</div>
		</div>
	{/each}
</div>
