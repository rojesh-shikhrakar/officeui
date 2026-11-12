<!-- App Shell – the frame every screen sits in: a collapsible sidebar (workspace, search, menu, projects, cards, account), the work area, and an optional side panel. `variant` is inset (a white card on grey) or flat (edge to edge). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NavSection } from './nav';
	import '../../agents/agents.css';
	let {
		workspace = 'Acme',
		user = 'Alex Morgan',
		nav = [],
		active = $bindable(''),
		variant = 'inset',
		back,
		cards = true,
		collapsed = $bindable(false),
		height = 600,
		onnavigate,
		children,
		aside,
		asideWidth = 260
	}: {
		workspace?: string;
		user?: string;
		nav?: NavSection[];
		active?: string;
		variant?: 'inset' | 'flat';
		/** Show a back link (like "Settings") instead of the workspace switcher */
		back?: string;
		/** The "New in" and "Getting started" cards above the account */
		cards?: boolean;
		collapsed?: boolean;
		height?: number;
		onnavigate?: (id: string) => void;
		children?: Snippet;
		aside?: Snippet;
		asideWidth?: number;
	} = $props();
	let q = $state('');
	let news = $state(true);
	const initials = $derived(user.split(' ').map((w) => w[0]).join(''));
	const filtered = $derived(q ? nav.map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) })).filter((s) => s.items.length) : nav);
	function go(id: string) {
		active = id;
		onnavigate?.(id);
	}
</script>

