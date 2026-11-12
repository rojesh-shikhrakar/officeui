<!-- Mission Control – all agents at a glance: what happened since you looked, who runs under whom with cost and time, and the questions waiting for you. -->
<script lang="ts">
	import { AGENTS, type Agent } from './mission';
	import SinceYouLooked from './SinceYouLooked.svelte';
	import NeedsYou from './NeedsYou.svelte';
	import '../agents/agents.css';
	let { agents = AGENTS }: { agents?: Agent[] } = $props();
	let filter = $state<'all' | 'running' | 'needs' | 'failed'>('all');
	const leads = $derived(agents.filter((a) => !a.parent));
	const kids = (n: string) => agents.filter((a) => a.parent === n);
	const match = (a: Agent) => filter === 'all' || a.status === filter;
	const tone = { running: 'blue', done: 'green', needs: 'amber', failed: 'red', idle: 'gray' } as const;
	const label = { running: 'Running', done: 'Done', needs: 'Needs you', failed: 'Failed', idle: 'Idle' } as const;
	const cnt = (s: string) => agents.filter((a) => a.status === s).length;
</script>

{#snippet card(a: Agent)}
	<div class="ui-ag-card ui-mc__card" data-dim={!match(a) || undefined}>
		<div class="ui-ag-row"><span style:color={a.color}>{a.mark}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model}</small></span><span class="ui-ag-pill" data-tone={tone[a.status]}>{a.status === 'running' ? '◌ ' : ''}{label[a.status]}</span></div>
		<p>{a.task}</p>
		<small><b>${a.cost.toFixed(2)}</b> · {a.time}</small>
	</div>
{/snippet}

<div class="ui-ag ui-mc">
	<div class="ui-ag-row"><b class="ui-ag-grow ui-mc__t">Mission control</b><div class="ui-ag-tabs" role="tablist"><button class="ui-ag-tab" role="tab" aria-selected={filter === 'all'} onclick={() => (filter = 'all')}>All {agents.length}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'running'} onclick={() => (filter = 'running')}>Running {cnt('running')}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'needs'} onclick={() => (filter = 'needs')}>Needs you {cnt('needs')}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'failed'} onclick={() => (filter = 'failed')}>Failed {cnt('failed')}</button></div></div>
	<SinceYouLooked />
	<div class="ui-mc__row">
		<div class="ui-ag-panel">
			<div class="ui-ag-head"><b class="ui-ag-grow">✦ Agents</b><small>{leads.length} agents / {agents.length - leads.length} sub-agents · {cnt('running')} running · {cnt('needs')} need you · <b>${agents.reduce((s, a) => s + a.cost, 0).toFixed(2)}</b></small></div>
			<div class="ui-mc__tree">
				{#each leads as l (l.name)}
					<div class="ui-mc__lead">{@render card(l)}</div>
					<div class="ui-mc__kids">{#each kids(l.name) as k (k.name)}{@render card(k)}{:else}<small class="ui-mc__none">No sub-agents</small>{/each}</div>
				{/each}
			</div>
		</div>
		<NeedsYou />
	</div>
</div>

<style>
	.ui-mc {
		width: 100%;
		max-width: 760px;
		display: grid;
		gap: 10px;
		font-size: 11px;
	}
	.ui-mc__t {
		font-size: 13px;
		font-weight: 500;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-mc__row {
		display: grid;
		grid-template-columns: 1fr 230px;
		gap: 10px;
		align-items: start;
	}
	.ui-mc__tree {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px 22px;
		padding: 10px;
	}
	.ui-mc__lead {
		position: relative;
	}
	.ui-mc__lead::after {
		content: '';
		position: absolute;
		right: -22px;
		top: 50%;
		width: 22px;
		border-top: 1px solid color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	.ui-mc__kids {
		display: grid;
		gap: 8px;
		border-left: 1px solid color-mix(in srgb, var(--ag-blue) 40%, transparent);
		padding-left: 8px;
		margin-left: -9px;
	}
	.ui-mc__card {
		padding: 9px 10px;
		display: grid;
		gap: 5px;
		transition: opacity 0.2s;
	}
	.ui-mc__card[data-dim] {
		opacity: 0.4;
	}
	.ui-mc__card .ui-ag-grow small {
		display: block;
	}
	p {
		margin: 0;
		color: var(--ag-muted);
	}
	.ui-mc__none {
		align-self: center;
	}
</style>
