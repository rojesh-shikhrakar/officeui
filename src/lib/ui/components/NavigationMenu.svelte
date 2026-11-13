<!-- NavigationMenu – A horizontal menu bar whose items open mega-panels (columns of links plus an optional feature card). -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type NavLink = { label: string; href?: string; icon?: string | Snippet; description?: string };
	export type NavPanel = { columns?: { heading?: string; links: NavLink[] }[]; feature?: { eyebrow?: string; title: string; description?: string; action?: Snippet } };
	export type NavItem = { id: string; label: string; href?: string; active?: boolean; panel?: NavPanel };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import './navigation-menu.css';

	type Props = { items?: NavItem[]; /** Id of the open panel */ openId?: string | null; label?: string; /** Open on hover, close on leave */ hover?: boolean; /** Keep open when the pointer leaves */ pinned?: boolean; class?: string };
	let { items = [], openId = $bindable(null), label, hover = true, pinned = false, class: cls }: Props = $props();
	const pid = $props.id();
	let ref: HTMLElement | undefined = $state();
	const cur = $derived(items.find((i) => i.id === openId));
</script>

<svelte:window onmousedown={(e) => { if (openId != null && ref && !ref.contains(e.target as Node)) openId = null; }} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav bind:this={ref} aria-label={label || 'Main'} class={['ui-nvm', cls]}
	onkeydown={(e) => { if (e.key === 'Escape' && openId != null) { e.stopPropagation(); const b = ref?.querySelector<HTMLElement>('[aria-expanded="true"]'); openId = null; b?.focus(); } }}
	onmouseleave={() => { if (hover && openId != null && !pinned) openId = null; }}>
	<ul class="ui-nvm__bar">
		{#each items as it (it.id)}
			<li>
				{#if it.panel}
					<button type="button" class={['ui-nvm__trig', openId === it.id && 'is-open']} aria-expanded={openId === it.id ? 'true' : 'false'} aria-controls={openId === it.id ? pid : undefined}
						onclick={() => (openId = openId === it.id ? null : it.id)} onmouseenter={() => { if (hover) openId = it.id; }}
						onkeydown={(e) => { if (e.key === 'ArrowDown' && openId === it.id) { e.preventDefault(); ref?.querySelector<HTMLElement>('.ui-nvm__panel a')?.focus(); } }}>{it.label}<Icon name="chevron-down" size={14} /></button>
				{:else}
					<a href={it.href || '#'} class={['ui-nvm__trig', it.active && 'is-active']} aria-current={it.active ? 'page' : undefined} onmouseenter={() => (openId = null)}>{it.label}</a>
				{/if}
			</li>
		{/each}
	</ul>
	{#if cur?.panel}
		{@const panel = cur.panel}
		<div id={pid} class="ui-nvm__panel">
			<div class="ui-nvm__cols" style="grid-template-columns: repeat({(panel.columns || []).length}, minmax(0, 1fr))">
				{#each panel.columns || [] as c, ci (ci)}
					<div class="ui-nvm__col">
						{#if c.heading}<p class="ui-nvm__head">{c.heading}</p>{/if}
						<ul>
							{#each c.links as l (l.label)}
								<li><a href={l.href || '#'} class="ui-nvm__link">
									{#if l.icon}<span class="ui-nvm__ic">{#if typeof l.icon === 'string'}<Icon name={l.icon} size={16} />{:else}{@render l.icon()}{/if}</span>{/if}
									<span class="ui-nvm__text">{l.label}{#if l.description}<span class="ui-nvm__desc">{l.description}</span>{/if}</span>
								</a></li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
			{#if panel.feature}
				<div class="ui-nvm__feature">
					<p class="ui-nvm__eyebrow">{panel.feature.eyebrow || 'Featured'}</p>
					<p class="ui-nvm__ftitle">{panel.feature.title}</p>
					{#if panel.feature.description}<p class="ui-nvm__fdesc">{panel.feature.description}</p>{/if}
					{@render panel.feature.action?.()}
				</div>
			{/if}
		</div>
	{/if}
</nav>
