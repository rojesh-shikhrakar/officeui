<!-- Agent Gallery – slim gradient panels with one open product screen in the middle; pick a panel (or use the arrows) to open that agent. -->
<script lang="ts" module>
	export type GalleryAgent = { name: string; blurb: string; trigger: string; owner: string; from: string; to: string; stats: [string, string][] };
</script>

<script lang="ts">
	import { series } from '../utils/chart';
	import Sparkline from './Sparkline.svelte';
	import '../agents/agents.css';
	let {
		title = 'Agents that run your playbook',
		subtitle = 'Give each agent its steps, tools and limits – then let it work inside the tools your team already uses.',
		agents = [
			{ name: 'Lead enrichment', blurb: 'Fills in company data for every new signup.', trigger: 'New signup', owner: 'Sam Rivera', from: '#c7d2fe', to: '#e0e7ff', stats: [['Runs', '412'], ['Success', '99%'], ['Time saved', '6.1h'], ['Escalated', '2']] },
			{ name: 'Meeting recap', blurb: 'Sends notes and action items after every call.', trigger: 'Meeting ends', owner: 'Ana Costa', from: '#e9d5ff', to: '#f5f3ff', stats: [['Runs', '96'], ['Success', '98%'], ['Time saved', '4.0h'], ['Escalated', '1']] },
			{ name: 'Churn watch', blurb: 'Spots accounts that go quiet and suggests a save play.', trigger: 'Usage drops 30%', owner: 'Lena Hart', from: '#fdba74', to: '#fde68a', stats: [['Runs', '183'], ['Success', '97%'], ['Time saved', '3.3h'], ['Escalated', '7']] },
			{ name: 'Onboarding coach', blurb: 'Guides new users through their first week.', trigger: 'Account created', owner: 'Jonas Weber', from: '#99f6e4', to: '#ccfbf1', stats: [['Runs', '251'], ['Success', '95%'], ['Time saved', '5.2h'], ['Escalated', '4']] },
			{ name: 'Content review', blurb: 'Checks drafts against the style guide.', trigger: 'Draft submitted', owner: 'Mia Chen', from: '#bae6fd', to: '#e0f2fe', stats: [['Runs', '77'], ['Success', '100%'], ['Time saved', '2.4h'], ['Escalated', '0']] }
		] as GalleryAgent[],
		active = $bindable(2)
	}: { title?: string; subtitle?: string; agents?: GalleryAgent[]; active?: number } = $props();
	let tab = $state('Context');
	const a = $derived(agents[active]);
	const go = (d: number) => (active = (active + d + agents.length) % agents.length);
</script>

<div class="ui-ag ui-agl">
	<header><h3>{title}</h3><p>{subtitle}</p></header>
	<div class="ui-agl__strip" role="tablist" aria-label="Agents" tabindex="0" onkeydown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' && go(-1))}>
		{#each agents as g, i (g.name)}
			{#if i === active}
				<div class="ui-agl__open ui-ag-in" role="tabpanel" style:--a={g.from} style:--b={g.to}>
					<div class="ui-ag-card ui-agl__screen">
						<div class="ui-ag-row"><span class="ui-agl__dot"></span><span class="ui-ag-chip"><i style:background={g.from}></i>{g.name} ⌄</span><span class="ui-ag-grow"></span><button class="ui-ag-btn" data-variant="primary">+ New agent</button></div>
						<div class="ui-agl__body">
							<div class="ui-ag-row"><i class="ui-agl__ic" style:background="linear-gradient(135deg, {g.from}, {g.to})"></i><span class="ui-ag-grow"></span><small>3m ago ⟳</small></div>
							<h4>{g.name}</h4><small>Triggered by “{g.trigger}” · Owner {g.owner}</small>
							<div class="ui-agl__stats">{#each g.stats as [k, v], j (k)}<div><small>{k}</small><span><b>{v}</b><Sparkline values={series(10, j + i * 3, 8, 5)} width={34} height={12} color="var(--ag-subtle)" /></span></div>{/each}</div>
							<div class="ui-ag-tabs" role="tablist">{#each ['Runs', 'Tools', 'Context', 'Settings'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{t}</button>{/each}</div>
							<b>Agent {tab.toLowerCase()}</b><small>{tab === 'Context' ? 'Goals, files and rules the agent uses on every run.' : `The ${tab.toLowerCase()} of ${g.name}.`}</small>
						</div>
					</div>
				</div>
			{:else}
				<button class="ui-agl__panel" role="tab" aria-selected="false" style:--a={g.from} style:--b={g.to} onclick={() => (active = i)}><span>{g.name}</span></button>
			{/if}
		{/each}
	</div>
	<div class="ui-ag-row"><span class="ui-ag-grow"><b>{a.name}.</b> <span class="ui-ag-muted">{a.blurb}</span></span><button class="ui-ag-btn" aria-label="Previous agent" onclick={() => go(-1)}>‹</button><button class="ui-ag-btn" aria-label="Next agent" onclick={() => go(1)}>›</button></div>
</div>

<style>
	.ui-agl {
		width: 100%;
		max-width: 780px;
		display: grid;
		gap: 16px;
		font-size: 11px;
	}
	header {
		text-align: center;
	}
	h3 {
		margin: 0;
		font-size: 19px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	header p {
		margin: 6px auto 0;
		max-width: 300px;
		color: var(--ag-muted);
		line-height: 1.5;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-agl__strip {
		display: flex;
		gap: 8px;
		height: 420px;
		outline: none;
	}
	.ui-agl__panel {
		flex: 0 0 74px;
		border: 0;
		border-radius: 12px;
		background: linear-gradient(180deg, var(--a), var(--b));
		position: relative;
		cursor: pointer;
		transition: flex-basis 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.ui-agl__panel:hover {
		flex-basis: 90px;
	}
	.ui-agl__panel span {
		position: absolute;
		left: 50%;
		bottom: 16px;
		transform: rotate(-90deg);
		transform-origin: left center;
		white-space: nowrap;
		color: #3a3a3a;
		font-size: 11px;
	}
	.ui-agl__open {
		flex: 1;
		border-radius: 14px;
		background: linear-gradient(135deg, var(--a), var(--b) 60%, color-mix(in srgb, var(--a) 40%, white));
		padding: 30px 30px 0;
		overflow: hidden;
	}
	.ui-agl__screen {
		height: 100%;
		border-radius: 12px 12px 0 0;
		padding: 10px 12px;
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 10px;
	}
	.ui-agl__dot {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		background: var(--ag-ink);
	}
	.ui-ag-chip i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		display: inline-block;
	}
	.ui-agl__body {
		padding: 10px 40px;
		display: grid;
		gap: 8px;
		align-content: start;
		justify-items: start;
	}
	.ui-agl__ic {
		width: 22px;
		height: 22px;
		border-radius: 6px;
	}
	h4 {
		margin: 4px 0 0;
		font-size: 17px;
		font-weight: 500;
	}
	.ui-agl__stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		width: 100%;
		margin: 8px 0;
	}
	.ui-agl__stats small {
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 8.5px;
	}
	.ui-agl__stats span {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
