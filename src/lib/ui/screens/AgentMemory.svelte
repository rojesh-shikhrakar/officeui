<!-- Agent / Memory – what your agent knows about you and your work, grouped by where it applies; open one to see where it came from and where it was used, then keep, change or forget it. -->
<script lang="ts" module>
	export type Fact = { id: number; text: string; scope: string; source: string; uses: number; age: string; review?: boolean };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	let {
		facts = $bindable([
			{ id: 1, text: 'Lead with the decision, then the reasons – three lines or fewer', scope: 'About you', source: 'Thread', uses: 34, age: '26m' },
			{ id: 2, text: 'Works from Vienna – times in CET, nothing booked before 9:00', scope: 'About you', source: 'You', uses: 12, age: '5h' },
			{ id: 3, text: 'Nothing goes out to clients on a Friday afternoon', scope: 'About you', source: 'Decision', uses: 6, age: '2d' },
			{ id: 4, text: 'Prices in euros with the sign after the number: 1 240 €', scope: 'About you', source: 'writing-style.md', uses: 9, age: '1d' },
			{ id: 5, text: 'Writes in British English – colour, organise, analyse', scope: 'About you', source: 'You', uses: 21, age: '1h' },
			{ id: 6, text: "Priya signs off on anything that reaches Northwind's customers", scope: 'Northwind', source: 'Thread', uses: 8, age: '42m' },
			{ id: 7, text: 'Order events are JSON with a version field', scope: 'Northwind', source: 'Decision', uses: 5, age: '4h', review: true },
			{ id: 8, text: 'Their team opens the dashboard at 8:30 – the numbers are ready by 8:00', scope: 'Northwind', source: 'Thread', uses: 3, age: '3d' },
			{ id: 9, text: 'Staging gets a deploy only once every test passes', scope: 'Platform', source: 'You', uses: 14, age: '6m' },
			{ id: 10, text: 'Two clients still call API v1 – write to them before anything changes', scope: 'Platform', source: 'v1-traffic.csv', uses: 2, age: '3h', review: true },
			{ id: 11, text: 'Scores show one decimal – 87.4, never 87.38', scope: 'Evalkit', source: 'Decision', uses: 4, age: '2d' }
		] as Fact[])
	}: { facts?: Fact[] } = $props();
	let active = $state('memory');
	let tab = $state<'Saved' | 'To review'>('Saved');
	let q = $state('');
	let sel = $state(3);
	let draft = $state('');
	const shown = $derived(facts.filter((f) => (tab === 'Saved' ? !f.review : f.review) && f.text.toLowerCase().includes(q.toLowerCase())));
	const scopes = $derived([...new Set(shown.map((f) => f.scope))]);
	const cur = $derived(facts.find((f) => f.id === sel));
	const nav = [{ items: AGENT_NAV[0].items }, { label: 'Workspace', items: [AGENT_NAV[1].items[4]] }];
	function remember() {
		if (!draft.trim()) return;
		facts = [{ id: Date.now(), text: draft.trim(), scope: 'About you', source: 'You', uses: 0, age: 'now' }, ...facts];
		draft = '';
	}
</script>

{#snippet detail()}
	{#if cur}
		<div class="ui-scr__tabs"><span class="ui-scr__tab">◍ {cur.text.slice(0, 18)}…</span></div>
		<div class="ui-scr__panel">
			<b>{cur.text}</b>
			<dl class="ui-scr__kv"><dt>Applies to</dt><dd>◎ {cur.scope === 'About you' ? 'Everywhere' : cur.scope}</dd><dt>Learned</dt><dd>From a {cur.source.toLowerCase()} · {cur.age} ago</dd><dt>Used</dt><dd>{cur.uses} times</dd></dl>
			<small class="ui-scr__k">Where it came from</small>
			<div class="ui-ag-card ui-mem2__src"><small>Send the weekly update to Northwind now?</small><b>Not on a Friday afternoon – Monday at 9:00.</b><small>You, in the Inbox</small></div>
			{#if cur.review}<div class="ui-ag-row"><button class="ui-ag-btn" data-variant="primary" onclick={() => (facts = facts.map((f) => (f.id === cur.id ? { ...f, review: false } : f)))}>Keep</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => (facts = facts.filter((f) => f.id !== cur.id))}>Discard</button></div>{/if}
			<button class="ui-ag-btn" data-variant="ghost" onclick={() => ((facts = facts.filter((f) => f.id !== cur.id)), (sel = facts[0]?.id ?? 0))}>🗑 Forget</button>
		</div>
	{/if}
{/snippet}

<AppShell workspace="Fieldwork" {nav} bind:active cards={false} aside={detail} asideWidth={230}>
	<div class="ui-scr__bar"><b>Memory <small>{facts.length}</small></b><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each [['Saved', facts.filter((f) => !f.review).length], ['To review', facts.filter((f) => f.review).length]] as [t, n] (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t as typeof tab)}>{t} {#if t === 'To review'}<span class="ui-ag-pill" data-tone="amber">{n}</span>{/if}</button>{/each}</div><input class="ui-ag-input ui-mem2__q" placeholder="⌕ Search memory" aria-label="Search memory" bind:value={q} /></div>
	<div class="ui-mem2">
		<div class="ui-ag-row"><input class="ui-ag-input ui-ag-grow" placeholder="Something to remember…" aria-label="Remember something" bind:value={draft} onkeydown={(e) => e.key === 'Enter' && remember()} /><button class="ui-ag-btn" onclick={remember}>+ Remember</button></div>
		{#each scopes as s (s)}
			<div class="ui-mem2__h">{s === 'About you' ? '◍' : '▭'} {s} <small>{shown.filter((f) => f.scope === s).length}</small></div>
			{#each shown.filter((f) => f.scope === s) as f (f.id)}<button class="ui-mem2__row" aria-current={sel === f.id || undefined} onclick={() => (sel = f.id)}><span class="ui-ag-grow">{f.text}</span><small>{f.source}</small><small>{f.uses}×</small><small>{f.age}</small></button>{/each}
		{:else}<div class="ui-scr__empty"><b>Nothing to review</b></div>{/each}
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
	.ui-mem2__q {
		width: 150px;
	}
	.ui-mem2 {
		padding: 8px;
		display: grid;
		gap: 1px;
	}
	.ui-mem2__h {
		margin-top: 8px;
		padding: 6px 8px;
		border-radius: 7px;
		background: var(--ag-fill);
		font-weight: 500;
	}
	.ui-mem2__row {
		display: flex;
		align-items: center;
		gap: 12px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 7px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-mem2__row[aria-current] {
		background: var(--ag-fill);
	}
	.ui-mem2__row small:last-child {
		width: 24px;
		text-align: right;
	}
	.ui-mem2__src {
		padding: 8px 10px;
		display: grid;
		gap: 3px;
	}
</style>
