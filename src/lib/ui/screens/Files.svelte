<!-- Folders / Overview – folders and file templates: tabs, search, sort, a grid/list toggle, create a folder and add a template. -->
<script lang="ts" module>
	export type Folder = { name: string; shared: boolean; files: number };
	export type Template = { name: string; kind: 'PDF' | 'DOC' | 'XLS'; owner: string; shared: boolean; mine: boolean };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import FileIcon from './FileIcon.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let {
		folders = $bindable([{ name: 'Brand assets', shared: true, files: 3 }, { name: 'Hiring', shared: false, files: 4 }, { name: 'Q3 Campaign', shared: true, files: 5 }, { name: 'Research', shared: false, files: 2 }] as Folder[]),
		templates = [{ name: 'Brand-Guidelines', kind: 'PDF', owner: 'Jonas Weber', shared: true, mine: false }, { name: 'Campaign-Budget', kind: 'XLS', owner: 'Jonas Weber', shared: true, mine: false }, { name: 'Design-Book', kind: 'DOC', owner: 'Alex Morgan', shared: false, mine: true }, { name: 'Weekly-Report', kind: 'XLS', owner: 'Alex Morgan', shared: false, mine: true }] as Template[],
		onopen
	}: { folders?: Folder[]; templates?: Template[]; onopen?: (name: string) => void } = $props();
	let active = $state('folders');
	let ftab = $state('All');
	let ttab = $state('All');
	let fq = $state('');
	let tq = $state('');
	let view = $state<'grid' | 'list'>('grid');
	let asc = $state(true);
	const kinds = { PDF: 'PDF', DOC: 'Document', XLS: 'Spreadsheet' };
	const shownF = $derived(folders.filter((f) => (ftab === 'All' || (ftab === 'Shared') === f.shared) && f.name.toLowerCase().includes(fq.toLowerCase())).sort((a, b) => (asc ? 1 : -1) * a.name.localeCompare(b.name)));
	const shownT = $derived(templates.filter((t) => (ttab === 'All' || (ttab === 'Mine' ? t.mine : !t.mine)) && t.name.toLowerCase().includes(tq.toLowerCase())));
	function create() {
		let n = 1;
		while (folders.some((f) => f.name === `New folder ${n}`)) n++;
		folders = [...folders, { name: `New folder ${n}`, shared: false, files: 0 }];
	}
</script>

<AppShell nav={[CHAT_NAV[0], CHAT_NAV[2]]} bind:active>
	<div class="ui-scr ui-fil">
		<h1>Files</h1>
		<p class="ui-scr__sub">See files you recently used in chats and manage files saved in folders. <a href="#more" onclick={(e) => e.preventDefault()}>Learn more</a></p>
		<small class="ui-scr__k">Folders {folders.length}</small>
		<div class="ui-ag-row"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['All', 'Shared', 'Private'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={ftab === t} onclick={() => (ftab = t)}>{t}</button>{/each}</div><button class="ui-ag-btn" aria-label="Sort by name" onclick={() => (asc = !asc)}>⇅</button><div class="ui-ag-tabs"><button class="ui-ag-tab" aria-pressed={view === 'grid'} aria-label="Grid" onclick={() => (view = 'grid')}>▦</button><button class="ui-ag-tab" aria-pressed={view === 'list'} aria-label="List" onclick={() => (view = 'list')}>☰</button></div><input class="ui-ag-input ui-fil__q" placeholder="⌕ Search folders…" aria-label="Search folders" bind:value={fq} /><button class="ui-ag-btn" data-variant="primary" onclick={create}>+ Create folder</button></div>
		<div class="ui-fil__folders" data-view={view}>{#each shownF as f (f.name)}<button class="ui-ag-card" onclick={() => onopen?.(f.name)}><span class="ui-fil__fold">▬</span><span><b>{f.name}</b><small>{f.shared ? '⚇ Shared' : '⚿ Private'} · {f.files} files</small></span></button>{:else}<small>No folders match.</small>{/each}</div>
		<small class="ui-scr__k">File templates {templates.length}</small>
		<div class="ui-ag-row"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['All', 'Mine', 'Shared with me'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={ttab === t} onclick={() => (ttab = t)}>{t}</button>{/each}</div><input class="ui-ag-input ui-fil__q" placeholder="⌕ Search templates…" aria-label="Search templates" bind:value={tq} /><button class="ui-ag-btn">+ Add template</button></div>
		<div class="ui-fil__tpl">{#each shownT as t (t.name)}<button class="ui-fil__card" onclick={() => onopen?.(t.name)}><span class="ui-fil__prev"><FileIcon kind={t.kind} /></span><b>{t.name}</b><small>{kinds[t.kind]} · {t.owner} · {t.shared ? 'Shared' : 'Private'}</small></button>{/each}</div>
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
	a {
		color: var(--ag-ink);
	}
	.ui-fil__q {
		width: 140px;
	}
	.ui-fil__folders {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.ui-fil__folders[data-view='list'] {
		grid-template-columns: 1fr;
	}
	.ui-fil__folders button {
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		cursor: pointer;
	}
	.ui-fil__folders span:last-child {
		display: grid;
	}
	.ui-fil__fold {
		color: #5ab4ec;
		font-size: 18px;
	}
	.ui-fil__tpl {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}
	.ui-fil__card {
		all: unset;
		display: grid;
		gap: 3px;
		cursor: pointer;
	}
	.ui-fil__card:focus-visible {
		outline: 2px solid var(--ag-blue);
		border-radius: 8px;
	}
	.ui-fil__prev {
		height: 90px;
		border-radius: 10px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		margin-bottom: 6px;
	}
</style>
