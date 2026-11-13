<!-- Memory Panel – what the assistant remembers about you, by category: pause, edit or forget each memory, add your own, or turn memory off. -->
<script lang="ts" module>
	export type Memory = { id: number; text: string; cat: string; source: string; date: string; paused?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		enabled = $bindable(true),
		memories = $bindable([
			{ id: 1, text: 'Prefers TypeScript examples over plain JavaScript', cat: 'Preferences', source: 'From chat', date: 'Oct 12' },
			{ id: 2, text: 'Likes short answers first, details only when asked', cat: 'Preferences', source: 'You added', date: 'Oct 2', paused: true },
			{ id: 3, text: 'Designs with Inter and a 4px spacing grid', cat: 'Preferences', source: 'From design tool', date: 'Oct 7' },
			{ id: 4, text: 'Product designer and front-end developer at a small studio', cat: 'Work', source: 'From chat', date: 'Sep 28' },
			{ id: 5, text: 'Works mostly in SvelteKit and Tailwind', cat: 'Work', source: 'From chat', date: 'Sep 30' },
			{ id: 6, text: 'Ships a weekly changelog every Friday', cat: 'Work', source: 'From chat', date: 'Oct 9' },
			{ id: 7, text: 'Building a component library called OfficeUI', cat: 'Projects', source: 'From chat', date: 'Oct 14' },
			{ id: 8, text: 'Redesigning a booking flow for a yoga studio', cat: 'Projects', source: 'You added', date: 'Oct 15' }
		] as Memory[])
	}: { enabled?: boolean; memories?: Memory[] } = $props();
	let tab = $state('All');
	let forgot = $state<{ m: Memory; at: number } | null>(null);
	function forget(m: Memory) {
		forgot = { m, at: memories.indexOf(m) };
		memories = memories.filter((x) => x.id !== m.id);
	}
	function undoForget() {
		if (!forgot) return;
		const next = [...memories];
		next.splice(forgot.at, 0, forgot.m);
		memories = next;
		forgot = null;
	}
	onMount(() => play([[2400, () => forget(memories[0])], [2600, undoForget]], { still: 0 }));
	let q = $state('');
	let searching = $state(false);
	let adding = $state(false);
	let draft = $state('');
	let editing = $state<number | null>(null);
	const cats = $derived([...new Set(memories.map((m) => m.cat))]);
	const shown = $derived(memories.filter((m) => (tab === 'All' || m.cat === tab) && m.text.toLowerCase().includes(q.toLowerCase())));
	const upd = (id: number, patch: Partial<Memory>) => (memories = memories.map((m) => (m.id === id ? { ...m, ...patch } : m)));
	function add() {
		if (draft.trim()) memories = [...memories, { id: Date.now(), text: draft.trim(), cat: tab === 'All' ? 'Preferences' : tab, source: 'You added', date: 'Today' }];
		draft = '';
		adding = false;
	}
</script>

