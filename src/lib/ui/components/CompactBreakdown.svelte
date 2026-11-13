<!-- Compact Breakdown – a total split into its parts in one small card: numbers roll, the bar glides and ranked rows trade places when the range changes. -->
<script lang="ts" module>
	export type BreakdownPart = { label: string; values: Record<string, number>; color: string };
</script>

<script lang="ts">
	import { flip } from 'svelte/animate';
	import NumberTicker from '../motion/NumberTicker.svelte';
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import '../agents/agents.css';
	let {
		title = 'Revenue by channel',
		ranges = ['7d', '30d', '90d'],
		range = $bindable('7d'),
		parts = [
			{ label: 'Organic search', values: { '7d': 4100, '30d': 18381, '90d': 51200 }, color: '#5b9cf6' },
			{ label: 'Direct', values: { '7d': 4600, '30d': 16884, '90d': 47800 }, color: '#2f6bff' },
			{ label: 'Social', values: { '7d': 2900, '30d': 9789, '90d': 31000 }, color: '#bcd6fb' },
			{ label: 'Referrals', values: { '7d': 1500, '30d': 7293, '90d': 19900 }, color: '#93bdf8' },
			{ label: 'Email', values: { '7d': 1300, '30d': 5194, '90d': 13600 }, color: '#d4d4d4' }
		],
		change = { '7d': 2.4, '30d': 8.1, '90d': 14.7 } as Record<string, number>
	}: { title?: string; ranges?: string[]; range?: string; parts?: BreakdownPart[]; change?: Record<string, number> } = $props();
	const ranked = $derived([...parts].sort((a, b) => b.values[range] - a.values[range]));
	const total = $derived(parts.reduce((s, p) => s + p.values[range], 0));
	let user = false;
	onMount(() => play([[2600, () => !user && (range = '30d')], [3000, () => !user && (range = '7d')]], { still: 0, loop: () => {} }));
</script>

<div class="ui-ag ui-ag-panel ui-ckb">
	<div class="ui-ag-head"><b>{title}</b><div class="ui-ag-tabs" role="tablist">{#each ranges as r (r)}<button class="ui-ag-tab" role="tab" aria-selected={range === r} onclick={() => ((range = r), (user = true))}>{r}</button>{/each}</div></div>
	<div class="ui-ag-body">
		<div class="ui-ckb__total"><NumberTicker value={total} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} /><span class="ui-ag-pill" data-tone="green">↑ {change[range]}%</span></div>
		<small class="ui-ag-muted">Total revenue</small>
		<div class="ui-ckb__bar">{#each parts as p (p.label)}<i style:flex={p.values[range]} style:background={p.color}></i>{/each}</div>
		<ul class="ui-ag-list">
			{#each ranked as p (p.label)}
				<li class="ui-ckb__row" animate:flip={{ duration: 400 }}><i style:background={p.color}></i><span class="ui-ag-grow">{p.label}</span><b>${p.values[range].toLocaleString('en-US')}</b><small>{Math.round((p.values[range] / total) * 100)}%</small></li>
			{/each}
		</ul>
	</div>
	<div class="ui-ag-foot" style:justify-content="flex-start"><small class="ui-ag-muted">Largest: <b style:color="var(--ag-ink)">{ranked[0].label}</b></small></div>
</div>

<style>
	.ui-ckb {
		max-width: 290px;
		font-size: 12px;
	}
	.ui-ckb__total {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 22px;
		font-weight: 600;
	}
	.ui-ckb__bar {
		display: flex;
		gap: 2px;
		height: 5px;
		margin: 6px 0;
	}
	.ui-ckb__bar i {
		border-radius: 2px;
		transition: flex 0.6s var(--ag-ease);
	}
	.ui-ckb__row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		font-variant-numeric: tabular-nums;
	}
	.ui-ckb__row i {
		width: 7px;
		height: 7px;
		border-radius: 2px;
	}
	.ui-ckb__row b {
		font-weight: 500;
	}
	.ui-ckb__row small {
		width: 32px;
		text-align: right;
		color: var(--ag-muted);
	}
</style>
