<!-- Agent / Orchestration – a live multi-agent run as a tree on a canvas, with the trace, tokens and events underneath; pause or stop the run. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import AgentGraph from '../agents/AgentGraph.svelte';
	import TraceWaterfall from '../agents/TraceWaterfall.svelte';
	import { ORCH_NAV } from './shell/nav';
	import './shell/screen.css';
	let { name = 'Market research', run = 'run_8f3a2c', onstop }: { name?: string; run?: string; onstop?: () => void } = $props();
	let active = $state('orch');
	let state_ = $state<'live' | 'paused' | 'stopped'>('live');
	let tab = $state('Trace');
</script>

<AppShell workspace="Northwind" nav={ORCH_NAV} bind:active cards={false}>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs"><b>{name} ⌄</b> / {run} <span class="ui-ag-pill" data-tone={state_ === 'live' ? 'green' : 'gray'}>{state_}</span></span><span class="ui-ag-grow"></span><button class="ui-ag-btn" disabled={state_ === 'stopped'} onclick={() => (state_ = state_ === 'paused' ? 'live' : 'paused')}>{state_ === 'paused' ? '▷ Resume' : 'Ⅱ Pause run'}</button><button class="ui-ag-btn" disabled={state_ === 'stopped'} onclick={() => ((state_ = 'stopped'), onstop?.())}>◻ Stop</button></div>
	<div class="ui-orc">
		<div class="ui-orc__canvas"><AgentGraph /></div>
		<div class="ui-orc__trace">
			<div class="ui-ag-row"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each [['Trace', '☰'], ['Tokens & cost', '◫'], ['Events', '⚑']] as [t, i] (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{i} {t}{#if t === 'Events'} <span class="ui-ag-pill" data-tone="red">1</span>{/if}</button>{/each}</div><small>◷ 10/17 · 01:37 · 579.8K · <b>$2.18</b></small></div>
			{#if tab === 'Trace'}<TraceWaterfall />{:else if tab === 'Events'}<p class="ui-ag-muted">⚠ Claim check failed on 3 of 58 claims – retrying with the reviewer.</p>{:else}<p class="ui-ag-muted">579.8K tokens · $2.18 – most of it in the researcher's page reads.</p>{/if}
		</div>
	</div>
</AppShell>

<style>
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	b {
		font-weight: 500;
	}
	.ui-orc {
		display: grid;
		grid-template-rows: 1fr auto;
		height: calc(100% - 41px);
	}
	.ui-orc__canvas {
		overflow: auto;
		background: radial-gradient(circle, var(--ag-line) 1px, transparent 1.2px) 0 0 / 14px 14px;
		display: grid;
		place-items: center;
		padding: 16px;
	}
	.ui-orc__trace {
		border-top: 1px solid var(--ag-line);
		padding: 8px 12px;
		display: grid;
		gap: 6px;
		max-height: 220px;
		overflow: auto;
	}
	.ui-orc__trace :global(.ui-ag) {
		max-width: none;
	}
	p {
		margin: 6px 0;
	}
</style>
