<!-- KPI Chart – a headline number with its change and a multi-line chart; hover to read every series on a day, click the legend to hide one. -->
<script lang="ts" module>
	export type Line = { name: string; color: string; values: number[] };
</script>

<script lang="ts">
	import { linePath, series } from '../agents/chart';
	import '../agents/agents.css';
	let {
		title = 'Revenue',
		value = '$96.4k',
		delta = '+$7.9k',
		caption = 'Top 5 channels',
		days = ['Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7', 'Mar 8', 'Mar 9'],
		lines = [
			{ name: 'Search', color: '#4f9cf9', values: series(7, 1, 4.4, 1.6) },
			{ name: 'Social', color: '#ec4899', values: series(7, 2, 4, 1.2) },
			{ name: 'Email', color: '#a855f7', values: series(7, 3, 2, 0.8) },
			{ name: 'Referral', color: '#10b981', values: series(7, 4, 1.6, 0.8) },
			{ name: 'Direct', color: '#9ca3af', values: series(7, 5, 0.9, 0.6) }
		] as Line[],
		max = 6,
		unit = (v: number) => `$${v.toFixed(1)}k`
	}: { title?: string; value?: string; delta?: string; caption?: string; days?: string[]; lines?: Line[]; max?: number; unit?: (v: number) => string } = $props();
	const W = 300,
		H = 100;
	let hidden = $state<Set<string>>(new Set());
	let at = $state<number | null>(null);
	const toggle = (n: string) => {
		const s = new Set(hidden);
		if (s.has(n)) s.delete(n);
		else s.add(n);
		hidden = s;
	};
	function move(e: PointerEvent) {
		const r = (e.currentTarget as SVGElement).getBoundingClientRect();
		at = Math.round(((e.clientX - r.left) / r.width) * (days.length - 1));
	}
</script>

<div class="ui-ag ui-ag-panel ui-kpi">
	<div class="ui-ag-body">
		<div>{title}</div>
		<div class="ui-kpi__val"><b>{value}</b><span class="ui-ag-pill" data-tone="green">{delta}</span></div>
		<div class="ui-kpi__chart">
			<div class="ui-kpi__y"><span>${max}k</span><span>${max / 2}k</span><span>$0</span></div>
			<svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="{title} by channel" onpointermove={move} onpointerleave={() => (at = null)}>
				{#each lines as l (l.name)}{#if !hidden.has(l.name)}<path class="ui-kpi__line" d={linePath(l.values, W, H, max)} fill="none" stroke={l.color} stroke-width="1.6" vector-effect="non-scaling-stroke" pathLength="100" />{/if}{/each}
				{#if at !== null}<line x1={(at / (days.length - 1)) * W} x2={(at / (days.length - 1)) * W} y1="0" y2={H} stroke="var(--ag-line)" vector-effect="non-scaling-stroke" />{/if}
			</svg>
			{#if at !== null}
				<div class="ui-kpi__tip" style:left="calc(36px + {(at / (days.length - 1)) * 100}% * (1 - 36 / 100))">
					<b>{days[at]}</b>{#each lines.filter((l) => !hidden.has(l.name)) as l (l.name)}<span><i style:background={l.color}></i>{l.name}<b>{unit(l.values[at])}</b></span>{/each}
				</div>
			{/if}
		</div>
		<div class="ui-kpi__x"><span>{days[0]}</span><span>{days[Math.floor(days.length / 2)]}</span><span>{days[days.length - 1]}</span></div>
	</div>
	<div class="ui-ag-foot ui-kpi__leg">
		<span class="ui-ag-muted ui-ag-grow">{caption}</span>
		{#each lines as l (l.name)}<button aria-pressed={!hidden.has(l.name)} onclick={() => toggle(l.name)}><i style:background={l.color}></i>{l.name}</button>{/each}
	</div>
</div>

<style>
	.ui-kpi__line {
		stroke-dasharray: 100;
		animation: ui-kpi-draw 1.2s var(--ag-ease) both;
	}
	@keyframes ui-kpi-draw {
		from {
			stroke-dashoffset: 100;
		}
	}
	.ui-kpi {
		max-width: 360px;
		font-size: 13px;
	}
	.ui-kpi__val {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 2px 0 10px;
	}
	.ui-kpi__val b {
		font-size: 22px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.ui-kpi__chart {
		position: relative;
		display: grid;
		grid-template-columns: 30px 1fr;
		gap: 6px;
		height: 110px;
	}
	.ui-kpi__y {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 10.5px;
		color: var(--ag-muted);
	}
	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		background: repeating-linear-gradient(to bottom, var(--ag-line) 0 1px, transparent 1px 50%);
		background-size: 100% 50%;
	}
	.ui-kpi__x {
		display: flex;
		justify-content: space-between;
		padding-left: 36px;
		margin-top: 6px;
		font-size: 10.5px;
		color: var(--ag-muted);
	}
	.ui-kpi__tip {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: grid;
		gap: 2px;
		padding: 6px 8px;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 6px 16px -6px rgba(0, 0, 0, 0.2);
		font-size: 10.5px;
		pointer-events: none;
		white-space: nowrap;
	}
	.ui-kpi__tip span {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.ui-kpi__tip span b {
		margin-left: auto;
		padding-left: 10px;
		font-weight: 500;
	}
	i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		display: inline-block;
	}
	.ui-kpi__leg {
		flex-wrap: wrap;
		gap: 4px;
	}
	.ui-kpi__leg button {
		border: 0;
		background: none;
		font: inherit;
		font-size: 10.5px;
		color: var(--ag-muted);
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 5px;
	}
	.ui-kpi__leg button[aria-pressed='false'] {
		opacity: 0.4;
	}
	.ui-kpi__leg .ui-ag-grow {
		flex-basis: 100%;
	}
</style>
