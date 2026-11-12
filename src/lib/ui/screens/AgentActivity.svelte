<!-- Agent / Activity – what your agent did: every step as a sentence with its app, who OK'd it, and Undo while it still can; open one to see when, why it could and how to take it back. -->
<script lang="ts" module>
	export type Act = { id: number; time: string; day: 'Today' | 'Yesterday'; text: string; app: string; color: string; how: 'own' | 'approved'; task: string; state: 'undo' | 'final' | 'undone' };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	const A = (id: number, day: Act['day'], time: string, text: string, app: string, color: string, how: Act['how'], task: string, state: Act['state'] = 'undo'): Act => ({ id, day, time, text, app, color, how, task, state });
	let {
		acts = $bindable([
			A(1, 'Today', '10:16', 'Sent the weekly update to Priya Shah', 'Mail', '#ea4335', 'approved', 'Weekly update'), A(2, 'Today', '09:50', 'Refunded 38 € to Hannah Kim', 'Payments', '#635bff', 'own', 'Billing webhooks', 'final'),
			A(3, 'Today', '09:24', 'Posted the staging link in #platform', 'Chat', '#4a154b', 'own', 'Billing webhooks'), A(4, 'Today', '08:53', 'Opened pull request #482 – Retry failed billing webhooks', 'Repo', '#24292f', 'own', 'Billing webhooks'),
			A(5, 'Today', '07:28', 'Booked a review call with Tom Becker for Thursday 10:30', 'Calendar', '#1a73e8', 'approved', 'Onboarding emails'), A(6, 'Today', '06:28', 'Created “Northwind – ingest design” in Clients', 'Drive', '#0f9d58', 'own', 'Ingest pipeline'),
			A(7, 'Yesterday', '08:28', 'Merged #479 – Move our apps to API v2', 'Repo', '#24292f', 'approved', 'API migration', 'final'), A(8, 'Yesterday', '05:28', 'Sent an invoice reminder to Lumen Studio', 'Mail', '#ea4335', 'approved', 'Billing webhooks', 'undone'),
			A(9, 'Yesterday', '03:28', 'Asked Tom Becker for the staging keys', 'Chat', '#4a154b', 'approved', 'Billing webhooks', 'final')
		] as Act[])
	}: { acts?: Act[] } = $props();
	let active = $state('activity');
	let filter = $state<'all' | 'own' | 'approved' | 'undone'>('all');
	let q = $state('');
	let sel = $state(1);
	const shown = $derived(acts.filter((a) => (filter === 'all' || (filter === 'undone' ? a.state === 'undone' : a.how === filter)) && a.text.toLowerCase().includes(q.toLowerCase())));
	const cur = $derived(acts.find((a) => a.id === sel));
	const undo = (id: number) => (acts = acts.map((a) => (a.id === id ? { ...a, state: 'undone' } : a)));
	const cnt = { all: () => acts.length, own: () => acts.filter((a) => a.how === 'own').length, approved: () => acts.filter((a) => a.how === 'approved').length, undone: () => acts.filter((a) => a.state === 'undone').length };
</script>

