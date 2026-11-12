<!-- Folders / Detail – inside one folder: breadcrumbs, share and upload, file cards with previews, and an empty state when it has nothing yet. -->
<script lang="ts" module>
	export type FileItem = { name: string; kind: 'PDF' | 'DOC' | 'XLS'; when: string };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import FileIcon from './FileIcon.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let {
		name = 'Q3 Campaign',
		files = $bindable([{ name: 'Campaign-Brief', kind: 'DOC', when: '2 hours ago' }, { name: 'Launch-Plan', kind: 'PDF', when: 'Yesterday' }, { name: 'Media-Budget', kind: 'XLS', when: 'Yesterday' }, { name: 'Ad-Copy', kind: 'DOC', when: '3 days ago' }, { name: 'Results-Q2', kind: 'XLS', when: 'Last week' }] as FileItem[]),
		onshare
	}: { name?: string; files?: FileItem[]; onshare?: () => void } = $props();
	let active = $state('q3');
	let input = $state<HTMLInputElement>();
	const kinds = { PDF: 'PDF', DOC: 'Document', XLS: 'Spreadsheet' };
	function upload(e: Event) {
		const list = (e.currentTarget as HTMLInputElement).files;
		if (!list) return;
		files = [...files, ...Array.from(list, (f) => ({ name: f.name.replace(/\.\w+$/, ''), kind: (/\.pdf$/i.test(f.name) ? 'PDF' : /\.(xlsx?|csv)$/i.test(f.name) ? 'XLS' : 'DOC') as FileItem['kind'], when: 'Just now' }))];
	}
</script>

<AppShell nav={[CHAT_NAV[0], CHAT_NAV[2]]} bind:active>
	<div class="ui-scr">
		<span class="ui-scr__crumbs">Files / <b>{name}</b></span>
		<button class="ui-ag-btn ui-fol__back" data-variant="ghost">← Files</button>
		<div class="ui-ag-row"><h1 class="ui-ag-grow"><span style:color="#5ab4ec">▬</span> {name}</h1><button class="ui-ag-btn" onclick={() => onshare?.()}>⚇ Share</button><button class="ui-ag-btn" data-variant="primary" onclick={() => input?.click()}>⇪ Upload files</button><input bind:this={input} type="file" multiple hidden onchange={upload} /></div>
		{#if files.length}
			<div class="ui-fol__grid">{#each files as f (f.name)}<div class="ui-fol__card"><span class="ui-fol__prev"><FileIcon kind={f.kind} size={46} /></span><b>{f.name}</b><small>{kinds[f.kind]} · {f.when}</small><button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {f.name}" onclick={() => (files = files.filter((x) => x !== f))}>×</button></div>{/each}</div>
		{:else}
			<div class="ui-scr__empty"><i>▬</i><b>This folder is empty</b><span>Upload files or save them here from a chat.</span><button class="ui-ag-btn" onclick={() => input?.click()}>⇪ Upload files</button></div>
		{/if}
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
	.ui-fol__back {
		justify-self: start;
	}
	.ui-fol__grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.ui-fol__card {
		position: relative;
		display: grid;
		gap: 3px;
	}
	.ui-fol__card .ui-ag-btn {
		position: absolute;
		right: 4px;
		top: 4px;
		opacity: 0;
	}
	.ui-fol__card:hover .ui-ag-btn,
	.ui-fol__card .ui-ag-btn:focus-visible {
		opacity: 1;
	}
	.ui-fol__prev {
		height: 110px;
		border-radius: 10px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		margin-bottom: 6px;
	}
</style>
