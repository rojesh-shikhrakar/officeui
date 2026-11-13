<!-- Client Context – a client workspace: live numbers with trends, tabs, a composer to add context (@ mentions reports) and a shared timeline of what changed. -->
<script lang="ts" module>
	export type Client = { name: string; legal: string; meta: string; color: string; kpis: { label: string; value: string; trend: number[] }[] };
	export type Event = { who: string; hue: number; verb: string; text?: string; refs?: string[]; when: string; icon?: string };
</script>

<script lang="ts">
	import { series } from '../utils/chart';
	import { avatarUrl } from '../utils/avatar';
	import Sparkline from './Sparkline.svelte';
	import '../agents/agents.css';
	let {
		clients = [
			{ name: 'Northwind Logistics', legal: 'Northwind Logistics GmbH', meta: 'EUR · Fiscal year ends Dec 31', color: '#0a84ff', kpis: [{ label: 'MRR', value: '€48.2k', trend: series(12, 3, 10, 4) }, { label: 'Cash', value: '€612k', trend: series(12, 8, 12, 5) }, { label: 'Gross margin', value: '64.1%', trend: series(12, 5, 8, 6) }, { label: 'Net burn', value: '€36.0k', trend: series(12, 2, 12, 5) }] },
			{ name: 'Harbor Health', legal: 'Harbor Health Ltd', meta: 'GBP · Fiscal year ends Mar 31', color: '#10b981', kpis: [{ label: 'MRR', value: '£21.7k', trend: series(12, 13, 10, 4) }, { label: 'Cash', value: '£284k', trend: series(12, 4, 12, 5) }, { label: 'Gross margin', value: '71.3%', trend: series(12, 9, 8, 6) }, { label: 'Net burn', value: '£18.4k', trend: series(12, 6, 12, 5) }] }
		] as Client[],
		events = $bindable([
			{ who: 'Lena Hart', hue: 20, verb: 'added context', text: 'CFO wants every figure in the @Monthly P&L in EUR, also for the Danish entity – no converted totals.', when: 'today', icon: '▭' },
			{ who: 'Jonas Weber', hue: 210, verb: 'generated', refs: ['Monthly P&L'], when: '1d ago', icon: '▦' },
			{ who: 'Jonas Weber', hue: 210, verb: 'added', refs: ['budget-2027.pdf', 'fleet-costs-Q3.xlsx'], when: '2d ago', icon: '▢' },
			{ who: 'Lena Hart', hue: 20, verb: 'added context', text: "Renewal talks start in November. They'll ask for a lower rate if the Nordics pilot slips – keep the @Cash runway current.", when: '4d ago', icon: '▭' },
			{ who: 'Payments', hue: 260, verb: 'connected', when: '1w ago', icon: 'S' }
		] as Event[])
	}: { clients?: Client[]; events?: Event[] } = $props();
	let ci = $state(0);
	let tab = $state('Context');
	let draft = $state('');
	let q = $state('');
	let synced = $state(3);
	const c = $derived(clients[ci]);
	const shown = $derived(events.filter((e) => (e.who + e.verb + (e.text ?? '') + (e.refs ?? []).join()).toLowerCase().includes(q.toLowerCase())));
	function add() {
		if (!draft.trim()) return;
		events = [{ who: 'You', hue: 140, verb: 'added context', text: draft.trim(), when: 'just now', icon: '▭' }, ...events];
		draft = '';
	}
	const parts = (t: string) => t.split(/(@[A-Z][\w&]*(?: [A-Z&][\w&]*)*)/);
</script>

