<!-- AI Chat / Start – a complete first screen of an AI chat app: sidebar with folders and projects, greeting, composer and quick actions. -->
<script lang="ts">
	import ChatComposer from '../agents/ChatComposer.svelte';
	import '../agents/agents.css';

	let {
		workspace = 'Acme',
		user = 'Alex Morgan',
		greeting = "Good evening! What's next on your list?",
		onsend
	}: { workspace?: string; user?: string; greeting?: string; onsend?: (text: string) => void } = $props();

	let collapsed = $state(false);
	let active = $state('new');
	const pinned = ['Q3 launch messaging'];
	const projects = [
		{ name: 'Q3 Campaign', items: ['Ad hooks for the linen overshirt', 'Q3 budget split by channel'] },
		{ name: 'Brand assets' },
		{ name: 'Hiring' },
		{ name: 'Research' }
	];
	const chats = ['Onboarding email draft', 'August content calendar'];
	const actions = ['Company knowledge', 'Create document', 'Create presentation', 'Create table', 'Generate image', 'Deep research', 'Visualize data'];
	const initials = $derived(user.split(' ').map((w) => w[0]).join(''));
</script>

<div class="ui-ag ui-acs" data-collapsed={collapsed || undefined}>
	<aside class="ui-acs__side" aria-label="Sidebar">
		<div class="ui-acs__ws">
			<span class="ui-acs__logo">{workspace[0]}</span><b>{workspace}</b>
			<button class="ui-acs__icon" aria-label="Collapse sidebar" onclick={() => (collapsed = true)}>◫</button>
		</div>
		<label class="ui-acs__search"><span>⌕</span><input placeholder="Search…" aria-label="Search" /><kbd>⌘K</kbd></label>
		<nav class="ui-acs__nav">
			{#each [['new', 'New chat'], ['folders', 'Folders'], ['apps', 'Integrations']] as [id, label] (id)}
				<button data-active={active === id || undefined} onclick={() => (active = id)}>{label}</button>
			{/each}
		</nav>
		<p class="ui-acs__label">Pinned</p>
		{#each pinned as p (p)}<button class="ui-acs__row">{p}<i>…</i></button>{/each}
		<p class="ui-acs__label">Projects</p>
		{#each projects as pr (pr.name)}
			<button class="ui-acs__row">{pr.name}<i>…</i></button>
			{#each pr.items ?? [] as it (it)}<button class="ui-acs__row ui-acs__row--sub">{it}<i>…</i></button>{/each}
		{/each}
		<p class="ui-acs__label">Chats</p>
		{#each chats as c (c)}<button class="ui-acs__row">{c}<i>…</i></button>{/each}
		<div class="ui-acs__card ui-ag-card"><small>New in {workspace}</small><b>Shared folders</b><span>Full changelog ›</span></div>
		<div class="ui-acs__card ui-ag-card"><b>Getting started</b><small>13% done · <em>Great start!</em></small><span class="ui-acs__bar"><i style:width="13%"></i></span></div>
		<div class="ui-acs__user"><span class="ui-ag-avatar" style:background="#dbe7ff" style:color="#2f6bff">{initials}</span><b>{user}</b></div>
	</aside>
	<main class="ui-acs__main">
		{#if collapsed}<button class="ui-acs__icon ui-acs__open" aria-label="Open sidebar" onclick={() => (collapsed = false)}>◫</button>{/if}
		<h2>{greeting}</h2>
		<ChatComposer {onsend} placement="bottom" />
		<div class="ui-acs__actions">{#each actions as a (a)}<button>{a}</button>{/each}</div>
	</main>
</div>

<style>
	.ui-acs {
		display: grid;
		grid-template-columns: 190px 1fr;
		gap: 6px;
		width: 100%;
		max-width: 1008px;
		min-height: 560px;
		padding: 6px;
		background: var(--ag-fill);
		border-radius: 10px;
		box-shadow: 0 0 0 1px var(--ag-line);
		font-size: 11px;
	}
	.ui-acs[data-collapsed] {
		grid-template-columns: 0 1fr;
	}
	.ui-acs[data-collapsed] .ui-acs__side {
		display: none;
	}
	.ui-acs__side {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		min-width: 0;
	}
	.ui-acs__ws {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
	}
	.ui-acs__ws b {
		flex: 1;
		font-weight: 500;
	}
	.ui-acs__logo {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		display: grid;
		place-items: center;
		font-size: 9px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
	}
	.ui-acs__icon {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		border-radius: 6px;
		padding: 2px 5px;
	}
	.ui-acs__search {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		margin: 2px 0 6px;
		border-radius: 7px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		color: var(--ag-subtle);
	}
	.ui-acs__search input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-acs__search kbd {
		font: inherit;
		font-size: 9px;
	}
	.ui-acs__nav {
		display: grid;
		gap: 1px;
	}
	.ui-acs__nav button,
	.ui-acs__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		text-align: left;
		padding: 5px 6px;
		border-radius: 6px;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: background-color 0.15s;
	}
	.ui-acs__nav button:hover,
	.ui-acs__row:hover,
	.ui-acs__nav button[data-active] {
		background: var(--ag-fill);
	}
	.ui-acs__nav button[data-active] {
		font-weight: 500;
	}
	.ui-acs__row i {
		font-style: normal;
		color: var(--ag-subtle);
	}
	.ui-acs__row--sub {
		padding-left: 22px;
	}
	.ui-acs__label {
		margin: 10px 6px 2px;
		color: var(--ag-subtle);
		font-size: 10px;
	}
	.ui-acs__card {
		display: grid;
		gap: 2px;
		padding: 8px;
		margin-top: 8px;
		border-radius: 8px;
	}
	.ui-acs__card b {
		font-weight: 500;
	}
	.ui-acs__card small,
	.ui-acs__card span {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-acs__card small:first-child {
		color: var(--ag-blue);
	}
	.ui-acs__card em {
		color: var(--ag-blue);
		font-style: normal;
	}
	.ui-acs__bar {
		height: 3px;
		border-radius: 2px;
		background: var(--ag-fill);
		overflow: hidden;
		margin-top: 4px;
	}
	.ui-acs__bar i {
		display: block;
		height: 100%;
		background: var(--ag-blue);
	}
	.ui-acs__user {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: auto;
		padding: 8px 4px 2px;
	}
	.ui-acs__user b {
		font-weight: 500;
	}
	.ui-acs__main {
		position: relative;
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 16px;
		padding: 40px 24px;
		background: var(--ag-surface);
		border-radius: 8px;
		box-shadow: var(--ag-shadow);
	}
	.ui-acs__open {
		position: absolute;
		top: 10px;
		left: 10px;
	}
	.ui-acs__main h2 {
		margin: 0;
		font-size: 19px;
		font-weight: 500;
		letter-spacing: -0.02em;
		text-align: center;
	}
	.ui-acs__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px 14px;
		max-width: 470px;
	}
	.ui-acs__actions button {
		border: 0;
		background: none;
		font: inherit;
		font-size: 10.5px;
		color: var(--ag-muted);
		padding: 4px 6px;
		border-radius: 6px;
		cursor: pointer;
	}
	.ui-acs__actions button:hover {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
	@media (width <= 640px) {
		.ui-acs {
			grid-template-columns: 1fr;
		}
		.ui-acs__side {
			display: none;
		}
	}
</style>