<div class="ui-ag ui-ag-panel ui-mem" data-off={!enabled || undefined}>
	<div class="ui-ag-head"><b class="ui-ag-grow">Memory <span class="ui-ag-pill" data-tone="gray">{memories.length}</span></b><label class="ui-ag-muted">Use memory <input type="checkbox" role="switch" bind:checked={enabled} /></label></div>
	<div class="ui-ag-row ui-mem__tabs">
		{#if searching}
			<!-- svelte-ignore a11y_autofocus -->
			<input class="ui-ag-input ui-ag-grow" bind:value={q} placeholder="Search memories" aria-label="Search memories" autofocus onkeydown={(e) => e.key === 'Escape' && ((searching = false), (q = ''))} />
		{:else}
			<div class="ui-ag-tabs ui-ag-grow" role="tablist">
				{#each ['All', ...cats] as c (c)}<button class="ui-ag-tab" role="tab" aria-selected={tab === c} onclick={() => (tab = c)}>{c} <span class="ui-ag-muted">{c === 'All' ? memories.length : memories.filter((m) => m.cat === c).length}</span></button>{/each}
			</div>
		{/if}
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Search" onclick={() => ((searching = !searching), (q = ''))}>⌕</button>
	</div>
	<div class="ui-mem__list">
		{#each cats as c (c)}
			{@const items = shown.filter((m) => m.cat === c)}
			{#if items.length}
				<small class="ui-mem__g">{c}</small>
				{#each items as m (m.id)}
					<div class="ui-mem__item" data-paused={m.paused || undefined}>
						{#if editing === m.id}
							<!-- svelte-ignore a11y_autofocus -->
							<input class="ui-ag-input" value={m.text} aria-label="Edit memory" autofocus onkeydown={(e) => { if (e.key === 'Enter') { upd(m.id, { text: e.currentTarget.value }); editing = null; } else if (e.key === 'Escape') editing = null; }} onblur={() => (editing = null)} />
						{:else}
							<div class="ui-mem__text">{m.text}</div>
						{/if}
						<small>{m.source} · {m.date} {#if m.paused}<span class="ui-ag-pill" data-tone="amber">Paused</span>{/if}</small>
						<span class="ui-mem__acts">
							<button class="ui-ag-btn" data-variant="ghost" aria-label="Edit “{m.text}”" onclick={() => (editing = m.id)}>✎</button>
							<button class="ui-ag-btn" data-variant="ghost" aria-label="{m.paused ? 'Resume' : 'Pause'} “{m.text}”" onclick={() => upd(m.id, { paused: !m.paused })}>{m.paused ? '▶' : 'Ⅱ'}</button>
							<button class="ui-ag-btn" data-variant="ghost" aria-label="Forget “{m.text}”" onclick={() => forget(m)}>×</button>
						</span>
					</div>
				{/each}
			{/if}
		{/each}
		{#if !shown.length}<p class="ui-ag-muted ui-mem__none">No memories match.</p>{/if}
	</div>
	{#if adding}
		<!-- svelte-ignore a11y_autofocus -->
		<div class="ui-ag-foot"><input class="ui-ag-input ui-ag-grow" bind:value={draft} placeholder="Something to remember…" aria-label="New memory" autofocus onkeydown={(e) => (e.key === 'Enter' ? add() : e.key === 'Escape' && (adding = false))} /><button class="ui-ag-btn" data-variant="primary" onclick={add}>Save</button></div>
	{:else}
		<button class="ui-mem__new" onclick={() => (adding = true)}>+ New memory</button>
	{/if}
	{#if forgot}<div class="ui-ag-foot ui-ag-muted ui-ag-in"><small class="ui-ag-grow ui-mem__forgot">Forgot “{forgot.m.text}”</small><button class="ui-ag-btn" data-variant="ghost" onclick={undoForget}>↶ Undo</button></div>{:else}<div class="ui-ag-foot ui-ag-muted"><span><b>{memories.length}</b> memories · {memories.filter((m) => m.paused).length} paused</span></div>{/if}
</div>

<style>
	.ui-mem__forgot {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-mem {
		max-width: 300px;
		font-size: 12px;
	}
	.ui-mem[data-off] .ui-mem__list {
		opacity: 0.45;
	}
	.ui-mem label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
	}
	.ui-mem__tabs {
		padding: 6px 10px;
	}
	.ui-mem__list {
		max-height: 260px;
		overflow-y: auto;
		padding: 0 4px 6px;
		transition: opacity 0.2s;
	}
	.ui-mem__g {
		display: block;
		padding: 10px 8px 4px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-mem__item {
		position: relative;
		padding: 6px 8px;
		border-radius: 8px;
		display: grid;
		gap: 2px;
	}
	.ui-mem__item:hover {
		background: var(--ag-fill);
	}
	.ui-mem__item[data-paused] .ui-mem__text {
		color: var(--ag-muted);
	}
	.ui-mem__item small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-mem__acts {
		position: absolute;
		right: 4px;
		top: 4px;
		display: none;
		background: var(--ag-fill);
	}
	.ui-mem__item:hover .ui-mem__acts,
	.ui-mem__item:focus-within .ui-mem__acts {
		display: flex;
	}
	.ui-mem__new {
		border: 0;
		border-top: 1px solid var(--ag-line);
		background: none;
		font: inherit;
		color: var(--ag-ink);
		text-align: left;
		padding: 9px 12px;
		cursor: pointer;
	}
	.ui-mem__new:hover {
		background: var(--ag-fill);
	}
	.ui-mem__none {
		padding: 12px;
		margin: 0;
	}
</style>