{#snippet detail()}
	{#if cur}
		<div class="ui-scr__tabs"><span class="ui-scr__tab">▤ {cur.text.slice(0, 18)}…</span></div>
		<div class="ui-scr__panel">
			<div class="ui-ag-row"><i class="ui-act__ic" style:background={cur.color}>{cur.app[0]}</i><span><b>{cur.text}</b><small>{cur.app}</small></span></div>
			<dl class="ui-scr__kv"><dt>When</dt><dd>{cur.day} {cur.time}</dd><dt>Task</dt><dd>{cur.task} ›</dd><dt>Cost</dt><dd>€0.04</dd></dl>
			<small class="ui-scr__k">Why it could</small>
			<div class="ui-ag-card ui-act__why"><span><span style:color="var(--ag-amber)">●</span> {cur.how === 'own' ? 'Allowed on its own' : 'You approved'}</span><small>{cur.how === 'own' ? 'Your permissions let it do this without asking' : 'You approved it 14 minutes ago'}</small></div>
			<small class="ui-scr__k">Taking it back</small>
			<div class="ui-ag-card ui-act__why">{#if cur.state === 'undo'}<div class="ui-ag-row"><span class="ui-ag-grow">Takes it back where it can<small>Possible for 18 more minutes</small></span><button class="ui-ag-btn" data-variant="primary" onclick={() => undo(cur.id)}>↶ Undo</button></div>{:else if cur.state === 'undone'}<span>↶ Undone</span>{:else}<span>◎ Final – this can't be taken back</span>{/if}</div>
		</div>
	{/if}
{/snippet}

<AppShell workspace="Fieldwork" nav={AGENT_NAV} bind:active cards={false} aside={detail} asideWidth={240}>
	<div class="ui-scr__bar"><b>Activity</b><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each [['all', 'All'], ['own', 'On its own'], ['approved', 'You approved'], ['undone', 'Undone']] as [k, l] (k)}<button class="ui-ag-tab" role="tab" aria-selected={filter === k} onclick={() => (filter = k as typeof filter)}>{l} <span class="ui-ag-muted">{cnt[k as keyof typeof cnt]()}</span></button>{/each}</div><input class="ui-ag-input ui-act__q" placeholder="⌕ Search activity" aria-label="Search activity" bind:value={q} /></div>
	<div class="ui-act">
		{#each ['Today', 'Yesterday'] as d (d)}
			{@const rows = shown.filter((a) => a.day === d)}
			{#if rows.length}
				<div class="ui-act__day">{d} <small>{rows.length}</small></div>
				{#each rows as a (a.id)}
					<div class="ui-act__row" role="button" tabindex="0" aria-current={sel === a.id || undefined} data-undone={a.state === 'undone' || undefined} onclick={() => (sel = a.id)} onkeydown={(e) => e.key === 'Enter' && (sel = a.id)}>
						<small class="ui-act__t">{a.time}</small><i class="ui-act__ic" style:background={a.color}>{a.app[0]}</i>
						<span class="ui-ag-grow"><span class="ui-act__txt">{a.text}</span><small><span style:color={a.how === 'own' ? 'var(--ag-blue)' : 'var(--ag-amber)'}>●</span> {a.how === 'own' ? 'On its own' : 'You approved'} · {a.task}</small></span>
						{#if a.state === 'undo'}<button class="ui-ag-btn" onclick={(e) => (e.stopPropagation(), undo(a.id))}>↶ Undo</button>{:else if a.state === 'undone'}<span class="ui-ag-pill" data-tone="gray">Undone</span>{:else}<small>◎ Final</small>{/if}
					</div>
				{/each}
			{/if}
		{:else}<div class="ui-scr__empty"><b>Nothing here</b></div>{/each}
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-act__q {
		width: 140px;
	}
	.ui-act {
		padding: 8px;
		display: grid;
		gap: 2px;
	}
	.ui-act__day {
		margin-top: 6px;
		padding: 5px 8px;
		border-radius: 7px;
		background: var(--ag-fill);
		font-weight: 500;
	}
	.ui-act__row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-act__row[aria-current] {
		background: var(--ag-fill);
	}
	.ui-act__row .ui-ag-grow {
		display: grid;
	}
	.ui-act__row[data-undone] .ui-act__txt {
		text-decoration: line-through;
		color: var(--ag-muted);
	}
	.ui-act__t {
		width: 30px;
	}
	.ui-act__ic {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 9px;
		font-weight: 600;
		flex: none;
	}
	.ui-act__why {
		padding: 8px 10px;
		display: grid;
		gap: 3px;
	}
	.ui-act__why .ui-ag-grow small {
		display: block;
	}
</style>
