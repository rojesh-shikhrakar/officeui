<!-- Live Session – work with a team of agents while they work: their conversation in the middle (filter by who), the plan and the shared context on the side, and a composer that can @-name one agent. -->
<script lang="ts" module>
	export type Msg = { from: string; to?: string; text: string; time: string; quote?: string; files?: string[] };
</script>

<script lang="ts">
	import ContextWindow from '../agents/ContextWindow.svelte';
	import '../agents/agents.css';
	let {
		agents = ['Researcher', 'Writer'],
		messages = $bindable([
			{ from: 'Researcher', text: 'Tracker $10, Notes $12, Canvas $15 per seat. All three keep a free tier.', time: '14:03', files: ['web_search ×6', 'pricing-table.csv'] },
			{ from: 'Writer', to: 'Orchestrator', quote: 'Draft the copy for Free, Pro and Team – short, one line per plan.', text: "Do any of them cap seats on the free tier? I'd like to say ours doesn't.", time: '14:04' },
			{ from: 'Researcher', to: 'Writer', text: 'None cap seats – Notes limits guests to 10, Tracker caps issues at 250.', time: '14:05' },
			{ from: 'Writer', to: 'Orchestrator', quote: 'Draft the copy for Free, Pro and Team – short, one line per plan.', text: 'Copy for the three plans is ready in Notes – Free says “no seat limit”.', time: '14:06', files: ['plans-copy.md'] }
		] as Msg[]),
		plan = $bindable([
			{ title: 'Compare per-seat prices', done: true, time: '1m 24s' },
			{ title: 'Draft the copy for the three plans', done: true, time: '2m 48s' },
			{ title: 'Build /pricing with the seat picker' },
			{ title: 'Pick the Team price' },
			{ title: 'Review the preview deploy' }
		] as { title: string; done?: boolean; time?: string }[])
	}: { agents?: string[]; messages?: Msg[]; plan?: { title: string; done?: boolean; time?: string }[] } = $props();
	let who = $state('Everyone');
	let draft = $state('');
	let feed = $state<HTMLElement>();
	const shown = $derived(messages.filter((m) => who === 'Everyone' || (who === 'You' ? m.from === 'You' : m.from === who || m.to === who)));
	const to = $derived(draft.match(/^@(\w+)/)?.[1]);
	function send() {
		if (!draft.trim()) return;
		messages = [...messages, { from: 'You', to: to ?? 'everyone', text: draft.replace(/^@\w+\s*/, ''), time: new Date().toTimeString().slice(0, 5) }];
		draft = '';
		queueMicrotask(() => feed?.scrollTo({ top: feed.scrollHeight }));
	}
</script>

<div class="ui-ag ui-lvs">
	<div class="ui-lvs__main">
		<div class="ui-ag-row"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['Everyone', 'You', ...agents] as w (w)}<button class="ui-ag-tab" role="tab" aria-selected={who === w} onclick={() => (who = w)}>{w}</button>{/each}</div><small><span style:color="var(--ag-blue)">●</span> Live</small></div>
		<ol class="ui-lvs__feed" bind:this={feed} aria-live="polite">
			{#each shown as m, i (i)}
				<li class="ui-ag-card ui-ag-in" data-me={m.from === 'You' || undefined}>
					<div class="ui-ag-row"><b class="ui-ag-grow">{m.from}</b><small>{m.time}</small></div>
					{#if m.to && m.to !== 'Orchestrator' && !m.quote}<small class="ui-lvs__to">to ⁙ {m.to}</small>{/if}
					{#if m.quote}<div class="ui-lvs__quote"><small>⁙ {m.to}</small><span>{m.quote}</span></div>{/if}
					<p>{m.text}</p>
					{#if m.files}<span class="ui-ag-row">{#each m.files as f (f)}<span class="ui-ag-pill" data-tone="gray">▤ {f}</span>{/each}</span>{/if}
				</li>
			{/each}
		</ol>
		<form class="ui-ag-card ui-lvs__comp" onsubmit={(e) => (e.preventDefault(), send())}>
			<input bind:value={draft} placeholder="Message the agents – @ to name one" aria-label="Message the agents" />
			<div class="ui-ag-row"><small class="ui-ag-grow">@ to {to ?? 'everyone'}</small><button class="ui-ag-btn" data-variant="primary" aria-label="Send" disabled={!draft.trim()}>↑</button></div>
		</form>
	</div>
	<aside>
		<div class="ui-ag-card ui-lvs__plan">
			<div class="ui-ag-row"><span style:color="var(--ag-blue)">✦</span><span class="ui-ag-grow"><b>Team plan</b><small>{agents.length + 2} agents · Step {plan.filter((p) => p.done).length + 1} of {plan.length}</small></span></div>
			<span class="ui-ag-pill" data-tone="blue">◌ Running · 9m 04s</span>
			{#each plan as p, i (p.title)}<label data-done={p.done || undefined}><input type="checkbox" checked={!!p.done} onchange={() => (plan = plan.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} /><span class="ui-ag-grow">{p.title}</span><small>{p.time ?? ''}</small></label>{/each}
		</div>
		<ContextWindow />
	</aside>
</div>

<style>
	.ui-lvs {
		width: 100%;
		max-width: 780px;
		display: grid;
		grid-template-columns: 1fr 270px;
		gap: 12px;
		font-size: 11px;
		align-items: start;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-lvs__main {
		display: grid;
		gap: 8px;
	}
	.ui-lvs__feed {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
		max-height: 360px;
		overflow-y: auto;
	}
	.ui-lvs__feed li {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
		margin-left: 22px;
	}
	.ui-lvs__feed li[data-me] {
		margin-left: 80px;
		background: var(--ag-fill);
	}
	.ui-lvs__to {
		display: block;
	}
	.ui-lvs__quote {
		background: var(--ag-fill);
		border-radius: 7px;
		padding: 6px 8px;
		display: grid;
		gap: 2px;
		color: var(--ag-muted);
	}
	p {
		margin: 0;
		line-height: 1.5;
	}
	.ui-lvs__comp {
		padding: 10px 12px;
		display: grid;
		gap: 8px;
	}
	.ui-lvs__comp input {
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	aside {
		display: grid;
		gap: 10px;
	}
	.ui-lvs__plan {
		padding: 12px;
		display: grid;
		gap: 8px;
		justify-items: start;
	}
	.ui-lvs__plan .ui-ag-grow small {
		display: block;
	}
	.ui-lvs__plan label {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
	}
	.ui-lvs__plan label:not([data-done]) {
		color: var(--ag-muted);
	}
	.ui-lvs__plan input {
		accent-color: var(--ag-blue);
		margin: 0;
	}
	aside :global(.ui-ag) {
		max-width: none;
	}
</style>
