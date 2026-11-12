<script lang="ts" module>
	export type TreeNode = { id: string; name: string; model: string; task: string; cost: number; secs: number; status: 'running' | 'done' | 'failed' | 'waiting'; children?: TreeNode[] };
</script>

<script lang="ts">
	import './agents.css';

	let {
		root = {
			id: 'o',
			name: 'Orchestrator',
			model: 'Opus 5.5',
			task: 'Launch the new pricing page by Friday',
			cost: 0.03,
			secs: 3,
			status: 'running',
			children: [
				{ id: 'r', name: 'Researcher', model: 'Sonnet 5.5', task: 'Compare the pricing of five competitors', cost: 0.18, secs: 55, status: 'done' },
				{ id: 'c', name: 'Coder', model: 'GPT-6 Sol', task: 'Build the page and wire up checkout', cost: 0.42, secs: 73, status: 'running' }
			]
		},
		expanded = $bindable(true)
	}: { root?: TreeNode; expanded?: boolean } = $props();

	const tone = { running: 'blue', done: 'green', failed: 'red', waiting: 'amber' } as const;
	const label = { running: 'Running', done: 'Done', failed: 'Failed', waiting: 'Waiting' } as const;
	const total = (n: TreeNode): number => n.cost + (n.children ?? []).reduce((s, c) => s + total(c), 0);
	const all = (n: TreeNode): TreeNode[] => [n, ...(n.children ?? []).flatMap(all)];
	const nodes = $derived(all(root));
	const running = $derived(nodes.filter((n) => n.status === 'running').length);
	const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
</script>

{#snippet card(n: TreeNode)}
	<div class="ui-agt__node ui-ag-card" data-status={n.status}>
		<div class="ui-agt__head">
			<span class="ui-ag-avatar" style:background="linear-gradient(135deg,#ff8a65,#e64a19)">{n.name[0]}</span>
			<div class="ui-agt__who"><b>{n.name}</b><small>{n.model}</small></div>
			<span class="ui-ag-pill" data-tone={tone[n.status]}>{#if n.status === 'running'}<i class="ui-ag-spin"></i>{/if}{label[n.status]}</span>
		</div>
		<p class="ui-agt__task">{n.task}</p>
		<small class="ui-agt__meta">${n.cost.toFixed(2)} · {fmt(n.secs)}</small>
	</div>
{/snippet}

<div class="ui-ag ui-agt">
	<div class="ui-agt__bar">
		<span class="ui-agt__title">✦ Agents</span>
		<span class="ui-agt__stats"
			>{nodes.length} agent{nodes.length > 1 ? 's' : ''} <span class="ui-agt__run">{running} running</span> <b>${total(root).toFixed(2)}</b></span
		>
	</div>
	<div class="ui-agt__tree">
		{@render card(root)}
		{#if root.children?.length}
			<button class="ui-agt__fold" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
				{expanded ? 'Fold' : `${root.children.length} sub-agents`}
			</button>
			{#if expanded}
				<div class="ui-agt__kids">
					{#each root.children as k (k.id)}<div class="ui-agt__kid">{@render card(k)}</div>{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.ui-agt {
		width: 100%;
		max-width: 560px;
	}
	.ui-agt__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 4px 16px;
		font-size: 12px;
	}
	.ui-agt__title {
		font-weight: 600;
	}
	.ui-agt__stats {
		color: var(--ag-muted);
		display: flex;
		gap: 10px;
	}
	.ui-agt__run {
		color: var(--ag-blue);
	}
	.ui-agt__stats b {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-agt__tree {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.ui-agt__node {
		width: 220px;
		padding: 10px 12px;
		display: grid;
		gap: 6px;
		animation: ui-ag-in 0.4s var(--ag-ease) both;
	}
	.ui-agt__head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-agt__who {
		display: grid;
		flex: 1;
		min-width: 0;
		line-height: 1.2;
	}
	.ui-agt__who b {
		font-weight: 500;
		font-size: 12.5px;
	}
	.ui-agt__who small,
	.ui-agt__meta {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-agt__task {
		margin: 0;
		font-size: 12px;
		color: var(--ag-ink);
	}
	.ui-agt__fold {
		border: 0;
		background: var(--ag-fill);
		color: var(--ag-muted);
		border-radius: 999px;
		font: inherit;
		font-size: 11px;
		padding: 2px 10px;
		cursor: pointer;
	}
	.ui-agt__kids {
		display: flex;
		gap: 12px;
		position: relative;
		padding-top: 12px;
	}
	.ui-agt__kids::before {
		content: '';
		position: absolute;
		top: 0;
		left: 110px;
		right: 110px;
		height: 12px;
		border: 1px solid var(--ag-line);
		border-bottom: 0;
		border-radius: 8px 8px 0 0;
	}
</style>
