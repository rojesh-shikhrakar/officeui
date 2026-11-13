<!-- Toolbar – A role="toolbar" of icon buttons in groups with roving focus (arrow keys, Home, End), toggle state and tooltips. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type ToolbarItem = { id: string; label: string; icon?: string | Snippet; pressed?: boolean; disabled?: boolean; showLabel?: boolean; onclick?: (e: MouseEvent) => void };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import Tooltip from './Tooltip.svelte';
	import './toolbar.css';

	type Props = { groups?: ToolbarItem[][]; label?: string; orientation?: 'horizontal' | 'vertical'; variant?: 'default' | 'flat' | 'floating'; end?: Snippet; class?: string };
	let { groups = [], label, orientation = 'horizontal', variant = 'default', end, class: cls }: Props = $props();
	let ref: HTMLElement | undefined = $state();
	let foc = $state(0);
	const vert = $derived(orientation === 'vertical');
	// flat index of each group's first slot
	const offsets = $derived(groups.reduce<number[]>((a, g, i) => (a.push(i ? a[i - 1] + groups[i - 1].length : 0), a), []));

	function onkey(e: KeyboardEvent) {
		if (!ref) return;
		const bs = [...ref.querySelectorAll<HTMLElement>('button:not([disabled])')];
		const i = bs.indexOf(document.activeElement as HTMLElement);
		if (i < 0) return;
		const nx = vert ? 'ArrowDown' : 'ArrowRight', pv = vert ? 'ArrowUp' : 'ArrowLeft';
		const j = e.key === nx ? (i + 1) % bs.length : e.key === pv ? (i - 1 + bs.length) % bs.length : e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : -1;
		if (j < 0) return;
		e.preventDefault();
		bs[j].focus();
	}
</script>

{#snippet btn(it: ToolbarItem, idx: number)}
	<button type="button" disabled={it.disabled} aria-label={it.showLabel ? undefined : it.label} aria-pressed={it.pressed != null ? (it.pressed ? 'true' : 'false') : undefined} tabindex={idx === foc ? 0 : -1} onfocus={() => (foc = idx)} onclick={it.onclick} class={['ui-tlb__btn', it.pressed && 'is-pressed']}>
		{#if typeof it.icon === 'string'}<Icon name={it.icon} size={16} />{:else if it.icon}{@render it.icon()}{/if}{#if it.showLabel}<span>{it.label}</span>{/if}
	</button>
{/snippet}

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div bind:this={ref} role="toolbar" aria-label={label} aria-orientation={vert ? 'vertical' : undefined} onkeydown={onkey} class={['ui-tlb', `ui-tlb--${variant}`, vert && 'ui-tlb--v', cls]}>
	{#each groups as g, gi (gi)}
		{#if gi > 0}<span role="separator" aria-orientation={vert ? 'horizontal' : 'vertical'} class="ui-tlb__sep"></span>{/if}
		<span role="group" class="ui-tlb__group">
			{#each g as it, k (it.id)}
				{#if it.showLabel}{@render btn(it, offsets[gi] + k)}{:else}<Tooltip content={it.label}>{@render btn(it, offsets[gi] + k)}</Tooltip>{/if}
			{/each}
		</span>
	{/each}
	{#if end}<span class="ui-tlb__end">{@render end()}</span>{/if}
</div>
