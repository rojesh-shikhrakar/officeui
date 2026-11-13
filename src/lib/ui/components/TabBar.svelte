<!-- TabBar – A mobile bottom navigation bar of icon + label items with optional badges. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type TabBarItem = { id: string; label: string; icon?: string | Snippet; badge?: boolean | number; disabled?: boolean };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import Indicator from './Indicator.svelte';
	import './tab-bar.css';

	type Props = { items?: TabBarItem[]; activeId?: string; label?: string; variant?: 'default' | 'floating'; /** active: only the selected item shows its label */ labels?: 'all' | 'active'; /** Pin to the bottom of the viewport */ fixed?: boolean; class?: string; onchange?: (id: string) => void };
	let { items = [], activeId = $bindable(), label, variant = 'default', labels, fixed = false, class: cls, onchange }: Props = $props();
	const active = $derived(activeId ?? items[0]?.id);
</script>

{#snippet ic(it: TabBarItem)}
	<span class="ui-tbb__ic">{#if typeof it.icon === 'string'}<Icon name={it.icon} size={20} />{:else if it.icon}{@render it.icon()}{/if}</span>
{/snippet}

<nav aria-label={label || 'Primary'} class={['ui-tbb', `ui-tbb--${variant}`, labels === 'active' && 'ui-tbb--active-labels', fixed && 'is-fixed', cls]}>
	<ul>
		{#each items as it (it.id)}
			{@const on = it.id === active}
			<li>
				<button type="button" aria-current={on ? 'page' : undefined} disabled={it.disabled} class={['ui-tbb__btn', on && 'is-on']} onclick={() => { activeId = it.id; onchange?.(it.id); }}>
					{#if it.badge}
						<Indicator count={typeof it.badge === 'number' ? it.badge : undefined} dot={it.badge === true}>{@render ic(it)}</Indicator>
					{:else}{@render ic(it)}{/if}
					<span class="ui-tbb__label">{it.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>
