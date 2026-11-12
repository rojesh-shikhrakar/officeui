<!-- Mission Timeline – all agents on one clock: since you looked on top, every agent's work as bars over the last 30 minutes, and what needs you beside it. -->
<script lang="ts">
	import { AGENTS, type Agent } from './mission';
	import SinceYouLooked from './SinceYouLooked.svelte';
	import NeedsYou from './NeedsYou.svelte';
	import '../agents/agents.css';
	let { agents = AGENTS, span = 30 }: { agents?: Agent[]; span?: number } = $props();
	let filter = $state<'all' | 'running' | 'needs' | 'failed'>('all');
	const cnt = (s: string) => agents.filter((a) => a.status === s).length;
	const shown = $derived(agents.filter((a) => filter === 'all' || a.status === filter));
	const ticks = [5, 10, 15, 20, 25];
</script>

<div class="ui-ag ui-mt">
	<div class="ui-ag-row"><b class="ui-ag-grow ui-mt__t">Mission timeline</b><div class="ui-ag-tabs" role="tablist"><button class="ui-ag-tab" role="tab" aria-selected={filter === 'all'} onclick={() => (filter = 'all')}>All {agents.length}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'running'} onclick={() => (filter = 'running')}>Running {cnt('running')}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'needs'} onclick={() => (filter = 'needs')}>Needs you {cnt('needs')}</button><button class="ui-ag-tab" role="tab" aria-selected={filter === 'failed'} onclick={() => (filter = 'failed')}>Failed {cnt('failed')}</button></div></div>
	<SinceYouLooked />
	<div class="ui-mt__row">
		<div class="ui-ag-panel">
			<div class="ui-ag-head"><b>✦ Agents</b><small><span style:color="var(--ag-blue)">●</span> {cnt('running')} running</small><small class="ui-ag-grow"><span style:color="var(--ag-amber)">●</span> {cnt('needs')} need you</small><span class="ui-ag-pill" data-tone="gray">Last {span}m</span></div>
			<div class="ui-mt__grid">
				<span></span><div class="ui-mt__ticks">{#each ticks as t (t)}<small style:left="{((span - t) / span) * 100}%">−{t}m</small>{/each}<small class="ui-mt__now" style:left="100%">now</small></div>
				{#each shown as a (a.name)}
					<div class="ui-mt__who"><span style:color={a.color}>{a.mark}</span><span><b>{a.name}</b>{#if a.status === 'needs'} <span class="ui-ag-pill" data-tone="amber">Needs you</span>{:else if a.status === 'idle' || a.status === 'failed' || a.status === 'done'} <span class="ui-ag-pill" data-tone="gray">Idle</span>{/if}<small>{a.model}</small></span></div>
					<div class="ui-mt__lane">{#each a.bars ?? [] as b (b.label)}<span class="ui-mt__bar" data-needs={b.needs || undefined} data-live={b.to >= span && !b.needs || undefined} data-fail={a.status === 'failed' || undefined} style:left="{(b.from / span) * 100}%" style:width="{((b.to - b.from) / span) * 100}%">{b.label}{#if b.needs}<em>▲ Needs you</em>{/if}</span>{/each}</div>
				{/each}
			</div>
		</div>
		<NeedsYou />
	</div>
</div>

<style>
	.ui-mt {
		width: 100%;
		max-width: 760px;
		display: grid;
		gap: 10px;
		font-size: 11px;
	}
	.ui-mt__t {
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
	.ui-mt__row {
		display: grid;
		grid-template-columns: 1fr 230px;
		gap: 10px;
		align-items: start;
	}
	.ui-mt__grid {
		display: grid;
		grid-template-columns: 130px 1fr;
		row-gap: 10px;
		padding: 8px 12px 12px;
		align-items: center;
	}
	.ui-mt__ticks {
		position: relative;
		height: 14px;
	}
	.ui-mt__ticks small {
		position: absolute;
		transform: translateX(-50%);
		font-size: 9px;
	}
	.ui-mt__now {
		transform: translateX(-100%) !important;
		color: var(--ag-blue) !important;
		background: color-mix(in srgb, var(--ag-blue) 10%, transparent);
		padding: 0 4px;
		border-radius: 4px;
	}
	.ui-mt__who {
		display: flex;
		gap: 8px;
		align-items: flex-start;
	}
	.ui-mt__who small {
		display: block;
	}
	.ui-mt__lane {
		position: relative;
		height: 24px;
		background: repeating-linear-gradient(90deg, transparent 0 calc(16.66% - 1px), var(--ag-line) calc(16.66% - 1px) 16.66%);
	}
	.ui-mt__bar {
		position: absolute;
		top: 2px;
		height: 20px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 7px;
		border-radius: 6px;
		background: var(--ag-fill);
		box-shadow: inset 0 0 0 1px var(--ag-line);
		white-space: nowrap;
		overflow: hidden;
		font-size: 10px;
		box-sizing: border-box;
	}
	.ui-mt__bar[data-live] {
		color: var(--ag-blue);
		background: color-mix(in srgb, var(--ag-blue) 8%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ag-blue) 30%, transparent);
	}
	.ui-mt__bar[data-needs] {
		color: var(--ag-amber);
		background: color-mix(in srgb, var(--ag-amber) 10%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ag-amber) 30%, transparent);
	}
	.ui-mt__bar[data-fail] {
		color: var(--ag-red);
		background: color-mix(in srgb, var(--ag-red) 8%, transparent);
	}
	.ui-mt__bar em {
		font-style: normal;
		margin-left: auto;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--ag-surface);
	}
</style>
