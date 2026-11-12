<!-- Task Board – a kanban board: drag cards between columns (or use the arrow keys), quick-add a task, search, filter by label, compact mode and a detail panel. -->
<script lang="ts" module>
	export type Card = { id: string; title: string; col: string; meta: string; labels: string[]; prio: 1 | 2 | 3; due?: string; hue: number };
</script>

<script lang="ts">
	import { avatarUrl } from '../illustrations/avatar';
	import '../agents/agents.css';
	const LABEL: Record<string, string> = { Website: '#0ea5e9', Feature: '#7dd3fc', Billing: '#a855f7', Bug: '#ec4899', Mobile: '#10b981' };
	let {
		crumbs = ['Northwind', 'Launch', 'Sprint 12'],
		columns = ['Todo', 'In review', 'In progress', 'Done'],
		cards = $bindable([
			{ id: 'NW-214', title: 'Add the launch banner to the marketing site', col: 'Todo', meta: 'Estimate M · Created Oct 2', labels: ['Website', 'Feature'], prio: 2, hue: 10 },
			{ id: 'NW-209', title: 'Currency rounding in annual invoices', col: 'Todo', meta: 'Created Sep 28', labels: ['Billing', 'Bug'], prio: 3, due: '2d', hue: 200 },
			{ id: 'NW-197', title: 'Follow up with the beta customers about pricing', col: 'Todo', meta: 'Created Sep 24', labels: [], prio: 1, hue: 260 },
			{ id: 'NW-221', title: 'Review the onboarding copy for the new plans', col: 'In review', meta: 'Created Oct 2', labels: ['Website'], prio: 2, due: '1d', hue: 30 },
			{ id: 'NW-205', title: 'Add usage limits to the plan comparison table', col: 'In review', meta: 'Estimate L · Created Sep 27', labels: ['Website', 'Feature'], prio: 3, hue: 140 },
			{ id: 'NW-188', title: 'Push notification opt-in on iOS', col: 'In review', meta: 'Created Sep 21', labels: ['Mobile'], prio: 2, hue: 320 },
			{ id: 'NW-230', title: 'Export guide for the help center', col: 'In progress', meta: 'Created Sep 30', labels: ['Website'], prio: 2, hue: 180 },
			{ id: 'NW-201', title: 'Proration when teams add seats mid-month', col: 'In progress', meta: 'Created Sep 23', labels: ['Billing'], prio: 3, due: '4d', hue: 220 },
			{ id: 'NW-176', title: 'Offline mode for the task list', col: 'In progress', meta: 'Estimate XL · Created Sep 14', labels: ['Mobile', 'Feature'], prio: 2, hue: 50 },
			{ id: 'NW-160', title: 'Dark mode for the dashboard', col: 'Done', meta: 'Created Sep 12', labels: ['Website', 'Feature'], prio: 2, hue: 100 },
			{ id: 'NW-171', title: 'Fix crash when uploading large avatars', col: 'Done', meta: 'Created Sep 15', labels: ['Mobile', 'Bug'], prio: 3, hue: 280 }
		] as Card[])
	}: { crumbs?: string[]; columns?: string[]; cards?: Card[] } = $props();
	let q = $state('');
	let label = $state('');
	let compact = $state(false);
	let dragging = $state<string | null>(null);
	let over = $state<string | null>(null);
	let open = $state<string | null>(null);
	let adding = $state<string | null>(null);
	let draft = $state('');
	let starred = $state(false);
	const shown = $derived(cards.filter((c) => (!label || c.labels.includes(label)) && (c.title + c.id).toLowerCase().includes(q.toLowerCase())));
	const move = (id: string, col: string) => (cards = cards.map((c) => (c.id === id ? { ...c, col } : c)));
	function key(e: KeyboardEvent, c: Card) {
		const i = columns.indexOf(c.col);
		if (e.key === 'ArrowRight' && i < columns.length - 1) (e.preventDefault(), move(c.id, columns[i + 1]));
		else if (e.key === 'ArrowLeft' && i > 0) (e.preventDefault(), move(c.id, columns[i - 1]));
		else if (e.key === 'Enter') open = c.id;
	}
	function add(col: string) {
		if (draft.trim()) cards = [...cards, { id: `NW-${240 + cards.length}`, title: draft.trim(), col, meta: 'Created today', labels: [], prio: 1, hue: 90 }];
		draft = '';
		adding = null;
	}
	const detail = $derived(cards.find((c) => c.id === open));
	const icon: Record<string, string> = { Todo: '○', 'In review': '◉', 'In progress': '◷', Done: '●' };
</script>

