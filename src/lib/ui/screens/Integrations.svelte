<!-- Integrations – the app directory as a full page: a sticky header with All / Connected / Available, search, request an app, and services by category with connect toggles. -->
<script lang="ts" module>
	export type Service = { name: string; blurb: string; color: string; group: string; connected?: boolean };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	const S = (name: string, group: string, color: string, blurb: string, connected = false): Service => ({ name, group, color, blurb, connected });
	let {
		services = $bindable([
			S('Chat', 'Popular', '#4a154b', 'Get alerts in your channels and act on them without leaving the conversation.', true),
			S('Notes', 'Popular', '#171717', 'Turn records into pages and keep project docs in sync both ways.'),
			S('Tracker', 'Popular', '#5e6ad2', 'Create issues from customer feedback and track them to release.'),
			S('Canvas', 'Popular', '#f24e1e', 'Preview designs inline and link frames to the work they belong to.'),
			S('Repo', 'Popular', '#24292f', 'Link pull requests and see deploy status next to every task.'),
			S('CRM', 'Popular', '#ff7a59', 'Keep contacts, companies and deals matched across both tools.'),
			S('Drive', 'Workspace suite', '#0f9d58', 'Pick files from your drive and preview them without downloading.'),
			S('Calendar', 'Workspace suite', '#1a73e8', 'See upcoming meetings with every contact in one timeline.'),
			S('Metrics', 'Workspace suite', '#f9ab00', 'Attribute signups to the campaigns and pages that brought them.'),
			S('Meet', 'Communication', '#2d8cff', 'Start meetings from any record and save the recording link.'),
			S('Community', 'Communication', '#5865f2', 'Post updates to community channels when something ships.'),
			S('Support desk', 'Communication', '#1f8ded', 'See conversations next to the customer and reply from one place.'),
			S('Scheduler', 'Communication', '#006bff', 'Log booked meetings and the answers people gave when booking.')
		] as Service[])
	}: { services?: Service[] } = $props();
	let active = $state('apps');
	let tab = $state('All');
	let q = $state('');
	const shown = $derived(services.filter((s) => (tab === 'All' || (tab === 'Connected') === !!s.connected) && (s.name + s.blurb).toLowerCase().includes(q.toLowerCase())));
	const groups = $derived([...new Set(shown.map((s) => s.group))]);
	const toggle = (n: string) => (services = services.map((s) => (s.name === n ? { ...s, connected: !s.connected } : s)));
</script>

<AppShell nav={[CHAT_NAV[0], CHAT_NAV[2]]} bind:active>
	<div class="ui-scr ui-int">
		<h1>Integrations</h1>
		<p class="ui-scr__sub">Connect the tools your team already uses and work with them right in the chat.</p>
		<div class="ui-ag-row ui-int__bar"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['All', 'Connected', 'Available'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{t}</button>{/each}</div><input class="ui-ag-input" placeholder="⌕ Search integrations" aria-label="Search integrations" bind:value={q} /><button class="ui-ag-btn" data-variant="primary">+ Request</button></div>
		{#each groups as g (g)}
			<h2>{g}</h2>
			<div class="ui-int__grid">{#each shown.filter((s) => s.group === g) as s (s.name)}<div class="ui-int__item"><i style:background={s.color}>{s.name[0]}</i><span><b>{s.name}</b><small>{s.blurb}</small></span><button class="ui-int__tog" aria-pressed={!!s.connected} aria-label="{s.connected ? 'Disconnect' : 'Connect'} {s.name}" onclick={() => toggle(s.name)}>{s.connected ? '✓' : '+'}</button></div>{/each}</div>
		{:else}<div class="ui-scr__empty"><b>No integrations match</b><span>Try another word, or request the app you need.</span></div>{/each}
	</div>
</AppShell>

<style>
	.ui-int {
		max-width: 640px;
		margin: 0 auto;
		padding-top: 28px;
	}
	.ui-int__bar {
		position: sticky;
		top: 0;
		background: var(--ag-surface);
		padding: 8px 0;
		z-index: 1;
	}
	.ui-int__bar .ui-ag-input {
		width: 160px;
	}
	.ui-int__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px 24px;
	}
	.ui-int__item {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.ui-int__item span {
		flex: 1;
		min-width: 0;
		display: grid;
	}
	.ui-int__item small {
		color: var(--ag-muted);
		font-size: 10px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	b {
		font-weight: 500;
	}
	i {
		width: 20px;
		height: 20px;
		border-radius: 5px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 10px;
		font-weight: 600;
		flex: none;
	}
	.ui-int__tog {
		width: 20px;
		height: 20px;
		border-radius: 6px;
		border: 0;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		color: var(--ag-muted);
		cursor: pointer;
	}
	.ui-int__tog[aria-pressed='true'] {
		background: var(--ag-ink);
		color: var(--ag-surface);
	}
</style>
