<!-- Experiment Card – an A/B test that unfolds on hover: variants with lifts on a metric switch with rolling numbers, and pick a winner. -->
<script lang="ts" module>
	export type Variant = { key: string; label: string; values: Record<string, number> };
</script>

<script lang="ts">
	import NumberTicker from '../motion/NumberTicker.svelte';
	import { onMount } from 'svelte';
	import { play } from '../agents/script';
	import '../agents/agents.css';
	let {
		title = 'Signup button copy',
		day = 9,
		days = 14,
		metrics = ['Conversion', 'Revenue', 'Bounce'],
		variants = [
			{ key: 'A', label: 'Start free trial', values: { Conversion: 4.1, Revenue: 13.54, Bounce: 38 } },
			{ key: 'B', label: 'Try it free', values: { Conversion: 4.3, Revenue: 14.18, Bounce: 36 } },
			{ key: 'C', label: 'Get started – $0', values: { Conversion: 4.9, Revenue: 15.58, Bounce: 33 } }
		],
		onpick
	}: { title?: string; day?: number; days?: number; metrics?: string[]; variants?: Variant[]; onpick?: (v: Variant) => void } = $props();
	let metric = $state('Conversion');
	let open = $state(false);
	onMount(() => play([[900, () => (open = true)], [2600, () => (metric = 'Revenue')], [2600, () => (open = false)], [1800, () => (metric = 'Conversion')]], { still: 2, loop: () => {} }));
	let winner = $state<string | null>(null);
	const base = $derived(variants[0].values[metric]);
	const lift = (v: Variant) => ((v.values[metric] - base) / base) * 100 * (metric === 'Bounce' ? -1 : 1);
	const best = $derived(variants.reduce((a, b) => (lift(b) > lift(a) ? b : a)));
	const max = $derived(Math.max(...variants.map((v) => v.values[metric])));
	const fmt = $derived(metric === 'Revenue' ? { style: 'currency', currency: 'USD' } : { maximumFractionDigits: 1 });
	const colors = ['#a3a3a3', '#2f6bff', '#9b51e0'];
</script>

<div class="ui-ag ui-ag-panel ui-exc" role="group" aria-label={title} onpointerenter={() => (open = true)} onfocusin={() => (open = true)}>
	<div class="ui-ag-body">
		<div class="ui-ag-row"><span class="ui-exc__ico">▮▮</span><span class="ui-ag-grow"><b>{title}</b><small><span style:color="var(--ag-green)">● {winner ? 'Finished' : 'Running'}</span> Day {day} of {days}</small></span><span class="ui-ag-pill" data-tone="green">{best.key} ↗ +{lift(best).toFixed(1)}%</span></div>
		{#if open}
			<div class="ui-ag-tabs ui-ag-in" role="tablist">{#each metrics as m (m)}<button class="ui-ag-tab" role="tab" aria-selected={metric === m} onclick={() => (metric = m)}>{m}</button>{/each}</div>
			{#each variants as v, i (v.key)}
				<button class="ui-exc__v ui-ag-in" aria-pressed={winner === v.key} onclick={() => ((winner = v.key), onpick?.(v))}>
					<span class="ui-exc__k" style:color={colors[i]}>{v.key}</span><span class="ui-ag-grow">{v.label}</span>
					<b><NumberTicker value={v.values[metric]} format={fmt as Intl.NumberFormatOptions} />{metric === 'Revenue' ? '' : '%'}</b>
					{#if i === 0}<span class="ui-ag-pill" data-tone="gray">Base</span>{:else}<span class="ui-ag-pill" data-tone={lift(v) >= 0 ? 'green' : 'red'}>{lift(v) >= 0 ? '+' : ''}{lift(v).toFixed(1)}%</span>{/if}
					<i style:width="{(v.values[metric] / max) * 100}%" style:background={colors[i]}></i>
				</button>
			{/each}
		{/if}
	</div>
	{#if open}<div class="ui-ag-foot" style:justify-content="flex-start"><small class="ui-ag-muted">{winner ? `Winner: ${variants.find((v) => v.key === winner)?.label}` : 'Pick a winner'}</small></div>{/if}
</div>

<style>
	.ui-exc {
		max-width: 270px;
		font-size: 12px;
	}
	.ui-exc__ico {
		width: 26px;
		height: 26px;
		border-radius: 7px;
		display: grid;
		place-items: center;
		background: var(--ag-fill);
		color: var(--ag-blue);
		font-size: 9px;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
		font-size: 12.5px;
	}
	.ui-ag-grow small {
		font-size: 11px;
		color: var(--ag-muted);
	}
	.ui-exc__v {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 2px 9px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
	}
	.ui-exc__v[aria-pressed='true'] {
		background: var(--ag-fill);
	}
	.ui-exc__v b {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.ui-exc__k {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		background: var(--ag-fill);
		font-size: 10px;
		display: grid;
		place-items: center;
		font-weight: 600;
	}
	.ui-exc__v i {
		position: absolute;
		left: 26px;
		bottom: 2px;
		max-width: calc(100% - 26px);
		height: 2px;
		border-radius: 1px;
		transition: width 0.5s var(--ag-ease);
	}
</style>
