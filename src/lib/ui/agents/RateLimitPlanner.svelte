<!-- Rate Limit Planner – scheduled agent runs against a tokens-per-minute limit: a usage curve with the peak, runs you can move in time, and "Spread out" to flatten the peak. -->
<script lang="ts" module>
	export type Run = { name: string; at: number; tokens: number; color: string; running?: boolean };
</script>

<script lang="ts">
	import './agents.css';
	let {
		limit = 120,
		now = 10.5,
		runs = $bindable([
			{ name: 'Inbox triage', at: 8, tokens: 46, color: '#9ca3af', running: true },
			{ name: 'Lead research', at: 13, tokens: 82, color: '#a855f7' },
			{ name: 'Report writer', at: 15.5, tokens: 74, color: '#14b8a6' },
			{ name: 'Code review', at: 18.5, tokens: 36, color: '#ec4899' }
		] as Run[])
	}: { limit?: number; now?: number; runs?: Run[] } = $props();
	const W = 400,
		H = 90,
		T0 = 6,
		T1 = 27;
	const tx = (h: number) => ((h - T0) / (T1 - T0)) * W;
	// Each run spikes then decays over a few hours
	const load = (h: number) => runs.reduce((s, r) => s + (h >= r.at ? r.tokens * Math.exp(-(h - r.at) / 1.6) * Math.min(1, (h - r.at) * 3) : 0), 0);
	const pts = $derived(Array.from({ length: 120 }, (_, i) => T0 + (i / 119) * (T1 - T0)).map((h) => [h, load(h)] as const));
	const peak = $derived(pts.reduce((m, p) => (p[1] > m[1] ? p : m), pts[0]));
	const y = (v: number) => H - (v / (limit * 1.15)) * H;
	const path = $derived(pts.map(([h, v], i) => `${i ? 'L' : 'M'}${tx(h).toFixed(1)},${y(v).toFixed(1)}`).join(''));
	const pct = $derived(Math.round((peak[1] / limit) * 100));
	const hm = (h: number) => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
	const move = (i: number, d: number) => (runs = runs.map((r, j) => (j === i ? { ...r, at: Math.max(now, Math.min(T1 - 2, r.at + d)) } : r)));
	function spread() {
		const free = runs.filter((r) => !r.running).sort((a, b) => a.at - b.at);
		const step = (T1 - 3 - Math.max(now, 12)) / Math.max(1, free.length);
		runs = runs.map((r) => (r.running ? r : { ...r, at: Math.max(now, 12) + free.indexOf(r) * step }));
	}
	function add() {
		runs = [...runs, { name: `Run ${runs.length + 1}`, at: Math.min(T1 - 3, now + 2), tokens: 30, color: '#f59e0b' }];
	}
</script>

