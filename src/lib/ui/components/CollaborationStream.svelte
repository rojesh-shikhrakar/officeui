<!-- Collaboration Stream – what agents say to each other: a quiet chat where each message shows who it's from and for, with filters and a composer. -->
<script lang="ts" module>
	export type StreamMsg = { from: string; to: string; time: string; quote?: string; text: string; tools?: string[]; system?: boolean; handoff?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../agents/script';
	import '../agents/agents.css';
	let {
		people = ['You', 'Researcher', 'Writer', 'Orchestrator', 'Coder'],
		messages = $bindable([
			{ from: 'You', to: 'Orchestrator', time: '14:01', text: 'Launch the new pricing page by Friday – per-seat plans, keep a free tier.' },
			{ from: 'Orchestrator', to: 'everyone', time: '14:01', text: 'Orchestrator started Researcher and Writer', system: true },
			{ from: 'Researcher', to: 'Orchestrator', time: '14:02', quote: 'Find out what three tools charge per seat, and what their free tiers allow.', text: 'Tool A $10, Tool B $12, Tool C $15 per seat. All three keep a free tier.', tools: ['web_search ×6', 'pricing-table.csv'] },
			{ from: 'Writer', to: 'Orchestrator', time: '14:04', quote: 'Draft the copy for Free, Pro and Team – short, one line per plan.', text: "Do any of them cap seats on the free tier? I'd like to say ours doesn't." },
			{ from: 'Researcher', to: 'Writer', time: '14:05', text: 'None cap seats – Tool B limits guests to 10, Tool A caps issues at 250.' }
		])
	}: { people?: string[]; messages?: StreamMsg[] } = $props();
	const more: StreamMsg[] = [
		{ from: 'Writer', to: 'Orchestrator', time: '14:06', quote: 'Draft the copy for Free, Pro and Team – short, one line per plan.', text: 'Copy for the three plans is ready in Notes – Free says “no seat limit”.', tools: ['plans-copy.md'] },
		{ from: 'Orchestrator', to: 'everyone', time: '14:06', text: 'Orchestrator started Coder', system: true },
		{ from: 'Orchestrator', to: 'Coder', time: '14:06', text: 'Here’s everything you need – copy, prices and the design frames.', tools: ['src/billing/', 'plans-copy.md', 'pricing-table.csv'], handoff: true },
		{ from: 'Coder', to: 'Writer', time: '14:09', text: 'The Team line is two lines too long for its card – can you cut it?' },
		{ from: 'Writer', to: 'Coder', time: '14:09', text: '“Everything, together – for teams of 3 and more.”' }
	];
	onMount(() => play(more.map((m) => [2200, () => (messages = [...messages, m])] as [number, () => void]), { still: 0 }));
	let filter = $state('Everyone');
	let draft = $state('');
	const colors: Record<string, string> = { You: '#171717', Researcher: '#7c5cff', Writer: '#0ea5e9', Orchestrator: '#16a34a', Coder: '#f59e0b' };
	const shown = $derived(filter === 'Everyone' ? messages : messages.filter((m) => m.from === filter || m.to === filter));
	function send() {
		const v = draft.trim();
		if (!v) return;
		const at = v.match(/^@(\w+)/)?.[1];
		messages = [...messages, { from: 'You', to: at && people.includes(at) ? at : 'everyone', time: 'now', text: v.replace(/^@\w+\s*/, '') }];
		draft = '';
	}
</script>

<div class="ui-ag ui-cst">
	<div class="ui-cst__top">
		<div class="ui-ag-tabs" role="tablist">{#each ['Everyone', ...people.slice(0, 3)] as p (p)}<button class="ui-ag-tab" role="tab" aria-selected={filter === p} onclick={() => (filter = p)}>{p}</button>{/each}</div>
		<small class="ui-ag-muted"><span style:color="var(--ag-blue)">●</span> Live</small>
	</div>
	<div class="ui-cst__list">
		{#each shown as m, i (i)}
			{#if m.system}<small class="ui-cst__sys ui-ag-rise">{m.text}</small>{:else}
			<article class="ui-ag-card ui-ag-rise" data-me={m.from === 'You' || undefined}>
				<header><i style:background={colors[m.from] ?? '#999'}></i><b>{m.from}</b>{#if m.handoff}<span class="ui-ag-pill" data-tone="gray">Handoff</span>{/if}<small>{m.time}</small></header>
				{#if m.quote}<div class="ui-cst__q"><small>{m.to}</small>{m.quote}</div>{:else}<small class="ui-ag-muted">to {m.to}</small>{/if}
				<p>{m.text}</p>
				{#if m.tools}<div class="ui-cst__tools">{#each m.tools as t (t)}<button class="ui-ag-pill ui-cst__tool" data-tone="gray" aria-label="Open {t}">▤ {t}</button>{/each}</div>{/if}
			</article>
			{/if}
		{/each}
	</div>
	<form class="ui-ag-card ui-cst__compose" onsubmit={(e) => (e.preventDefault(), send())}>
		<input class="ui-ag-input" bind:value={draft} placeholder="Message the agents – @ to name one" aria-label="Message the agents" />
		<button class="ui-ag-btn" data-variant="primary" disabled={!draft.trim()} aria-label="Send">↑</button>
	</form>
</div>

<style>
	.ui-cst__sys {
		color: var(--ag-subtle);
		font-size: 10.5px;
		padding-left: 4px;
	}
	article[data-me] {
		margin-left: 60px;
		background: var(--ag-fill);
	}
	.ui-cst__tool {
		border: 0;
		cursor: pointer;
		font: inherit;
		font-size: 10px;
	}
	.ui-cst__list {
		max-height: 380px;
		overflow-y: auto;
	}
	.ui-cst {
		width: 100%;
		max-width: 460px;
		display: grid;
		gap: 8px;
		font-size: 11.5px;
	}
	.ui-cst__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.ui-cst__list {
		display: grid;
		gap: 8px;
	}
	article {
		padding: 9px 11px;
		display: grid;
		gap: 4px;
		max-width: 88%;
	}
	header {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	header i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}
	header b {
		font-weight: 500;
	}
	header small {
		margin-left: auto;
		color: var(--ag-subtle);
	}
	.ui-cst__q {
		background: var(--ag-fill);
		border-radius: 6px;
		padding: 4px 8px;
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-cst__q small {
		display: block;
		color: var(--ag-ink);
		font-weight: 500;
	}
	p {
		margin: 0;
	}
	.ui-cst__tools {
		display: flex;
		gap: 4px;
	}
	.ui-cst__compose {
		display: flex;
		gap: 6px;
		padding: 6px;
	}
</style>
