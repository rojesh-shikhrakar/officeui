<!-- Date Range Picker – presets and two calendars with a hover preview, comparison with the previous period or year, full keyboard control. -->
<script lang="ts">
	import '../agents/agents.css';
	let {
		start = $bindable(new Date(2026, 9, 14)),
		end = $bindable(new Date(2026, 10, 12)),
		today = new Date(2026, 10, 12),
		onapply
	}: { start?: Date; end?: Date; today?: Date; onapply?: (r: { start: Date; end: Date; compare: string }) => void } = $props();
	const day = 864e5;
	const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
	let open = $state(true);
	let a = $state<Date | null>(null);
	let hover = $state<Date | null>(null);
	let compare = $state('off');
	// svelte-ignore state_referenced_locally
	let month = $state(new Date(end.getFullYear(), end.getMonth() - 1, 1));
	const fmt = (d: Date, y = false) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(y ? { year: 'numeric' } : {}) });
	const presets: [string, () => [Date, Date]][] = [
		['Today', () => [today, today]],
		['Yesterday', () => [new Date(+today - day), new Date(+today - day)]],
		['Last 7 days', () => [new Date(+today - 6 * day), today]],
		['Last 30 days', () => [new Date(+today - 29 * day), today]],
		['Last 90 days', () => [new Date(+today - 89 * day), today]],
		['This month', () => [new Date(today.getFullYear(), today.getMonth(), 1), today]],
		['Last month', () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)]],
		['Year to date', () => [new Date(today.getFullYear(), 0, 1), today]]
	];
	const days = $derived(Math.round((+strip(end) - +strip(start)) / day) + 1);
	function weeks(m: Date) {
		const first = new Date(m.getFullYear(), m.getMonth(), 1);
		const offset = (first.getDay() + 6) % 7;
		const n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
		return Array.from({ length: Math.ceil((offset + n) / 7) * 7 }, (_, i) => (i < offset || i >= offset + n ? null : new Date(m.getFullYear(), m.getMonth(), i - offset + 1)));
	}
	const lo = $derived(a ? (hover && hover < a ? hover : a) : start);
	const hi = $derived(a ? (hover && hover > a ? hover : a) : end);
	function click(d: Date) {
		if (d > today) return;
		if (!a) return void (a = d);
		[start, end] = d < a ? [d, a] : [a, d];
		a = null;
	}
	function preset(f: () => [Date, Date]) {
		[start, end] = f();
		a = null;
		month = new Date(end.getFullYear(), end.getMonth() - 1, 1);
	}
	const active = $derived(presets.find(([, f]) => +strip(f()[0]) === +strip(start) && +strip(f()[1]) === +strip(end))?.[0]);
	const m2 = $derived(new Date(month.getFullYear(), month.getMonth() + 1, 1));
</script>

<div class="ui-ag ui-drp">
	<button class="ui-ag-btn ui-drp__trigger" aria-expanded={open} onclick={() => (open = !open)}>▦ {fmt(start)} – {fmt(end, true)} {open ? '⌃' : '⌄'}</button>
	{#if open}
		<div class="ui-ag-panel ui-drp__pop ui-ag-in">
			<div class="ui-drp__main">
				<div class="ui-drp__presets">{#each presets as [label, f] (label)}<button aria-pressed={active === label} onclick={() => preset(f)}>{label}</button>{/each}<button disabled>Custom</button></div>
				<div class="ui-drp__cals">
					{#each [month, m2] as m, k (k)}
						<div class="ui-drp__cal">
							<header>{#if k === 0}<button aria-label="Previous month" onclick={() => (month = new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>{/if}<b>{m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b>{#if k === 1}<button aria-label="Next month" onclick={() => (month = new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>{/if}</header>
							<div class="ui-drp__grid" role="grid">
								{#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as w (w)}<small>{w}</small>{/each}
								{#each weeks(m) as d, i (i)}
									{#if d}
										<button
											role="gridcell"
											aria-label={fmt(d, true)}
											aria-selected={+d === +strip(lo) || +d === +strip(hi)}
											data-edge={+d === +strip(lo) || +d === +strip(hi) || undefined}
											data-in={(d >= strip(lo) && d <= strip(hi)) || undefined}
											disabled={d > today}
											onclick={() => click(d)}
											onpointerenter={() => (hover = d)}>{d.getDate()}</button
										>
									{:else}<span></span>{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="ui-ag-foot ui-drp__foot">
				<b>{fmt(lo)} – {fmt(hi, true)}</b><span class="ui-ag-muted">{days} days</span>
				<span class="ui-ag-muted ui-drp__cmp">Compare <span class="ui-ag-tabs">{#each [['off', 'Off'], ['period', 'Previous period'], ['year', 'Previous year']] as [v, l] (v)}<button class="ui-ag-tab" aria-pressed={compare === v} onclick={() => (compare = v)}>{l}</button>{/each}</span></span>
				<button class="ui-ag-btn" data-variant="ghost" onclick={() => (open = false)}>Cancel</button>
				<button class="ui-ag-btn" data-variant="primary" onclick={() => ((open = false), onapply?.({ start, end, compare }))}>Apply</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.ui-drp {
		width: 100%;
		max-width: 540px;
		font-size: 12px;
		display: grid;
		gap: 6px;
		justify-items: start;
	}
	.ui-drp__pop {
		max-width: none;
	}
	.ui-drp__main {
		display: flex;
	}
	.ui-drp__presets {
		display: grid;
		align-content: start;
		gap: 1px;
		padding: 8px;
		border-right: 1px solid var(--ag-line);
		width: 120px;
		flex: none;
	}
	.ui-drp__presets button {
		border: 0;
		background: none;
		font: inherit;
		text-align: left;
		padding: 5px 8px;
		border-radius: 6px;
		color: var(--ag-ink);
		cursor: pointer;
	}
	.ui-drp__presets button[aria-pressed='true'],
	.ui-drp__presets button:hover:not(:disabled) {
		background: var(--ag-fill);
	}
	.ui-drp__presets button:disabled {
		color: var(--ag-subtle);
	}
	.ui-drp__cals {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding: 10px 14px;
	}
	header {
		display: flex;
		justify-content: center;
		position: relative;
		margin-bottom: 6px;
	}
	header b {
		font-weight: 500;
	}
	header button {
		position: absolute;
		left: 0;
		border: 0;
		background: none;
		cursor: pointer;
		color: var(--ag-muted);
	}
	header b + button {
		left: auto;
		right: 0;
	}
	.ui-drp__grid {
		display: grid;
		grid-template-columns: repeat(7, 26px);
		gap: 1px;
		text-align: center;
	}
	.ui-drp__grid small {
		font-size: 9.5px;
		color: var(--ag-subtle);
		padding-bottom: 3px;
	}
	.ui-drp__grid button {
		height: 26px;
		border: 0;
		background: none;
		font: inherit;
		font-size: 11.5px;
		color: var(--ag-ink);
		cursor: pointer;
		border-radius: 5px;
	}
	.ui-drp__grid button[data-in] {
		background: var(--ag-fill);
	}
	.ui-drp__grid button[data-edge] {
		background: var(--aui-primary, #171717);
		color: var(--aui-on-primary, #fafafa);
	}
	.ui-drp__grid button:disabled {
		color: var(--ag-subtle);
		cursor: default;
	}
	.ui-drp__foot {
		flex-wrap: wrap;
		justify-content: flex-start;
	}
	.ui-drp__foot b {
		font-weight: 500;
	}
	.ui-drp__cmp {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-right: auto;
	}
</style>