<div class="ui-ag ui-ag-panel ui-rlp">
	<div class="ui-ag-head"><span class="ui-ag-grow"><b>Rate limit</b><small>{runs.length} runs · {Math.round(runs.reduce((s, r) => s + r.tokens, 0) / 6)}M tokens · {limit}k / min</small></span><span class="ui-ag-pill" data-tone={pct > 100 ? 'red' : pct >= 85 ? 'amber' : 'green'}>{pct > 100 ? `Over limit · peak ${pct}%` : pct >= 85 ? `Close to limit · peak ${pct}%` : `Under limit · peak ${pct}%`}</span><button class="ui-ag-btn" onclick={spread}>⤳ Spread out</button></div>
	<div class="ui-rlp__chart">
		<svg viewBox="0 0 {W} {H + 14}" role="img" aria-label="Token usage peaks at {pct}% of the limit at {hm(peak[0])}">
			<defs><linearGradient id="rlp-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a855f7" stop-opacity="0.25" /><stop offset="1" stop-color="#a855f7" stop-opacity="0" /></linearGradient></defs>
			<line x1="0" x2={W} y1={y(limit)} y2={y(limit)} stroke="var(--ag-red)" stroke-dasharray="3 3" opacity="0.6" />
			<line x1="0" x2={W} y1={y(limit * 0.8)} y2={y(limit * 0.8)} stroke="var(--ag-line)" stroke-dasharray="3 3" />
			<text x="0" y={y(limit) - 3} class="ui-rlp__lim">{limit}k</text>
			<path d="{path}L{W},{H}L0,{H}Z" fill="url(#rlp-g)" />
			<path d={path} fill="none" stroke="#a855f7" stroke-width="1.4" />
			<line x1={tx(now)} x2={tx(now)} y1="0" y2={H} stroke="var(--ag-ink)" stroke-width="0.6" />
			<text x={tx(now)} y="-3" text-anchor="middle">Now {hm(now)}</text>
			<g transform="translate({tx(peak[0])},{y(peak[1])})"><circle r="2.5" fill="#a855f7" /><text y="-6" text-anchor="middle">Peak {Math.round(peak[1])}k · {hm(peak[0])}</text></g>
			{#each [6, 9, 12, 15, 18, 21, 24] as h (h)}<text x={tx(h)} y={H + 12} text-anchor="middle">{hm(h)}</text>{/each}
		</svg>
	</div>
	<div class="ui-rlp__runs">
		{#each runs as r, i (r.name)}
			<div class="ui-rlp__run">
				<span class="ui-rlp__nm"><i style:background={r.color}></i>{r.name}</span>
				<span class="ui-rlp__at">{r.running ? 'Running' : hm(r.at)}</span>
				<span class="ui-rlp__track"><span class="ui-rlp__bar" style:left="{(tx(r.at) / W) * 100}%" style:width="{(r.tokens / 82) * 18}%" style:background="color-mix(in srgb, {r.color} 25%, transparent)">{r.tokens}k</span></span>
				{#if !r.running}<span class="ui-rlp__mv"><button class="ui-ag-btn" data-variant="ghost" aria-label="Earlier" onclick={() => move(i, -0.5)}>‹</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Later" onclick={() => move(i, 0.5)}>›</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {r.name}" onclick={() => (runs = runs.filter((x) => x.name !== r.name))}>×</button></span>{/if}
			</div>
		{/each}
		<button class="ui-rlp__add" onclick={add}>+ Add run</button>
	</div>
	<div class="ui-ag-foot ui-ag-muted"><small>Today's runs reach <b>{pct}%</b> of the limit at {hm(peak[0])}</small></div>
</div>

<style>
	.ui-rlp {
		max-width: 520px;
		font-size: 11.5px;
	}
	.ui-rlp b {
		font-weight: 500;
		color: var(--ag-ink);
	}
	.ui-ag-grow small {
		display: block;
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-rlp__chart {
		padding: 22px 12px 4px 12px;
	}
	svg {
		width: 100%;
		overflow: visible;
		font-size: 8px;
		fill: var(--ag-muted);
	}
	.ui-rlp__lim {
		fill: var(--ag-red);
	}
	.ui-rlp__runs {
		padding: 0 12px 8px;
	}
	.ui-rlp__run {
		display: grid;
		grid-template-columns: 110px 50px 1fr 66px;
		align-items: center;
		height: 26px;
		gap: 4px;
	}
	.ui-rlp__nm {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-rlp__nm i {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
	.ui-rlp__at {
		color: var(--ag-muted);
	}
	.ui-rlp__track {
		position: relative;
		height: 14px;
	}
	.ui-rlp__bar {
		position: absolute;
		top: 0;
		height: 14px;
		border-radius: 4px;
		font-size: 9.5px;
		text-align: right;
		padding-right: 4px;
		line-height: 14px;
		transition: left 0.3s var(--ag-ease);
	}
	.ui-rlp__mv {
		display: flex;
	}
	.ui-rlp__add {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		padding: 6px 0;
		cursor: pointer;
	}
</style>
