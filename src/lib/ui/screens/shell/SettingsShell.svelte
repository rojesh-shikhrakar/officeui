<!-- Settings Shell – the app shell with the settings menu and a centred page with a title and subtitle. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppShell from './AppShell.svelte';
	import { SETTINGS_NAV } from './nav';
	import './screen.css';
	let { page, title, subtitle, user = 'Alex Morgan', height = 600, wide = false, children, actions }: { page: string; title: string; subtitle?: string; user?: string; height?: number; wide?: boolean; children?: Snippet; actions?: Snippet } = $props();
	// svelte-ignore state_referenced_locally
	let active = $state(page);
</script>

<AppShell nav={SETTINGS_NAV} bind:active back="Settings" cards={false} {user} {height}>
	<div class="ui-scr ui-scr--narrow" style:max-width={wide ? '720px' : undefined}>
		<div class="ui-ag-row"><span class="ui-ag-grow"><h1>{title}</h1></span>{@render actions?.()}</div>
		{#if subtitle}<p class="ui-scr__sub">{subtitle}</p>{/if}
		{#if active === page}{@render children?.()}{:else}<div class="ui-scr__empty"><i>⚙</i><b>{SETTINGS_NAV.flatMap((s) => s.items).find((i) => i.id === active)?.label}</b><span>This settings page has its own screen.</span></div>{/if}
	</div>
</AppShell>
