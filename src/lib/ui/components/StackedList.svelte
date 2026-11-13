<!-- StackedList – A list of rows: title, description, leading/trailing slots; rows can be links or buttons. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type StackedItem = {
		id?: string | number;
		title: string;
		description?: string;
		leading?: Snippet;
		meta?: string;
		trailing?: Snippet;
		href?: string;
		disabled?: boolean;
		onselect?: (it: StackedItem) => void;
	};
</script>

<script lang="ts">
	import './stacked-list.css';

	type Props = {
		items?: StackedItem[];
		/** divided: hairlines · card: boxed · separated: one box per row */
		variant?: 'divided' | 'card' | 'separated';
		density?: 'compact' | 'default';
		label?: string;
		selectedId?: string | number | null;
		onselect?: (it: StackedItem) => void;
		class?: string;
	};
	let { items = [], variant = 'divided', density, label, selectedId = null, onselect, class: cls }: Props = $props();
</script>

{#snippet body(it: StackedItem)}
	{#if it.leading}<span class="ui-slist__lead">{@render it.leading()}</span>{/if}
	<span class="ui-slist__main"><span class="ui-slist__title">{it.title}</span>{#if it.description}<span class="ui-slist__desc">{it.description}</span>{/if}</span>
	{#if it.meta || it.trailing}<span class="ui-slist__end">{#if it.meta}<span class="ui-slist__meta">{it.meta}</span>{/if}{@render it.trailing?.()}</span>{/if}
{/snippet}

<ul class={['ui-slist', `ui-slist--${variant}`, density === 'compact' && 'ui-slist--compact', cls]} aria-label={label}>
	{#each items as it (it.id ?? it.title)}
		{@const sel = selectedId != null && selectedId === it.id}
		{@const click = it.onselect || onselect}
		<li class="ui-slist__li">
			{#if it.href}
				<a href={it.href} class={['ui-slist__row', 'is-interactive', sel && 'is-selected']} aria-current={sel ? 'true' : undefined}>{@render body(it)}</a>
			{:else if click}
				<button type="button" disabled={it.disabled} class={['ui-slist__row', 'is-interactive', sel && 'is-selected']} aria-current={sel ? 'true' : undefined} onclick={() => click(it)}>{@render body(it)}</button>
			{:else}
				<div class="ui-slist__row">{@render body(it)}</div>
			{/if}
		</li>
	{/each}
</ul>
