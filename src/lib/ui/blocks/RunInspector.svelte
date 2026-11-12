<!-- Run Inspector – one agent run on one screen: run totals, who started whom as a tree, and each agent's tool calls with timing bars; click an agent to fold its calls. -->
<script lang="ts" module>
	export type Call = { name: string; icon: string; ms: number; at: number; running?: boolean };
	export type RunAgent = { name: string; model: string; mark: string; color: string; task: string; cost: string; calls: Call[]; children?: RunAgent[]; side?: RunAgent };
</script>

<script lang="ts">
	import '../agents/agents.css';
	const C = (name: string, icon: string, ms: number, at: number, running = false): Call => ({ name, icon, ms, at, running });
	let {
		goal = 'Launch the new pricing page by Friday',
		stats = [['Duration', '20s'], ['Cost', '$0.20'], ['Tokens', '33k'], ['Model calls', '3'], ['Tool calls', '7'], ['Errors', '0']] as [string, string][],
		root = {
			name: 'Orchestrator', model: 'Atlas Max', mark: '✳', color: '#d97757', task: 'Launch the new pricing page by Friday', cost: '$0.20 · 20s', calls: [C('Plan the launch', '✳', 6900, 0.3)],
			side: { name: 'Inspector', model: 'Atlas Mini', mark: '✳', color: '#d97757', task: 'Watches cost, errors and what reaches main', cost: '$0 · 20s', calls: [C('Check budget', '⛉', 2400, 0.5)] },
			children: [
				{ name: 'Researcher', model: 'Atlas Pro', mark: '✳', color: '#d97757', task: 'Compare the pricing of five competitors', cost: '$0.01 · 12s', calls: [C('Search tracker pricing', '⌕', 5400, 0.1), C('Search notes pricing', '⌕', 7200, 0.2), C('Query plan usage', '◫', 3500, 0.4), C('Read reviews', '⊕', 0, 0.7, true)] },
				{ name: 'Writer', model: 'Atlas Pro', mark: '✳', color: '#d97757', task: 'Write the copy for the three plans', cost: '$0.03 · 9s', calls: [C('Read brand voice', '▤', 3600, 0.2), C('Read pricing frames', '◩', 5100, 0.35), C('Draft plan copy', '✳', 0, 0.6, true)] },
				{ name: 'Coder', model: 'Orbit Pro', mark: '◎', color: '#171717', task: 'Build the page and wire up checkout', cost: '$0.05 · 5s', calls: [C('Create branch', '⑂', 2100, 0.3), C('Write pricing page', '◎', 0, 0.75, true)] }
			]
		} as RunAgent
	}: { goal?: string; stats?: [string, string][]; root?: RunAgent } = $props();
	let folded = $state<Set<string>>(new Set());
	let sel = $state<string | null>(null);
	const toggle = (n: string) => {
		const s = new Set(folded);
		if (s.has(n)) s.delete(n);
		else s.add(n);
		folded = s;
	};
	const count = (a: RunAgent): number => 1 + (a.side ? 1 : 0) + (a.children ?? []).reduce((s, c) => s + count(c), 0);
	const running = (a: RunAgent): number => (a.calls.some((c) => c.running) || !a.children ? 1 : 0) + (a.side ? 1 : 0) + (a.children ?? []).reduce((s, c) => s + running(c), 0);
</script>

{#snippet node(a: RunAgent)}
	<div class="ui-ag-card ui-rin__node" data-sel={sel === a.name || undefined}>
		<button class="ui-rin__hd" aria-expanded={!folded.has(a.name)} onclick={() => ((sel = a.name), toggle(a.name))}><span style:color={a.color}>{a.mark}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model}</small></span><span class="ui-ag-pill" data-tone="blue">◌ Running</span></button>
		<p>{a.task}</p>
		{#if !folded.has(a.name)}
			{#each a.calls as c (c.name)}<div class="ui-rin__call"><span>{c.icon}</span><span class="ui-rin__cn">{c.name}</span><span class="ui-rin__bar"><i style:left="{c.at * 100}%" style:width={c.running ? '20%' : `${Math.max(8, c.ms / 300)}%`} data-run={c.running || undefined}></i></span><small>{c.running ? '…' : `${(c.ms / 1000).toFixed(1)}s`}</small></div>{/each}
		{:else}<small>{a.calls.length} tool calls</small>{/if}
		<small><b>{a.cost.split(' · ')[0]}</b> · {a.cost.split(' · ')[1]}</small>
	</div>
{/snippet}

<div class="ui-ag ui-rin">
	<div class="ui-ag-row"><b class="ui-ag-grow"><span style:color="var(--ag-blue)">✦</span> {goal}</b><small>{count(root)} agents · <span style:color="var(--ag-blue)">{running(root)} running</span> · <b>{stats[1][1]}</b></small></div>
	<div class="ui-ag-card ui-rin__stats">{#each stats as [k, v] (k)}<div><small>{k}</small><b>{v}</b></div>{/each}</div>
	<div class="ui-rin__top">{@render node(root)}{#if root.side}<span class="ui-rin__dash" aria-hidden="true"></span>{@render node(root.side)}{/if}</div>
	<div class="ui-rin__kids">{#each root.children ?? [] as c (c.name)}{@render node(c)}{/each}</div>
</div>

<style>
	.ui-rin {
		width: 100%;
		max-width: 740px;
		display: grid;
		gap: 12px;
		font-size: 10.5px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-rin__stats {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		padding: 10px 14px;
		margin: 0 auto;
		width: 70%;
	}
	.ui-rin__stats div {
		display: grid;
		gap: 2px;
	}
	.ui-rin__top {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0;
		padding-left: 30%;
	}
	.ui-rin__top > :global(.ui-rin__node) {
		width: 220px;
	}
	.ui-rin__dash {
		width: 40px;
		border-top: 1px dashed color-mix(in srgb, var(--ag-blue) 50%, transparent);
	}
	.ui-rin__kids {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		padding-top: 14px;
		border-top: 1px solid color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	.ui-rin__node {
		padding: 9px 10px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-rin__node[data-sel] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 35%, transparent);
	}
	.ui-rin__hd {
		all: unset;
		display: flex;
		align-items: center;
		gap: 7px;
		cursor: pointer;
	}
	.ui-rin__hd:focus-visible {
		outline: 2px solid var(--ag-blue);
		border-radius: 4px;
	}
	.ui-rin__hd small {
		display: block;
	}
	p {
		margin: 0;
		color: var(--ag-muted);
	}
	.ui-rin__call {
		display: grid;
		grid-template-columns: 12px 1fr 50px 28px;
		gap: 6px;
		align-items: center;
	}
	.ui-rin__cn {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-rin__call small {
		text-align: right;
	}
	.ui-rin__bar {
		position: relative;
		height: 4px;
		border-radius: 2px;
		background: var(--ag-fill);
	}
	.ui-rin__bar i {
		position: absolute;
		top: 0;
		bottom: 0;
		border-radius: 2px;
		background: color-mix(in srgb, var(--ag-blue) 35%, transparent);
	}
	.ui-rin__bar i[data-run] {
		background: linear-gradient(90deg, color-mix(in srgb, var(--ag-blue) 15%, transparent), #c084fc);
	}
</style>
