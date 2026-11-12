<!-- KPI Board – the top of a dashboard: three trend cards, an overview chart comparing this period with the last, and a product card. -->
<script lang="ts">
	import { series, linePath, areaPath } from '../agents/chart';
	import Sparkline from './Sparkline.svelte';
	import '../agents/agents.css';
	let {
		cards = [
			{ label: 'Total revenue', value: '$6,061.00', delta: '+$1,030.00', up: true, trend: series(30, 4, 10, 5) },
			{ label: 'Emails sent', value: '50,786', delta: '+4,586', up: true, trend: series(30, 7, 10, 6) },
			{ label: 'Refunds', value: '107', delta: '−37', up: false, trend: series(30, 2, 10, 7) }
		],
		periods = ['Last 7 days', 'Last 30 days', 'Last 90 days'],
		product = { name: 'Pro license', kind: 'One-time', sold: 883, last: 786 }
	}: { cards?: { label: string; value: string; delta: string; up: boolean; trend: number[] }[]; periods?: string[]; product?: { name: string; kind: string; sold: number; last: number } } = $props();
	let period = $state(1);
	let filter = $state('All items');
	const now = $derived(series(30, 11 + period, 6, 3).map((v, i) => v + i * 0.25));
	const prev = $derived(series(30, 21 + period, 5, 2).map((v, i) => v + i * 0.08));
	const mx = $derived(Math.max(...now, ...prev) * 1.1);
	const lic = $derived(series(20, 5, 6, 3).map((v, i) => v + i * 0.2));
</script>

<div class="ui-ag ui-kpb">
	<div class="ui-ag-row"><b class="ui-ag-grow">Dashboard</b><label class="ui-ag-chip">▦ <select bind:value={period} aria-label="Period">{#each periods as p, i (p)}<option value={i}>{p}</option>{/each}</select></label></div>
	<div class="ui-kpb__cards">
		{#each cards as c (c.label)}
			<div class="ui-ag-card"><div class="ui-ag-row"><small class="ui-ag-grow">{c.label}</small><span class="ui-ag-pill" data-tone={c.up ? 'green' : 'red'}>{c.up ? '▲' : '▼'} {c.delta}</span></div><div class="ui-ag-row"><b class="ui-kpb__v ui-ag-grow">{c.value}</b><small>vs. last period</small></div><Sparkline values={c.trend} width={200} height={44} area /><div class="ui-ag-row ui-kpb__x"><small class="ui-ag-grow">13 Sep</small><small>Today</small></div></div>
		{/each}
	</div>
	<div class="ui-kpb__row">
		<div class="ui-ag-card ui-kpb__big">
			<div class="ui-ag-row"><span class="ui-ag-grow"><small>Sales overview</small><span class="ui-ag-row"><b class="ui-kpb__v">$5,192.00</b><span class="ui-ag-pill" data-tone="green">▲ 44.9%</span><small>vs. last period</small></span></span><label class="ui-ag-chip">☰ <select bind:value={filter} aria-label="Items">{#each ['All items', 'Subscriptions', 'One-time'] as f (f)}<option>{f}</option>{/each}</select></label></div>
			<svg viewBox="0 0 400 140" preserveAspectRatio="none" role="img" aria-label="Sales this period against last period">
				<path d={areaPath(now, 400, 140, mx)} fill="color-mix(in srgb, var(--ag-blue) 10%, transparent)" />
				<path d={linePath(prev, 400, 140, mx)} fill="none" stroke="var(--ag-blue)" stroke-opacity="0.35" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
				<path d={linePath(now, 400, 140, mx)} fill="none" stroke="var(--ag-blue)" stroke-width="1.4" vector-effect="non-scaling-stroke" />
			</svg>
			<div class="ui-ag-row ui-kpb__x"><small class="ui-ag-grow">13 Sep</small><small>Today</small></div>
		</div>
		<div class="ui-ag-card ui-kpb__prod">
			<div class="ui-ag-row"><span class="ui-kpb__ic">⬡</span><span class="ui-ag-grow"><b>{product.name}</b><small>{product.kind}</small></span><button class="ui-ag-btn">⚙ Set up</button></div>
			<small>Licenses sold</small>
			<div class="ui-ag-row"><b class="ui-kpb__v">{product.sold} licenses</b><span class="ui-ag-pill" data-tone="green">▲ {Math.round(((product.sold - product.last) / product.last) * 100)}%</span><small>vs. last period</small></div>
			<Sparkline values={lic} width={200} height={60} area />
			<small>Last period <b>{product.last}</b> &nbsp; This period <b>{product.sold}</b></small>
			<button class="ui-ag-btn ui-kpb__full">See full analytics</button>
		</div>
	</div>
</div>

<style>
	.ui-kpb {
		width: 100%;
		max-width: 720px;
		display: grid;
		gap: 10px;
		font-size: 11.5px;
	}
	.ui-kpb > .ui-ag-row b {
		font-weight: 500;
		font-size: 13px;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	small b {
		color: var(--ag-ink);
		font-weight: 500;
	}
	select {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
	}
	.ui-kpb__cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.ui-ag-card {
		padding: 12px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-ag-card :global(svg) {
		width: 100%;
	}
	.ui-kpb__v {
		font-size: 17px;
		font-weight: 500;
	}
	.ui-kpb__x {
		margin-top: -2px;
	}
	.ui-kpb__row {
		display: grid;
		grid-template-columns: 1.7fr 1fr;
		gap: 8px;
	}
	.ui-kpb__big svg {
		height: 150px;
	}
	.ui-kpb__ic {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		box-shadow: var(--ag-shadow);
		display: grid;
		place-items: center;
	}
	.ui-kpb__prod b {
		font-weight: 500;
	}
	.ui-kpb__prod .ui-ag-grow small {
		display: block;
	}
	.ui-kpb__full {
		justify-content: center;
	}
</style>
