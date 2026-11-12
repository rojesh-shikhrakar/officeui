<!-- Metrics Dashboard – a sales overview: KPI cards pick the metric, one chart switches between line and bars and can compare with the previous period, with top products and channels below. -->
<script lang="ts">
	import { series, linePath, areaPath } from '../agents/chart';
	import '../agents/agents.css';
	let {
		store = 'Northwind Store',
		metrics = [
			{ label: 'Revenue', value: '$296,117', delta: '11.4%', up: true, max: 20000, unit: '$', seed: 3 },
			{ label: 'Orders', value: '4,491', delta: '10.5%', up: true, max: 300, unit: '', seed: 6 },
			{ label: 'Avg. order', value: '$65.94', delta: '0.8%', up: true, max: 90, unit: '$', seed: 9 },
			{ label: 'Refund rate', value: '2.1%', delta: '0.1 pts', up: false, max: 4, unit: '%', seed: 12 }
		],
		products = [['Linen overshirt', 65146], ['Everyday tote', 47379], ['Merino crew', 38495], ['Canvas sneaker', 26651], ['Wool beanie', 17767]] as [string, number][],
		channels = [['Online store', 136214], ['Social shop', 62185], ['Marketplace', 41456], ['Wholesale', 32573], ['Pop-up', 14806]] as [string, number][],
		onexport
	}: { store?: string; metrics?: { label: string; value: string; delta: string; up: boolean; max: number; unit: string; seed: number }[]; products?: [string, number][]; channels?: [string, number][]; onexport?: () => void } = $props();
	let m = $state(0);
	let range = $state('Month');
	let kind = $state<'line' | 'bar'>('line');
	let compare = $state(false);
	const n = $derived(range === 'Week' ? 7 : range === 'Month' ? 30 : 13);
	const cur = $derived(metrics[m]);
	const vals = $derived(series(n, cur.seed, cur.max * 0.55, cur.max * 0.35).map((v) => Math.min(cur.max * 0.95, v)));
	const prev = $derived(series(n, cur.seed + 40, cur.max * 0.45, cur.max * 0.25).map((v) => Math.min(cur.max * 0.95, v)));
	const fmt = (v: number) => (cur.unit === '$' ? `$${v >= 1000 ? Math.round(v / 1000) + 'K' : v}` : cur.unit === '%' ? `${v}%` : `${v}`);
	const money = (v: number) => '$' + v.toLocaleString('en-US');
</script>

