<!-- Usage Meter – credits used this period split by feature, a per-day bar chart, seat/storage/project limits and an upgrade prompt. -->
<script lang="ts" module>
	export type Period = { label: string; used: number; parts: number[]; days: number[] };
</script>

<script lang="ts">
	import { series } from '../utils/chart';
	import NumberTicker from '../motion/NumberTicker.svelte';
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import '../agents/agents.css';
	let {
		product = 'Workspace AI',
		plan = 'Pro plan',
		resets = 'Resets in 9 days',
		limit = 10000,
		features = ['Chat', 'Search', 'Image', 'API'],
		periods = [
			{ label: 'This month', used: 7420, parts: [3980, 1640, 1120, 680], days: series(22, 7, 337, 200) },
			{ label: 'Last month', used: 10000, parts: [5210, 2140, 1690, 960], days: series(30, 3, 333, 180) },
			{ label: '7 days', used: 2310, parts: [1290, 520, 300, 200], days: series(7, 9, 330, 160) }
		] as Period[],
		limits = [
			{ name: 'Seats', used: 8, of: 10 as number | null, warn: true },
			{ name: 'Storage', used: 3.2, of: 5 as number | null, unit: ' GB' },
			{ name: 'Projects', used: 12, of: null as number | null }
		],
		onupgrade
	}: { product?: string; plan?: string; resets?: string; limit?: number; features?: string[]; periods?: Period[]; limits?: { name: string; used: number; of: number | null; unit?: string; warn?: boolean }[]; onupgrade?: () => void } = $props();
	let p = $state(0);
	let user = false;
	onMount(() => play([[3000, () => !user && (p = 1)], [3200, () => !user && (p = 0)]], { still: 0, loop: () => {} }));
	let day = $state<number | null>(null);
	const cur = $derived(periods[p]);
	const pct = $derived(Math.round((cur.used / limit) * 100));
	const shades = ['var(--ag-blue)', 'color-mix(in srgb, var(--ag-blue) 65%, var(--ag-surface))', 'color-mix(in srgb, var(--ag-blue) 40%, var(--ag-surface))', 'color-mix(in srgb, var(--ag-blue) 20%, var(--ag-surface))'];
	const max = $derived(Math.max(...cur.days));
	const avg = $derived(Math.round(cur.days.reduce((a, b) => a + b, 0) / cur.days.length));
</script>

<div class="ui-ag ui-ag-panel ui-um">
	<div class="ui-ag-head"><span class="ui-ag-grow"><b>{product}</b><small>{plan} · {resets}</small></span><div class="ui-ag-tabs" role="tablist">{#each periods as x, i (x.label)}<button class="ui-ag-tab" role="tab" aria-selected={p === i} onclick={() => ((p = i), (day = null), (user = true))}>{x.label}</button>{/each}</div></div>
	<div class="ui-ag-body">
		<div class="ui-ag-row ui-um__total"><b><NumberTicker value={cur.used} /></b><span class="ui-ag-muted ui-ag-grow">of {limit.toLocaleString('en-US')} credits</span><span class="ui-ag-pill" data-tone={pct >= 100 ? 'red' : pct >= 70 ? 'amber' : 'gray'}>{pct >= 100 ? '● ' : ''}{pct}%</span></div>
		<div class="ui-um__stack" role="img" aria-label="{pct}% of credits used">{#each cur.parts as v, i (i)}<i style:width="{(v / limit) * 100}%" style:background={shades[i]}></i>{/each}</div>
		<div class="ui-um__rows">{#each features as f, i (f)}<div><i style:background={shades[i]}></i><span class="ui-ag-grow">{f}</span><b>{cur.parts[i].toLocaleString('en-US')}</b><small>{Math.round((cur.parts[i] / cur.used) * 100)}%</small></div>{/each}</div>
		<div class="ui-ag-row"><small class="ui-um__h ui-ag-grow">Per day</small><small class="ui-ag-muted">{day === null ? 'Avg' : `Day ${day + 1}`} <b>{day === null ? avg : Math.round(cur.days[day])}</b> / day</small></div>
		<div class="ui-um__bars" role="group" aria-label="Credits per day" onpointerleave={() => (day = null)}>{#each cur.days as v, i (i)}<button aria-label="Day {i + 1}: {Math.round(v)} credits" style:height="{(v / max) * 100}%" data-on={day === i || undefined} onpointerenter={() => (day = i)} onfocus={() => (day = i)}></button>{/each}</div>
		<div class="ui-um__lims">
			{#each limits as l (l.name)}<div><small>{l.name} {#if l.warn}<span style:color="var(--ag-amber)">●</span>{/if}</small><span><b>{l.used}</b> <span class="ui-ag-muted">of {l.of === null ? '∞' : `${l.of}${l.unit ?? ''}`}</span></span><span class="ui-um__lim" data-inf={l.of === null || undefined}><i style:width="{l.of ? (l.used / l.of) * 100 : 0}%" style:background={l.warn ? 'var(--ag-amber)' : 'var(--ag-blue)'}></i></span></div>{/each}
		</div>
	</div>
	<div class="ui-ag-foot">{#if cur.used >= limit}<small class="ui-ag-grow" style:color="var(--ag-red)">● Limit reached</small><button class="ui-ag-btn" data-variant="primary" onclick={() => onupgrade?.()}>Add credits</button>{:else}<small class="ui-ag-grow ui-ag-muted">{Math.max(0, limit - cur.used).toLocaleString('en-US')} credits left</small><button class="ui-ag-btn" onclick={() => onupgrade?.()}>Upgrade</button>{/if}</div>
</div>

<style>
	.ui-um {
		max-width: 360px;
		font-size: 12px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-ag-grow small {
		display: block;
	}
	.ui-ag-body {
		display: grid;
		gap: 10px;
	}
	.ui-um__total b {
		font-size: 22px;
		letter-spacing: -0.02em;
	}
	.ui-um__stack {
		display: flex;
		gap: 2px;
		height: 6px;
		border-radius: 3px;
		background: var(--ag-fill);
		overflow: hidden;
	}
	.ui-um__stack i {
		transition: width 0.4s var(--ag-ease);
	}
	.ui-um__rows {
		display: grid;
		gap: 6px;
	}
	.ui-um__rows div {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-um__rows i {
		width: 7px;
		height: 7px;
		border-radius: 2px;
	}
	.ui-um__rows small {
		width: 30px;
		text-align: right;
	}
	.ui-um__h {
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.ui-um__bars {
		display: flex;
		align-items: end;
		gap: 2px;
		height: 32px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-um__bars button {
		flex: 1;
		min-height: 2px;
		border: 0;
		padding: 0;
		border-radius: 2px 2px 0 0;
		background: var(--ag-line);
		cursor: pointer;
	}
	.ui-um__bars button[data-on] {
		background: var(--ag-blue);
	}
	.ui-um__lims {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		border-top: 1px solid var(--ag-line);
		padding-top: 10px;
	}
	.ui-um__lims div {
		display: grid;
		gap: 3px;
	}
	.ui-um__lim {
		height: 3px;
		border-radius: 2px;
		background: var(--ag-fill);
		overflow: hidden;
	}
	.ui-um__lim i {
		display: block;
		height: 100%;
	}
	.ui-um__lim[data-inf] {
		background: repeating-linear-gradient(90deg, var(--ag-line) 0 4px, transparent 4px 7px);
	}
</style>
