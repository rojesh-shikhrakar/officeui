<!-- Kanban Board – issues on a board by priority: drag cards between columns, switch to a list, filter by state and add a task. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import TaskBoard, { type Card } from '../blocks/TaskBoard.svelte';
	import './shell/screen.css';
	const K = (id: string, title: string, col: string, meta: string, prio: 1 | 2 | 3, hue: number): Card => ({ id, title, col, meta, labels: [], prio, hue });
	let {
		cards = $bindable([
			K('IS-12', 'Reset password flow issue', 'Low priority', 'Users who signed up with a social login later added a password', 1, 10),
			K('IS-15', 'Avatar upload ignores crop', 'Low priority', 'The cropped area is shown in the editor, but the full image is saved', 1, 200),
			K('IS-18', 'Export settings to CSV', 'Low priority', 'Admins want to download the workspace settings', 1, 260),
			K('IS-21', 'Session tokens expire too early', 'Medium priority', 'Sessions end after 20 minutes instead of 24 hours', 2, 30),
			K('IS-22', 'Broken password reset link', 'Medium priority', 'Reset emails go out, but the link opens a 404 page', 2, 140),
			K('IS-24', 'Slow dashboard load', 'Medium priority', 'The analytics dashboard takes 6–8 seconds to render', 2, 320),
			K('IS-30', 'Checkout fails on one browser', 'High priority', "Customers on an older browser can't complete a purchase", 3, 180),
			K('IS-31', 'Video calls drop after 10 minutes', 'High priority', 'Calls with more than four people end without a warning', 3, 220),
			K('IS-33', 'Webhook retries pile up', 'High priority', 'Failed deliveries retry every second instead of backing off', 3, 50),
			K('IS-08', 'Live updates disconnect', 'Completed', 'Live updates stopped after the connection idled for a minute', 2, 100),
			K('IS-09', 'Mobile app crash on login', 'Completed', 'Order creation failed now and then', 3, 280)
		] as Card[])
	}: { cards?: Card[] } = $props();
	let active = $state('board');
	let tab = $state('All tasks');
	let mode = $state<'Board' | 'List'>('Board');
	const nav = [{ items: [{ id: 'inbox', label: 'Inbox', icon: '▤', count: 3 }, { id: 'activity', label: 'Activity', icon: '◷', count: 2 }, { id: 'mine', label: 'My issues', icon: '◍' }, { id: 'board', label: 'Board', icon: '▦' }, { id: 'projects', label: 'Projects', icon: '▭' }] }, { label: 'Problems', items: [{ id: 'p1', label: 'Password reset emails failing', icon: '▭' }, { id: 'p2', label: 'Payments failing for some users', icon: '▭' }, { id: 'p3', label: 'Dashboard loads slowly', icon: '⚙' }] }];
	const columns = ['Low priority', 'Medium priority', 'High priority', 'Completed'];
	const open = $derived(cards.filter((c) => c.col !== 'Completed').length);
</script>

<AppShell {nav} bind:active>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">Inbox / <b>Overview</b> ☆</span><span class="ui-ag-grow"></span><div class="ui-ag-tabs">{#each ['Board', 'List'] as m (m)}<button class="ui-ag-tab" aria-pressed={mode === m} onclick={() => (mode = m as 'Board' | 'List')}>{m}</button>{/each}</div></div>
	<div class="ui-scr__bar"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each [['All tasks', cards.length], ['Open', open], ['Completed', cards.length - open]] as [t, n] (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = String(t))}>{t} <span class="ui-ag-muted">{n}</span></button>{/each}</div></div>
	{#if mode === 'Board'}
		<div class="ui-kb"><TaskBoard crumbs={['Issues', 'Overview']} columns={tab === 'Open' ? columns.slice(0, 3) : tab === 'Completed' ? ['Completed'] : columns} bind:cards /></div>
	{:else}
		<table class="ui-kb__list"><thead><tr><th>Issue</th><th>Title</th><th>Priority</th></tr></thead><tbody>{#each cards.filter((c) => tab === 'All tasks' || (tab === 'Open') === (c.col !== 'Completed')) as c (c.id)}<tr><td>{c.id}</td><td>{c.title}</td><td><span class="ui-ag-pill" data-tone={c.col === 'Completed' ? 'green' : c.prio === 3 ? 'red' : c.prio === 2 ? 'amber' : 'gray'}>{c.col}</span></td></tr>{/each}</tbody></table>
	{/if}
</AppShell>

<style>
	.ui-kb :global(.ui-tb) {
		max-width: none;
		box-shadow: none;
		border-radius: 0;
	}
	.ui-kb__list {
		width: 100%;
		border-collapse: collapse;
	}
	.ui-kb__list th {
		text-align: left;
		font-weight: 400;
		color: var(--ag-muted);
		padding: 7px 12px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-kb__list td {
		padding: 7px 12px;
		border-bottom: 1px solid var(--ag-line);
	}
</style>