<div class="ui-ag ui-ctx">
	<div class="ui-ag-row">
		<i class="ui-ctx__logo" style:background={c.color}>{c.name[0]}</i>
		<span class="ui-ag-grow"><h3>{c.name}</h3><small>{c.legal} · {c.meta}</small></span>
		<button class="ui-ag-chip" onclick={() => (synced = 0)}><span class="ui-ag-dot" style:background="var(--ag-subtle)"></span>Synced {synced ? `${synced}m ago` : 'just now'} ⟳</button>
		<button class="ui-ag-chip" onclick={() => (ci = (ci + 1) % clients.length)}>Switch client ⇅</button>
	</div>
	<div class="ui-ctx__kpis">{#each c.kpis as k (k.label)}<div class="ui-ag-card"><small>{k.label}</small><span><b>{k.value}</b><Sparkline values={k.trend} width={46} height={18} /></span></div>{/each}</div>
	<div class="ui-ag-panel">
		<div class="ui-ag-row ui-ctx__bar"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['Context', 'Reports', 'Financials', 'Settings'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{t}</button>{/each}</div><input class="ui-ag-input" placeholder="⌕  Search" aria-label="Search context" bind:value={q} /></div>
		{#if tab === 'Context'}
			<div class="ui-ctx__compose"><img src={avatarUrl('You', 140)} alt="" /><div class="ui-ag-card"><textarea bind:value={draft} rows="2" placeholder="Add a goal, request or decision – type @ to mention a report" aria-label="Add context" onkeydown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && add()}></textarea><div class="ui-ag-row"><span class="ui-ag-grow">📎</span><span class="ui-ag-kbd">⌘ Enter</span><button class="ui-ag-btn" data-variant="primary" disabled={!draft.trim()} onclick={add}>Add context</button></div></div></div>
			<ol class="ui-ctx__feed">
				{#each shown as e, i (e.who + e.when + i)}
					<li class="ui-ag-in"><span class="ui-ctx__ic">{e.icon}</span><div><span><img src={avatarUrl(e.who, e.hue)} alt="" /><b>{e.who}</b> {e.verb} {#each e.refs ?? [] as r, j (r)}{#if j}and {/if}<u>{r}</u> {/each}<small>{e.when}</small></span>{#if e.text}<p>{#each parts(e.text) as p, j (j)}{#if p.startsWith('@')}<span class="ui-ctx__ref">▢ {p.slice(1)}</span>{:else}{p}{/if}{/each}</p>{/if}</div></li>
				{/each}
			</ol>
		{:else}
			<p class="ui-ag-muted ui-ctx__empty">{tab} for {c.name} live here.</p>
		{/if}
	</div>
</div>

<style>
	.ui-ctx {
		width: 100%;
		max-width: 640px;
		display: grid;
		gap: 12px;
		font-size: 11.5px;
	}
	h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-ctx__logo {
		width: 26px;
		height: 26px;
		border-radius: 7px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-weight: 600;
	}
	.ui-ctx__kpis {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.ui-ctx__kpis .ui-ag-card {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
	}
	.ui-ctx__kpis span {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.ui-ctx__kpis b {
		font-size: 16px;
		font-weight: 500;
	}
	.ui-ctx__bar {
		padding: 8px 10px;
	}
	.ui-ctx__bar .ui-ag-input {
		width: 150px;
	}
	.ui-ctx__compose {
		display: grid;
		grid-template-columns: 22px 1fr;
		gap: 10px;
		padding: 4px 12px 12px;
	}
	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		vertical-align: -5px;
		margin-right: 5px;
	}
	.ui-ctx__compose > img {
		width: 22px;
		height: 22px;
	}
	.ui-ctx__compose .ui-ag-card {
		padding: 8px 10px;
		display: grid;
		gap: 6px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
	}
	textarea {
		border: 0;
		outline: none;
		resize: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-ctx__feed {
		list-style: none;
		margin: 0;
		padding: 0 12px 12px;
		display: grid;
		gap: 16px;
	}
	.ui-ctx__feed li {
		display: grid;
		grid-template-columns: 22px 1fr;
		gap: 10px;
	}
	.ui-ctx__ic {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--ag-fill);
		display: grid;
		place-items: center;
		font-size: 9px;
		color: var(--ag-muted);
	}
	.ui-ctx__feed b {
		font-weight: 500;
	}
	.ui-ctx__feed small {
		margin-left: 4px;
	}
	u {
		text-underline-offset: 2px;
	}
	p {
		margin: 4px 0 0;
		line-height: 1.6;
	}
	.ui-ctx__ref {
		color: var(--ag-blue);
		background: color-mix(in srgb, var(--ag-blue) 8%, transparent);
		border-radius: 4px;
		padding: 1px 5px;
	}
	.ui-ctx__empty {
		padding: 24px 12px;
		margin: 0;
	}
</style>
