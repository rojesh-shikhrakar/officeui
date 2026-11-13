<!-- MapPin – A marker for custom maps: pin, dot, label or cluster; absolute (x/y in %) or inline. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './map-pin.css';

	type Props = {
		variant?: 'pin' | 'dot' | 'label' | 'cluster';
		tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'info';
		/** Position in % of the parent; set both to place absolutely */
		x?: number;
		y?: number;
		/** An icon name, or a snippet */
		icon?: string | Snippet;
		label?: string;
		count?: number;
		/** Accessible name */
		name?: string;
		selected?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
	};
	let { variant: v = 'pin', tone = 'neutral', x, y, icon, label, count, name, selected = false, class: cls, onclick }: Props = $props();
	const abs = $derived(x != null && y != null);
	const style = $derived(abs ? `left: ${x}%; top: ${y}%` : undefined);
	const c = $derived(['ui-mp', `ui-mp--${v}`, `ui-mp--${tone}`, selected && 'is-selected', abs && 'is-abs', cls]);
	const aria = $derived(name || (v === 'cluster' ? `${count} places` : label) || 'Map pin');
</script>

{#snippet ic(s: number)}{#if typeof icon === 'string'}<Icon name={icon} size={s} />{:else if icon}{@render icon()}{/if}{/snippet}
{#snippet inner()}
	{#if v === 'dot'}<span class="ui-mp__dot"></span>
	{:else if v === 'label'}<span class="ui-mp__label">{#if icon}{@render ic(12)}{/if}{label}</span>
	{:else if v === 'cluster'}<span class="ui-mp__cluster">{count}</span>
	{:else}<span class="ui-mp__pin"><svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true"><path d="M17 40s12-10.5 12-22A12 12 0 005 18c0 11.5 12 22 12 22z" class="ui-mp__body" /></svg><span class="ui-mp__in">{#if icon}{@render ic(14)}{:else if label != null}{label}{/if}</span></span>{/if}
{/snippet}

{#if onclick}
	<button type="button" class={[c, 'is-btn']} {style} aria-label={aria} aria-pressed={selected} {onclick}>{@render inner()}</button>
{:else}
	<span class={c} {style} role="img" aria-label={aria}>{@render inner()}</span>
{/if}
