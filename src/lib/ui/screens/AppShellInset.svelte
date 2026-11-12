<!-- App Shell Inset – the collapsible sidebar with workspace, menu, projects and account around an inset page, with a browser-like side panel of tools and suggested pages. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppShell from './shell/AppShell.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { workspace = 'Acme', user = 'Alex Morgan', variant = 'inset', panel = true, children }: { workspace?: string; user?: string; variant?: 'inset' | 'flat'; panel?: boolean; children?: Snippet } = $props();
	let active = $state('new');
	let tabs = $state(['New tab']);
	let url = $state('');
	const tools = [['▣', 'Terminal', '⌃`'], ['⊕', 'Browser', '⌘⇧B'], ['▤', 'Notes', '⌘⇧N']];
	const suggested = [['A', 'Engine optimisation guide', 'research.org'], ['N', 'Design tokens – naming guide', 'notes.app'], ['L', 'Q3 launch checklist', 'tracker.app'], ['S', 'Q3 launch budget', 'sheets.app']];
</script>

{#snippet side()}
	<div class="ui-scr__tabs">{#each tabs as t, i (i)}<span class="ui-scr__tab">⊕ {t}<button class="ui-ag-btn" data-variant="ghost" aria-label="Close tab" onclick={() => (tabs = tabs.filter((_, j) => j !== i))}>×</button></span>{/each}<button class="ui-ag-btn" data-variant="ghost" aria-label="New tab" onclick={() => (tabs = [...tabs, 'New tab'])}>+</button></div>
	<div class="ui-scr__panel">
		<input class="ui-ag-input" placeholder="⌕  Search or enter URL" aria-label="Search or enter URL" bind:value={url} />
		<small class="ui-scr__k">Tools</small>
		<div class="ui-scr__rows">{#each tools as [ic, name, key] (name)}<div class="ui-scr__row"><span><b>{ic} &nbsp;{name}</b></span><span class="ui-ag-kbd">{key}</span></div>{/each}</div>
		<small class="ui-scr__k">Suggested</small>
		<div class="ui-scr__rows">{#each suggested as [l, t, d] (t)}<div class="ui-scr__row"><span><b>{l} &nbsp;{t}</b><small>{d}</small></span></div>{/each}</div>
	</div>
{/snippet}

<AppShell {workspace} {user} {variant} nav={CHAT_NAV} bind:active aside={panel ? side : undefined}>
	{#if children}{@render children()}{:else}
		<div class="ui-scr__empty"><i>▤</i><b>Your page goes here</b><span>The shell brings both sidebars and the scroll container – put any screen inside.</span></div>
	{/if}
</AppShell>
