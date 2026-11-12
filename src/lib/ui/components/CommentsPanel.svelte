<!-- Comments Panel – a comment feed with filters, runnable /edit commands, resolve and a composer. -->
<script lang="ts" module>
	export type PanelComment = { id: string; who: string; ago: string; text: string; kind: 'edit' | 'question' | 'note'; resolved?: boolean };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		comments = $bindable([
			{ id: '1', who: 'Mara Lindqvist', ago: '2min ago', text: '/edit Rename every “customers” to “members” on the pricing page.', kind: 'edit' },
			{ id: '2', who: 'Jonas Weber', ago: '5min ago', text: 'Should we mention the launch discount in the hero too?', kind: 'question' },
			{ id: '3', who: 'Lena Hart', ago: '11min ago', text: '/edit Shorten the FAQ answers to two lines each.', kind: 'edit' }
		]),
		onclose
	}: { comments?: PanelComment[]; onclose?: () => void } = $props();
	let tab = $state<'all' | 'question' | 'edit'>('all');
	let ran = $state<Record<string, 'running' | 'done'>>({});
	let draft = $state('');
	const shown = $derived(comments.filter((c) => tab === 'all' || c.kind === tab));
	const initials = (s: string) => s.split(' ').map((w) => w[0]).join('');
	function run(c: PanelComment) {
		ran[c.id] = 'running';
		setTimeout(() => (ran[c.id] = 'done'), 900);
	}
	function send() {
		const v = draft.trim();
		if (!v) return;
		comments = [{ id: String(Date.now()), who: 'You', ago: 'just now', text: v, kind: v.startsWith('/edit') ? 'edit' : v.endsWith('?') ? 'question' : 'note' }, ...comments];
		draft = '';
	}
</script>

<div class="ui-ag ui-ag-panel ui-cpn">
	<div class="ui-ag-head"><b>Comments</b>{#if onclose}<button class="ui-ag-btn" data-variant="ghost" aria-label="Close comments" onclick={onclose}>×</button>{/if}</div>
	<div class="ui-cpn__tabs">
		{#each [['all', 'All'], ['question', 'Questions'], ['edit', 'Edits']] as [id, label] (id)}
			<button class="ui-ag-chip" aria-pressed={tab === id} onclick={() => (tab = id as typeof tab)}>{label}{#if id === 'edit'} <em>{comments.filter((c) => c.kind === 'edit').length}</em>{/if}</button>
		{/each}
	</div>
	<div class="ui-cpn__list">
		{#each shown as c (c.id)}
			<article class="ui-ag-in" data-resolved={c.resolved || undefined}>
				<header><span class="ui-ag-avatar" style:background="#e5e7eb" style:color="#444">{initials(c.who)}</span><b>{c.who}</b><small>{c.ago}</small><button class="ui-cpn__res" aria-label="{c.resolved ? 'Reopen' : 'Resolve'} comment" onclick={() => (comments = comments.map((x) => (x.id === c.id ? { ...x, resolved: !x.resolved } : x)))}>{c.resolved ? '↺' : '✓'}</button></header>
				<p>{#if c.kind === 'edit'}<span class="ui-ag-muted">/Edit</span> {c.text.replace(/^\/edit\s*/i, '')}{:else}{c.text}{/if}</p>
				{#if c.kind === 'edit'}<button class="ui-ag-btn ui-cpn__run" disabled={!!ran[c.id]} onclick={() => run(c)}>{ran[c.id] === 'done' ? '✓ Edit applied' : ran[c.id] === 'running' ? 'Running…' : '▶ Run edit'}</button>{/if}
			</article>
		{/each}
	</div>
	<form class="ui-ag-foot" onsubmit={(e) => (e.preventDefault(), send())}><input class="ui-ag-input" bind:value={draft} placeholder="Add a comment or /edit…" aria-label="New comment" /><button class="ui-ag-btn" data-variant="primary" aria-label="Post comment" disabled={!draft.trim()}>↑</button></form>
</div>

<style>
	.ui-cpn {
		max-width: 320px;
		font-size: 12px;
	}
	.ui-cpn__tabs {
		display: flex;
		gap: 4px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-cpn__tabs em {
		font-style: normal;
		opacity: 0.7;
	}
	.ui-cpn__list {
		max-height: 260px;
		overflow-y: auto;
	}
	article {
		padding: 10px 14px;
		display: grid;
		gap: 5px;
		transition: opacity 0.2s;
	}
	article + article {
		border-top: 1px solid var(--ag-line);
	}
	article[data-resolved] {
		opacity: 0.5;
	}
	header {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	header b {
		font-weight: 500;
	}
	header small {
		margin-left: auto;
		color: var(--ag-subtle);
	}
	.ui-cpn__res {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
	}
	p {
		margin: 0 0 0 24px;
		line-height: 1.5;
	}
	.ui-cpn__run {
		margin-left: 24px;
		justify-self: start;
	}
</style>