{#snippet bars(title: string, rows: [string, number][])}
	<div class="ui-ag-card ui-mdb__list"><div class="ui-ag-row"><b class="ui-ag-grow">{title}</b><small class="ui-mdb__k">Revenue</small></div>{#each rows as [name, v] (name)}<div class="ui-mdb__bar"><i style:width="{(v / rows[0][1]) * 100}%"></i><span>{name}</span><span>{money(v)}</span></div>{/each}</div>
{/snippet}

<div class="ui-ag ui-mdb">
	<div class="ui-ag-row"><span class="ui-ag-grow"><b class="ui-mdb__t">Sales</b><small>{store} · Last {range === 'Week' ? '7 days' : range === 'Month' ? '30 days' : 'quarter'}</small></span><div class="ui-ag-tabs" role="tablist">{#each ['Week', 'Month', 'Quarter'] as r (r)}<button class="ui-ag-tab" role="tab" aria-selected={range === r} onclick={() => (range = r)}>{r}</button>{/each}</div><button class="ui-ag-btn" onclick={() => onexport?.()}>⤓ Export</button></div>
	<div class="ui-mdb__kpis" role="tablist" aria-label="Metric">
		{#each metrics as k, i (k.label)}<button class="ui-ag-card" role="tab" aria-selected={m === i} onclick={() => (m = i)}><small>{k.label}</small><b>{k.value}</b><span class="ui-ag-pill" data-tone={k.up ? 'green' : 'red'}>▲ {k.delta}</span></button>{/each}
	</div>
	<div class="ui-ag-card ui-mdb__chart">
		<div class="ui-ag-row"><span class="ui-ag-grow">○ {cur.label}</span><div class="ui-ag-tabs"><button class="ui-ag-tab" aria-pressed={kind === 'line'} aria-label="Line chart" onclick={() => (kind = 'line')}>⟋</button><button class="ui-ag-tab" aria-pressed={kind === 'bar'} aria-label="Bar chart" onclick={() => (kind = 'bar')}>▮</button></div><label class="ui-ag-muted"><input type="checkbox" role="switch" bind:checked={compare} /> Compare to previous period</label></div>
		<div class="ui-mdb__plot">
			<div class="ui-mdb__y"><small>{fmt(cur.max)}</small><small>{fmt(cur.max / 2)}</small><small>{fmt(0)}</small></div>
			<svg viewBox="0 0 400 150" preserveAspectRatio="none" role="img" aria-label="{cur.label} over the {range.toLowerCase()}">
				{#if kind === 'line'}
					<path d={areaPath(vals, 400, 150, cur.max)} fill="color-mix(in srgb, var(--ag-blue) 10%, transparent)" />
					{#if compare}<path d={linePath(prev, 400, 150, cur.max)} fill="none" stroke="var(--ag-subtle)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />{/if}
					<path d={linePath(vals, 400, 150, cur.max)} fill="none" stroke="var(--ag-blue)" stroke-width="1.4" vector-effect="non-scaling-stroke" />
				{:else}
					{#each vals as v, i (i)}
						{@const w = 400 / n}
						{#if compare}<rect x={i * w + w * 0.15} y={150 - (prev[i] / cur.max) * 150} width={w * 0.3} height={(prev[i] / cur.max) * 150} fill="var(--ag-line)" />{/if}
						<rect x={i * w + w * (compare ? 0.5 : 0.2)} y={150 - (v / cur.max) * 150} width={w * (compare ? 0.3 : 0.6)} height={(v / cur.max) * 150} rx="1.5" fill="var(--ag-blue)" />
					{/each}
				{/if}
			</svg>
		</div>
	</div>
	<div class="ui-mdb__two">{@render bars('Top products', products)}{@render bars('Channels', channels)}</div>
</div>

<style>
	.ui-mdb {
		width: 100%;
		max-width: 720px;
		display: grid;
		gap: 10px;
		font-size: 11.5px;
	}
	.ui-mdb__t {
		display: block;
		font-size: 14px;
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-mdb__kpis {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.ui-mdb__kpis button {
		border: 0;
		font: inherit;
		color: var(--ag-subtle);
		text-align: left;
		padding: 12px 14px;
		display: grid;
		gap: 4px;
		justify-items: start;
		cursor: pointer;
	}
	.ui-mdb__kpis button[aria-selected='true'] {
		color: var(--ag-ink);
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 35%, transparent);
	}
	.ui-mdb__kpis b {
		font-size: 18px;
		font-weight: 500;
	}
	.ui-mdb__kpis button[aria-selected='false'] .ui-ag-pill {
		opacity: 0.5;
	}
	.ui-mdb__chart {
		padding: 12px;
		display: grid;
		gap: 10px;
	}
	.ui-mdb__chart label {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-mdb__plot {
		display: grid;
		grid-template-columns: 40px 1fr;
		height: 170px;
	}
	.ui-mdb__y {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	svg {
		width: 100%;
		height: 100%;
	}
	.ui-mdb__two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.ui-mdb__list {
		padding: 12px;
		display: grid;
		gap: 4px;
	}
	.ui-mdb__list b {
		font-weight: 500;
	}
	.ui-mdb__k {
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.ui-mdb__bar {
		position: relative;
		display: flex;
		justify-content: space-between;
		padding: 5px 6px;
	}
	.ui-mdb__bar i {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: 4px;
		background: color-mix(in srgb, var(--ag-blue) 9%, transparent);
	}
	.ui-mdb__bar span {
		position: relative;
	}
	.ui-mdb__bar span:last-child {
		color: var(--ag-muted);
	}
</style>
