<!-- CRM – a company list with pipelines in the menu, saved views as tabs and an editable table: double-click a cell to edit it, select rows, add a row. -->
<script lang="ts" module>
	export type Company = { name: string; category: string; domain: string; owner: string; value: number; stage: string; last: string; color: string };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import './shell/screen.css';
	const C = (name: string, category: string, owner: string, value: number, stage: string, last: string, color: string): Company => ({ name, category, domain: name.toLowerCase().replace(/\s/g, '') + '.com', owner, value, stage, last, color });
	let {
		companies = $bindable([
			C('Northwind', 'Productivity', 'Mara Klein', 48000, 'Negotiation', 'Today', '#171717'), C('Lumen Labs', 'Planning', 'Jonas Weber', 12500, 'Proposal', 'Yesterday', '#5e6ad2'), C('Brightside', 'Design', 'Mara Klein', 86000, 'Won', 'Mar 6', '#f24e1e'),
			C('Pinecone Pay', 'Payments', 'Lea Braun', 124000, 'Qualified', 'Mar 5', '#635bff'), C('Harbor Goods', 'E-commerce', 'Jonas Weber', 9800, 'New', 'Mar 4', '#7ab55c'), C('Vertex Cloud', 'Developer tools', 'Lea Braun', 62000, 'Proposal', 'Mar 3', '#000000'),
			C('Tablewise', 'Productivity', 'Mara Klein', 37500, 'Qualified', 'Mar 1', '#18bfff'), C('Sprout CRM', 'CRM', 'Tom Fischer', 21000, 'New', 'Feb 27', '#ff7a59'), C('Taskly', 'Planning', 'Tom Fischer', 6400, 'Lost', 'Feb 25', '#7b68ee'), C('Flowsite', 'Design', 'Lea Braun', 18900, 'Negotiation', 'Feb 24', '#146ef5')
		] as Company[])
	}: { companies?: Company[] } = $props();
	let active = $state('companies');
	let view = $state('Company CRM');
	let sel = $state<Set<string>>(new Set());
	let edit = $state<{ row: string; col: keyof Company } | null>(null);
	const nav = [{ items: [{ id: 'home', label: 'Home', icon: '⌂' }, { id: 'companies', label: 'Companies', icon: '▦', count: 284 }, { id: 'contacts', label: 'Contacts', icon: '⚇' }, { id: 'deals', label: 'Deals', icon: '$' }, { id: 'reports', label: 'Reports', icon: '▤' }] }, { label: 'Pipelines', items: [{ id: 'new', label: 'New business', icon: '◎' }, { id: 'renew', label: 'Renewals', icon: '◌' }, { id: 'partners', label: 'Partnerships', icon: '⚇' }] }];
	const tone: Record<string, string> = { Negotiation: 'amber', Proposal: 'purple', Won: 'green', Qualified: 'blue', New: 'gray', Lost: 'red' };
	const cols: [keyof Company, string][] = [['name', 'Company'], ['category', 'Category'], ['domain', 'Domain'], ['owner', 'Owner'], ['value', 'Value'], ['stage', 'Stage'], ['last', 'Last contact']];
	const shown = $derived(view === 'Deals' ? companies.filter((c) => c.value > 30000) : view === 'Renewals' ? companies.filter((c) => c.stage === 'Won') : companies);
	function toggle(n: string) {
		const s = new Set(sel);
		if (s.has(n)) s.delete(n);
		else s.add(n);
		sel = s;
	}
	function commit(row: string, col: keyof Company, v: string) {
		companies = companies.map((c) => (c.name === row ? { ...c, [col]: col === 'value' ? Number(v.replace(/\D/g, '')) || 0 : v } : c));
		edit = null;
	}
	function addRow() {
		const name = `New company ${companies.length + 1}`;
		companies = [...companies, C(name, 'Productivity', 'You', 0, 'New', 'Today', '#9ca3af')];
		edit = { row: name, col: 'name' };
	}
</script>

