<!-- Agent / Usage – what your agent costs: the month added up day by day against the budget, where it went by project or model, what's worth a look, and a project's day-by-day spend. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { series, linePath, areaPath } from '../utils/chart';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { budget = 500, month = 'November' }: { budget?: number; month?: string } = $props();
	let active = $state('usage');
	let by = $state<'Projects' | 'Models'>('Projects');
	let sel = $state('Northwind');
	const daily = series(19, 4, 14, 8).map((v) => Math.max(4, v));
	const cum = daily.reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], []);
	const spent = $derived(cum[cum.length - 1]);
	const groups = { Projects: [['Northwind', 118.4, '+23%', '#f97316'], ['Platform', 82.1, '−7%', '#a855f7'], ['Evalkit', 46.3, '+102%', '#14b8a6'], ['Internal', 23.6, '−22%', '#9ca3af']], Models: [['Atlas Max', 142.2, '+31%', '#d97757'], ['Atlas Pro', 88.9, '−4%', '#3b82f6'], ['Atlas Mini', 39.3, '+12%', '#10b981']] } as Record<string, [string, number, string, string][]>;
	const look = [['⚠', 'Competitor scan cost €18.40 yesterday', '4× what it usually costs – it read 212 pages instead of 40', '4×'], ['↗', 'Evalkit is up 102% on October', 'Its evals moved to the larger model on Nov 12', '+102%'], ['◔', 'Northwind has used 85% of its €140', 'At this pace it reaches it around Nov 23', '85%']];
	const projDaily = $derived(series(19, sel.length, 6, 5).map((v) => Math.max(1, v)));
	const cur = $derived(groups[by].find((g) => g[0] === sel) ?? groups[by][0]);
	const top = [['Competitor scan', '6 runs', 31.2], ['Ingest pipeline', '41 runs', 27.8], ['Client dashboard', '18 runs', 22.6], ['Weekly update', '3 runs', 4.1]] as const;
</script>

{#snippet detail()}
	<div class="ui-scr__tabs"><span class="ui-scr__tab">▭ {cur[0]}</span></div>
	<div class="ui-scr__panel">
		<b><span style:color={cur[3]}>■</span> {cur[0]}</b>
		<div><b class="ui-use__big">€{cur[1].toFixed(2)}</b> <small>{Math.round((cur[1] / spent) * 100)}% of {month}</small></div>
		<small style:color="var(--ag-red)">{cur[2]} vs last month</small>
		<small class="ui-scr__k">Day by day</small>
		<div class="ui-use__bars" role="img" aria-label="{cur[0]} spend per day">{#each projDaily as v, i (i)}<i style:height="{v * 4}px" style:background={cur[3]}></i>{/each}</div>
		<small>Nov 1 – Nov 19 · €{cur[1].toFixed(2)}</small>
		<small class="ui-scr__k">What cost the most</small>
		<div class="ui-scr__rows">{#each top as [n, r, v] (n)}<div class="ui-scr__row"><span><b>{n}</b><small>{r}</small></span><span>€{v.toFixed(2)}</span></div>{/each}</div>
	</div>
{/snippet}

<AppShell workspace="Fieldwork" nav={AGENT_NAV} bind:active cards={false} aside={detail} asideWidth={230}>
	<div class="ui-scr__bar"><b>Usage</b> <small>{month}</small></div>
	<div class="ui-scr ui-use">
		<div class="ui-ag-card ui-use__card">
			<small>Spent in {month}</small>
			<div><b class="ui-use__big">€{spent.toFixed(2)}</b> <small>of €{budget} · {Math.round((spent / budget) * 100)}%</small></div>
			<small>On track for €{Math.round((spent / 19) * 30)} by Nov 30</small>
			<svg viewBox="0 0 400 120" preserveAspectRatio="none" role="img" aria-label="Spend this month against the budget">
				<line x1="0" x2="400" y1={120 - (budget / (budget * 1.1)) * 120} y2={120 - (budget / (budget * 1.1)) * 120} stroke="var(--ag-line)" stroke-dasharray="3 3" />
				<path d={areaPath(cum, 400 * (19 / 30), 120, budget * 1.1)} fill="color-mix(in srgb, var(--ag-blue) 10%, transparent)" />
				<path d={linePath(cum, 400 * (19 / 30), 120, budget * 1.1)} fill="none" stroke="var(--ag-blue)" stroke-width="1.4" vector-effect="non-scaling-stroke" />
				<line x1={400 * (19 / 30)} y1={120 - (spent / (budget * 1.1)) * 120} x2="400" y2={120 - ((spent / 19) * 30 / (budget * 1.1)) * 120} stroke="var(--ag-blue)" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
			</svg>
			<div class="ui-use__stats">{#each [['Tasks', '186'], ['Runs', '1,284'], ['Per task', '€1.45'], ['Tokens', '48.2M']] as [k, v] (k)}<span><small>{k}</small><b>{v}</b></span>{/each}</div>
		</div>
		<div class="ui-ag-row"><small class="ui-ag-grow">Where it went</small><div class="ui-ag-tabs" role="tablist">{#each ['Projects', 'Models'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={by === t} onclick={() => ((by = t as typeof by), (sel = groups[t][0][0]))}>{t}</button>{/each}</div></div>
		<div class="ui-scr__rows">{#each groups[by] as [n, v, d, c] (n)}<button class="ui-scr__row ui-use__row" aria-current={sel === n || undefined} onclick={() => (sel = n)}><span><b><span style:color={c}>■</span> {n}</b></span><span class="ui-use__bar"><i style:width="{(v / groups[by][0][1]) * 100}%" style:background={c}></i></span><span>€{v.toFixed(2)}</span><small>{Math.round((v / spent) * 100)}%</small><small style:color={d.startsWith('+') ? 'var(--ag-red)' : 'var(--ag-green)'}>{d.startsWith('+') ? '↑' : '↓'}{d.slice(1)}</small></button>{/each}</div>
		<small>Worth a look</small>
		<div class="ui-scr__rows">{#each look as [i, t, d, p] (t)}<div class="ui-scr__row"><span class="ui-use__ic">{i}</span><span class="ui-ag-grow"><b>{t}</b><small>{d}</small></span><span class="ui-ag-pill" data-tone="amber">{p}</span><button class="ui-ag-btn">Open</button></div>{/each}</div>
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-use {
		max-width: 520px;
	}
	.ui-use__card {
		padding: 12px;
		display: grid;
		gap: 6px;
	}
	.ui-use__big {
		font-size: 19px;
		letter-spacing: -0.01em;
	}
	svg {
		width: 100%;
		height: 120px;
		margin: 6px 0;
	}
	.ui-use__stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-top: 1px solid var(--ag-line);
		padding-top: 8px;
	}
	.ui-use__stats span {
		display: grid;
	}
	.ui-use__row {
		width: 100%;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-use__row[aria-current] {
		background: var(--ag-fill);
	}
	.ui-use__row > span:first-child {
		flex: 0 0 90px !important;
	}
	.ui-use__bar {
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: var(--ag-fill);
	}
	.ui-use__bar i {
		display: block;
		height: 100%;
		border-radius: 2px;
	}
	.ui-use__ic {
		flex: 0 0 auto !important;
	}
	.ui-use__bars {
		display: flex;
		align-items: end;
		gap: 2px;
		height: 50px;
	}
	.ui-use__bars i {
		flex: 1;
		border-radius: 1px;
		opacity: 0.8;
	}
</style>
