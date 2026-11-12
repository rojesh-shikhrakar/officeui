<!-- Analytics – a revenue dashboard: key figures with mini bars, revenue by channel, the revenue breakdown, top products, and two week-over-week charts. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import KpiChart from '../components/KpiChart.svelte';
	import Sparkline from '../blocks/Sparkline.svelte';
	import { series, linePath } from '../agents/chart';
	import './shell/screen.css';
	let { onexport, onsave }: { onexport?: () => void; onsave?: () => void } = $props();
	let active = $state('revenue');
	let range = $state('Last 7 days');
	let saved = $state(false);
	const nav = [{ items: [{ id: 'home', label: 'Home', icon: '⌂' }, { id: 'revenue', label: 'Revenue', icon: '$' }, { id: 'invoices', label: 'Invoices', icon: '▤', count: 12 }, { id: 'payouts', label: 'Payouts', icon: '▭' }, { id: 'customers', label: 'Customers', icon: '⚇' }] }, { label: 'Channels', items: [{ id: 'online', label: 'Online store', icon: '▭' }, { id: 'market', label: 'Marketplace', icon: '▭' }, { id: 'whole', label: 'Wholesale', icon: '▭' }, { id: 'subs', label: 'Subscriptions', icon: '◌' }] }];
	const kpis = [['Gross revenue', '$96,412', '+12.5%', true], ['Active customers', '2,847', '+8.2%', true], ['Conversion', '3.24%', '+0.4%', true], ['Refund rate', '1.8%', '−0.3%', true]] as const;
	const breakdown = [['Gross sales', '$104,210', true], ['Discounts', '−$4,180', false], ['Refunds', '−$1,734', false], ['Shipping', '$2,940', true], ['Taxes', '$8,316', true], ['Net revenue', '$96,412', true]] as const;
	const products = [['Annual plan', 38400], ['Team seats', 24150], ['Monthly plan', 18920], ['Add-ons', 9640]] as const;
</script>

{#snippet wow(title: string, value: string, delta: string, seed: number, max: number)}
	<div class="ui-ag-card ui-anl__c"><small>{title}</small><div class="ui-ag-row"><b class="ui-anl__v">{value}</b><span class="ui-ag-pill" data-tone="green">{delta}</span></div><svg viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true"><path d={linePath(series(10, seed + 9, max * 0.5, max * 0.2), 200, 70, max)} fill="none" stroke="var(--ag-blue)" stroke-opacity="0.35" vector-effect="non-scaling-stroke" /><path d={linePath(series(10, seed, max * 0.6, max * 0.25), 200, 70, max)} fill="none" stroke="var(--ag-blue)" vector-effect="non-scaling-stroke" /></svg><small>This week vs. last week</small></div>
{/snippet}

<AppShell {nav} bind:active>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">Analytics / <b>Revenue</b></span><span class="ui-ag-grow"></span><select class="ui-ag-input ui-anl__sel" aria-label="Range" bind:value={range}>{#each ['Last 7 days', 'Last 30 days', 'This quarter'] as r (r)}<option>{r}</option>{/each}</select><button class="ui-ag-btn" onclick={() => onexport?.()}>⤓ Export</button><button class="ui-ag-btn" data-variant="primary" onclick={() => ((saved = true), onsave?.())}>{saved ? '✓ Saved' : 'Save as report'}</button></div>
	<div class="ui-anl">
		<div class="ui-anl__kpis">{#each kpis as [l, v, d], i (l)}<div class="ui-ag-card ui-anl__c"><small>{l}</small><div class="ui-ag-row"><b class="ui-anl__v">{v}</b><small class="ui-anl__d">{d}</small><span class="ui-ag-grow"></span><span class="ui-anl__bars">{#each series(8, i + 2, 6, 4) as h, j (j)}<i style:height="{Math.max(2, h * 2)}px"></i>{/each}</span></div></div>{/each}</div>
		<div class="ui-anl__row">
			<div class="ui-anl__chart"><KpiChart title="Revenue by channel" caption="Top 5 channels" /></div>
			<div class="ui-ag-card ui-anl__c"><small>Revenue breakdown</small>{#each breakdown as [l, v, up], i (l)}<div class="ui-ag-row ui-anl__br" data-alt={i % 2 || undefined}><span class="ui-ag-grow">{l}</span><b>{v}</b><Sparkline values={series(8, i + 4, 6, 4)} width={26} height={10} color={up ? 'var(--ag-green)' : 'var(--ag-red)'} /></div>{/each}</div>
		</div>
		<div class="ui-anl__three">
			<div class="ui-ag-card ui-anl__c"><small>Top products</small>{#each products as [p, v] (p)}<div class="ui-anl__p"><div class="ui-ag-row"><span class="ui-ag-grow">{p}</span><b>${v.toLocaleString('en-US')}</b></div><span class="ui-ag-bar"><i style:width="{(v / products[0][1]) * 100}%"></i></span></div>{/each}</div>
			{@render wow('Sessions over time', '16.4k', '+2.3k', 3, 3)}
			{@render wow('Average order value', '$141', '+$17', 7, 160)}
		</div>
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
	.ui-anl__sel {
		width: 110px;
	}
	.ui-anl {
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-anl__kpis {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.ui-anl__c {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-anl__v {
		font-size: 15px;
	}
	.ui-anl__d {
		color: var(--ag-green);
	}
	.ui-anl__bars {
		display: flex;
		align-items: end;
		gap: 2px;
		height: 14px;
	}
	.ui-anl__bars i {
		width: 3px;
		background: var(--ag-subtle);
		border-radius: 1px;
	}
	.ui-anl__row {
		display: grid;
		grid-template-columns: 1.6fr 1fr;
		gap: 8px;
	}
	.ui-anl__chart :global(.ui-kpi) {
		max-width: none;
		height: 100%;
	}
	.ui-anl__br {
		padding: 5px 6px;
		border-radius: 5px;
	}
	.ui-anl__br[data-alt] {
		background: var(--ag-fill);
	}
	.ui-anl__three {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.ui-anl__three svg {
		width: 100%;
		height: 70px;
	}
	.ui-anl__p {
		display: grid;
		gap: 4px;
	}
</style>