<AppShell {nav} bind:active>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">▭ Sales / <b>Head of Sales ⌄</b></span><span>☆</span></div>
	<div class="ui-scr__bar ui-crm__views" role="tablist">{#each [['Company CRM', '#ff6a3d'], ['Deals', '#635bff'], ['Contacts', '#06b6d4'], ['Renewals', '#171717']] as [v, c] (v)}<button class="ui-ag-chip" role="tab" aria-selected={view === v} onclick={() => (view = v)}><i style:background={c}></i>{v}</button>{/each}{#if sel.size}<span class="ui-ag-grow"></span><small>{sel.size} selected</small><button class="ui-ag-btn" data-variant="ghost" onclick={() => ((companies = companies.filter((c) => !sel.has(c.name))), (sel = new Set()))}>Delete</button>{/if}</div>
	<table class="ui-crm">
		<thead><tr><th><input type="checkbox" aria-label="Select all" checked={sel.size === shown.length && shown.length > 0} onchange={(e) => (sel = e.currentTarget.checked ? new Set(shown.map((c) => c.name)) : new Set())} /></th>{#each cols as [, l] (l)}<th>{l}</th>{/each}</tr></thead>
		<tbody>
			{#each shown as c (c.name)}
				<tr aria-selected={sel.has(c.name)}>
					<td><input type="checkbox" aria-label="Select {c.name}" checked={sel.has(c.name)} onchange={() => toggle(c.name)} /></td>
					{#each cols as [k] (k)}
						<td ondblclick={() => (edit = { row: c.name, col: k })}>
							{#if edit?.row === c.name && edit.col === k}
								<!-- svelte-ignore a11y_autofocus -->
								<input class="ui-ag-input" value={String(c[k])} aria-label="Edit {k}" autofocus onkeydown={(e) => (e.key === 'Enter' ? commit(c.name, k, e.currentTarget.value) : e.key === 'Escape' && (edit = null))} onblur={(e) => commit(c.name, k, e.currentTarget.value)} />
							{:else if k === 'name'}<span class="ui-crm__co"><i style:background={c.color}>{c.name[0]}</i>{c.name}</span>
							{:else if k === 'category'}<span class="ui-ag-pill" data-tone="gray">{c.category}</span>
							{:else if k === 'domain'}<u>{c.domain}</u>
							{:else if k === 'value'}{c.value.toLocaleString('en-US')}
							{:else if k === 'stage'}<span class="ui-ag-pill" data-tone={tone[c.stage] ?? 'gray'}>{c.stage}</span>
							{:else}{c[k]}{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="ui-ag-row ui-crm__foot"><button class="ui-ag-btn" data-variant="ghost" onclick={addRow}>+ Add row</button><span class="ui-ag-grow"></span><small>Double-click a cell to edit</small></div>
</AppShell>

<style>
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-crm__views i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		display: inline-block;
	}
	.ui-crm__views [aria-selected='false'] {
		box-shadow: none;
		background: none;
		color: var(--ag-muted);
	}
	.ui-crm {
		width: 100%;
		border-collapse: collapse;
		font-size: 10.5px;
	}
	th {
		text-align: left;
		font-weight: 400;
		color: var(--ag-muted);
		padding: 7px 8px;
		border-bottom: 1px solid var(--ag-line);
	}
	td {
		padding: 6px 8px;
		border-bottom: 1px solid var(--ag-line);
		white-space: nowrap;
	}
	tr[aria-selected='true'] td {
		background: color-mix(in srgb, var(--ag-blue) 5%, transparent);
	}
	th:first-child,
	td:first-child {
		width: 20px;
		padding-left: 14px;
	}
	td .ui-ag-input {
		padding: 2px 5px;
		width: 110px;
	}
	.ui-crm__co {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-crm__co i {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		color: #fff;
		font-style: normal;
		font-size: 8px;
		display: grid;
		place-items: center;
	}
	u {
		text-decoration-color: var(--ag-line);
		text-underline-offset: 2px;
	}
	.ui-crm__foot {
		padding: 8px 12px;
	}
</style>
