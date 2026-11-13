<!-- Navbar – A top bar: brand, links, actions; collapses to a menu button on narrow screens. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type NavbarLink = { label: string; href?: string; active?: boolean; icon?: string | Snippet; badge?: Snippet; onclick?: (e: MouseEvent) => void };
</script>

<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import './navbar.css';

	type Props = { links?: NavbarLink[]; brand?: Snippet; actions?: Snippet; variant?: 'default' | 'transparent' | 'inverse'; sticky?: boolean; label?: string; class?: string };
	let { links = [], brand, actions, variant, sticky = false, label, class: cls }: Props = $props();
	let mob = $state(false);
</script>

{#snippet link(l: NavbarLink)}
	<a href={l.href ?? '#'} class={['ui-nvb__link', l.active && 'is-active']} aria-current={l.active ? 'page' : undefined} onclick={l.onclick}>
		{#if typeof l.icon === 'string'}<Icon name={l.icon} />{:else if l.icon}{@render l.icon()}{/if}{l.label}{@render l.badge?.()}
	</a>
{/snippet}

<header class={['ui-nvb', variant && variant !== 'default' && `ui-nvb--${variant}`, sticky && 'ui-nvb--sticky', cls]}>
	<div class="ui-nvb__in">
		{#if brand}<div class="ui-nvb__brand">{@render brand()}</div>{/if}
		<nav class="ui-nvb__links" aria-label={label ?? 'Main'}>{#each links as l, i (i)}{@render link(l)}{/each}</nav>
		<div class="ui-nvb__actions">{@render actions?.()}</div>
		<Button class="ui-nvb__burger" variant="ghost" aria-label="Menu" aria-expanded={mob ? 'true' : 'false'} onclick={() => (mob = !mob)}>
			{#snippet icon()}<Icon name={mob ? 'x' : 'menu'} />{/snippet}
		</Button>
	</div>
	{#if mob}<nav class="ui-nvb__mobile" aria-label={label ?? 'Main'}>{#each links as l, i (i)}{@render link(l)}{/each}</nav>{/if}
</header>