<div class="ui-ag ui-ag-panel ui-tb">
	<div class="ui-ag-head">
		<span class="ui-ag-muted">{crumbs.slice(0, -1).join(' / ')} /</span><b>{crumbs[crumbs.length - 1]}</b><button class="ui-ag-btn" data-variant="ghost" aria-pressed={starred} aria-label="Star" onclick={() => (starred = !starred)}>{starred ? '★' : '☆'}</button>
		<span class="ui-ag-grow"></span><small class="ui-ag-muted">{shown.length} tasks</small>
		<input class="ui-ag-input ui-tb__q" placeholder="⌕ Search" aria-label="Search tasks" bind:value={q} />
		<select class="ui-ag-input ui-tb__f" aria-label="Filter by label" bind:value={label}><option value="">☰ Filter</option>{#each Object.keys(LABEL) as l (l)}<option value={l}>{l}</option>{/each}</select>
		<button class="ui-ag-btn" data-variant="ghost" aria-pressed={compact} onclick={() => (compact = !compact)}>▭ Compact</button>
	</div>
	<div class="ui-tb__cols" style:--n={columns.length}>
		{#each columns as col (col)}
			<section class="ui-tb__col" data-over={over === col || undefined} aria-label={col} ondragover={(e) => (e.preventDefault(), (over = col))} ondragleave={() => over === col && (over = null)} ondrop={(e) => (e.preventDefault(), dragging && move(dragging, col), (over = null), (dragging = null))}>
				<header><span>{icon[col] ?? '○'}</span><small>{col}</small><span class="ui-ag-pill" data-tone="gray">{shown.filter((c) => c.col === col).length}</span></header>
				{#each shown.filter((c) => c.col === col) as c (c.id)}
					<div class="ui-ag-card ui-tb__card" role="button" tabindex="0" draggable="true" aria-label="{c.title}, {col}. Arrow keys move it." data-drag={dragging === c.id || undefined} ondragstart={() => (dragging = c.id)} ondragend={() => (dragging = null)} onclick={() => (open = c.id)} onkeydown={(e) => key(e, c)}>
						<b><span class="ui-tb__prio" data-p={c.prio}>▮</span> {c.title}</b>
						{#if !compact}<small>{c.id} · {c.meta}</small><span class="ui-tb__labels">{#each c.labels as l (l)}<span><i style:background={LABEL[l]}></i>{l}</span>{:else}<small>No labels</small>{/each}</span>{/if}
						<span class="ui-ag-row"><small class="ui-ag-grow">{icon[col]} {col}</small>{#if c.due}<span class="ui-ag-pill" data-tone="amber">◷ {c.due}</span>{/if}<img src={avatarUrl(c.id, c.hue)} alt="" /></span>
					</div>
				{/each}
				{#if adding === col}
					<!-- svelte-ignore a11y_autofocus -->
					<input class="ui-ag-input" placeholder="Task title" aria-label="New task in {col}" bind:value={draft} autofocus onkeydown={(e) => (e.key === 'Enter' ? add(col) : e.key === 'Escape' && (adding = null))} onblur={() => add(col)} />
				{:else}<button class="ui-tb__add" onclick={() => (adding = col)}>+ Add task</button>{/if}
			</section>
		{/each}
	</div>
	{#if detail}
		<aside class="ui-tb__detail ui-ag-in" aria-label="Task details">
			<div class="ui-ag-row"><small class="ui-ag-grow">{detail.id}</small><button class="ui-ag-btn" data-variant="ghost" aria-label="Close details" onclick={() => (open = null)}>×</button></div>
			<b>{detail.title}</b>
			<label>Status<select class="ui-ag-input" value={detail.col} onchange={(e) => move(detail.id, e.currentTarget.value)}>{#each columns as c (c)}<option>{c}</option>{/each}</select></label>
			<small>{detail.meta}</small>
			<span class="ui-tb__labels">{#each detail.labels as l (l)}<span><i style:background={LABEL[l]}></i>{l}</span>{/each}</span>
		</aside>
	{/if}
</div>

<style>
	.ui-tb {
		position: relative;
		width: 100%;
		max-width: 780px;
		font-size: 10.5px;
		overflow: hidden;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-tb__q {
		width: 120px;
	}
	.ui-tb__f {
		width: 90px;
	}
	.ui-tb__cols {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		gap: 8px;
		padding: 8px;
	}
	.ui-tb__col {
		background: var(--ag-fill);
		border-radius: 10px;
		padding: 6px;
		display: grid;
		gap: 6px;
		align-content: start;
		min-height: 200px;
		transition: box-shadow 0.15s;
	}
	.ui-tb__col[data-over] {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 45%, transparent);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2px 4px 4px;
	}
	header small {
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 9px;
	}
	.ui-tb__card {
		padding: 8px 9px;
		display: grid;
		gap: 5px;
		cursor: grab;
	}
	.ui-tb__card:focus-visible {
		outline: 2px solid var(--ag-blue);
	}
	.ui-tb__card[data-drag] {
		opacity: 0.5;
	}
	.ui-tb__prio {
		font-size: 8px;
		color: var(--ag-subtle);
	}
	.ui-tb__prio[data-p='3'] {
		color: var(--ag-red);
	}
	.ui-tb__prio[data-p='2'] {
		color: var(--ag-amber);
	}
	.ui-tb__labels {
		display: flex;
		gap: 8px;
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-tb__labels i {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-right: 3px;
	}
	img {
		width: 16px;
		height: 16px;
		border-radius: 50%;
	}
	.ui-tb__add {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		text-align: left;
		padding: 4px;
		cursor: pointer;
	}
	.ui-tb__detail {
		position: absolute;
		right: 8px;
		top: 50px;
		bottom: 8px;
		width: 220px;
		background: var(--ag-surface);
		border-radius: 12px;
		box-shadow:
			var(--ag-shadow),
			0 16px 30px -12px rgba(0, 0, 0, 0.25);
		padding: 12px;
		display: grid;
		gap: 10px;
		align-content: start;
	}
	.ui-tb__detail b {
		font-size: 13px;
	}
	.ui-tb__detail label {
		display: grid;
		gap: 4px;
		color: var(--ag-muted);
	}
</style>