<div class="ui-ag ui-shell" data-variant={variant} data-collapsed={collapsed || undefined} style:--h="{height}px" style:--aside="{asideWidth}px">
	<aside class="ui-shell__side" aria-label="Sidebar">
		<div class="ui-shell__ws">
			{#if back}<button class="ui-shell__back" onclick={() => go('back')}>‹ <b>{back}</b></button>{:else}<span class="ui-shell__logo">{workspace[0]}</span><b>{workspace}</b><span class="ui-ag-muted">⌄</span>{/if}
			<span class="ui-ag-grow"></span>
			<button class="ui-shell__icon" aria-label="Collapse sidebar" onclick={() => (collapsed = true)}>◫</button>
		</div>
		<label class="ui-shell__search"><span>⌕</span><input placeholder="Search…" aria-label="Search the menu" bind:value={q} /><kbd>⌘K</kbd></label>
		<nav>
			{#each filtered as s, si (si)}
				{#if s.label}<p class="ui-shell__label">{s.label}</p>{/if}
				{#each s.items as it (it.id)}
					<button class="ui-shell__item" data-indent={it.indent || undefined} aria-current={active === it.id ? 'page' : undefined} onclick={() => go(it.id)}>
						{#if it.icon}<i>{it.icon}</i>{/if}<span>{it.label}</span>{#if it.dot}<em class="ui-shell__dot"></em>{/if}{#if it.count}<small>{it.count}</small>{/if}
					</button>
				{/each}
			{/each}
		</nav>
		<span class="ui-ag-grow"></span>
		{#if cards}
			{#if news}<div class="ui-shell__card"><small class="ui-shell__new">New in {workspace}</small><b>Shared folders</b><button class="ui-shell__x" aria-label="Dismiss" onclick={() => (news = false)}>×</button><span class="ui-ag-muted">Full changelog ›</span></div>{/if}
			<div class="ui-shell__card"><b>Getting started</b><small>13% done · <em>Great start!</em></small><span class="ui-ag-bar"><i style:width="13%"></i></span></div>
		{/if}
		<button class="ui-shell__user"><span class="ui-ag-avatar" style:background="#dbe7ff" style:color="#2f6bff">{initials}</span><b>{user}</b><span class="ui-ag-muted">⌄</span></button>
	</aside>
	<main class="ui-shell__main">
		{#if collapsed}<button class="ui-shell__icon ui-shell__open" aria-label="Open sidebar" onclick={() => (collapsed = false)}>◫</button>{/if}
		{@render children?.()}
	</main>
	{#if aside}<section class="ui-shell__aside" aria-label="Side panel">{@render aside()}</section>{/if}
</div>

<style>
	.ui-shell {
		display: grid;
		grid-template-columns: 190px 1fr;
		gap: 6px;
		width: 100%;
		max-width: 1100px;
		height: var(--h);
		padding: 6px;
		box-sizing: border-box;
		background: var(--ag-fill);
		border-radius: 10px;
		box-shadow: 0 0 0 1px var(--ag-line);
		font-size: 11px;
		overflow: hidden;
	}
	.ui-shell:has(> .ui-shell__aside) {
		grid-template-columns: 190px 1fr var(--aside);
	}
	.ui-shell[data-collapsed] {
		grid-template-columns: 1fr;
	}
	.ui-shell[data-collapsed]:has(> .ui-shell__aside) {
		grid-template-columns: 1fr var(--aside);
	}
	.ui-shell[data-collapsed] .ui-shell__side {
		display: none;
	}
	.ui-shell[data-variant='flat'] {
		gap: 0;
		padding: 0;
		background: var(--ag-surface);
	}
	.ui-shell[data-variant='flat'] .ui-shell__side {
		background: var(--ag-fill);
		padding: 10px 8px;
	}
	.ui-shell[data-variant='flat'] .ui-shell__main,
	.ui-shell[data-variant='flat'] .ui-shell__aside {
		border-radius: 0;
		box-shadow: none;
	}
	.ui-shell[data-variant='flat'] .ui-shell__aside {
		border-left: 1px solid var(--ag-line);
	}
	.ui-shell__side {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		min-width: 0;
		min-height: 0;
		overflow-y: auto;
	}
	.ui-shell__ws {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
	}
	.ui-shell__ws b {
		font-weight: 500;
	}
	.ui-shell__logo {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		display: grid;
		place-items: center;
		font-size: 9px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
	}
	.ui-shell__back {
		all: unset;
		cursor: pointer;
		color: var(--ag-muted);
	}
	.ui-shell__back b {
		color: var(--ag-ink);
	}
	.ui-shell__icon {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		border-radius: 6px;
		padding: 2px 5px;
		font: inherit;
	}
	.ui-shell__icon:hover {
		background: var(--ag-fill);
	}
	.ui-shell__open {
		position: absolute;
		left: 8px;
		top: 8px;
		z-index: 2;
	}
	.ui-shell__search {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		margin: 2px 0 6px;
		border-radius: 7px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		color: var(--ag-muted);
	}
	.ui-shell__search input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		color: var(--ag-ink);
	}
	kbd {
		font: inherit;
		font-size: 9px;
		color: var(--ag-subtle);
	}
	.ui-shell__label {
		margin: 10px 6px 2px;
		font-size: 9.5px;
		color: var(--ag-subtle);
	}
	.ui-shell__item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 7px;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		text-align: left;
		padding: 4px 6px;
		border-radius: 6px;
		cursor: pointer;
	}
	.ui-shell__item span {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-shell__item i {
		width: 12px;
		font-style: normal;
		color: var(--ag-muted);
		text-align: center;
	}
	.ui-shell__item small {
		color: var(--ag-subtle);
	}
	.ui-shell__item[data-indent] {
		padding-left: 25px;
		color: var(--ag-muted);
	}
	.ui-shell__item:hover {
		background: color-mix(in srgb, var(--ag-ink) 4%, transparent);
	}
	.ui-shell__item[aria-current] {
		background: color-mix(in srgb, var(--ag-ink) 6%, transparent);
		font-weight: 500;
	}
	.ui-shell__dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--ag-blue);
	}
	.ui-shell__card {
		position: relative;
		display: grid;
		gap: 3px;
		padding: 8px 9px;
		margin-top: 6px;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
	}
	.ui-shell__card b {
		font-weight: 500;
	}
	.ui-shell__card small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-shell__card em {
		font-style: normal;
		color: var(--ag-blue);
	}
	.ui-shell__new {
		color: var(--ag-blue) !important;
	}
	.ui-shell__x {
		position: absolute;
		right: 6px;
		top: 4px;
		border: 0;
		background: none;
		color: var(--ag-subtle);
		cursor: pointer;
	}
	.ui-shell__user {
		display: flex;
		align-items: center;
		gap: 7px;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		padding: 8px 4px 2px;
		cursor: pointer;
	}
	.ui-shell__user b {
		flex: 1;
		text-align: left;
		font-weight: 500;
	}
	.ui-shell__main,
	.ui-shell__aside {
		position: relative;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		background: var(--ag-surface);
		border-radius: 8px;
		box-shadow: var(--ag-shadow);
	}
</style>
