<script lang="ts" module>
	export type Lane = { id: string; name: string; model: string; badge?: 'idle' | 'needs'; runs: { label: string; from: number; to: number; tone: 'gray' | 'blue' | 'red' | 'amber' }[] };
</script>

<script lang="ts">
	import './agents.css';
	let {
		lanes = [
			{ id: 'r', name: 'Researcher', model: 'Opus 5.5', runs: [{ label: 'Competitor pricing', from: 5, to: 40, tone: 'gray' }, { label: 'Customer interviews', from: 63, to: 100, tone: 'blue' }] },
			{ id: 'w', name: 'Writer', model: 'Sonnet 5.5', runs: [{ label: 'Draft pricing page', from: 44, to: 100, tone: 'blue' }] },
			{ id: 'v', name: 'Reviewer', model: 'GPT-6 Sol', badge: 'idle', runs: [{ label: 'PR #482 billing', from: 0, to: 32, tone: 'gray' }] },
			{ id: 'o', name: 'Ops', model: 'Gemini 3.8 Flash', badge: 'needs', runs: [{ label: 'Sync CRM', from: 6, to: 28, tone: 'red' }, { label: 'Rotate API keys', from: 56, to: 100, tone: 'amber' }] }
		],
		range = '30m'
	}: { lanes?: Lane[]; range?: string } = $props();
	const ticks = ['-25m', '-20m', '-15m', '-10m', '-5m'];
	const running = $derived(lanes.filter((l) => l.runs.some((r) => r.to === 100 && r.tone === 'blue')).length);
	const needs = $derived(lanes.filter((l) => l.badge === 'needs').length);
</script>

<div class="ui-ag ui-agl ui-ag-card">
	<div class="ui-agl__bar">
		<span>✦ <b>Agents</b> <i class="b">● {running} running</i> <i class="a">● {needs} needs you</i></span>
		<span class="ui-ag-pill" data-tone="gray">Last {range}</span>
	</div>
	<div class="ui-agl__grid">
		<div class="ui-agl__axis"><span></span>{#each ticks as t (t)}<span>{t}</span>{/each}<span class="now">now</span></div>
		{#each lanes as l (l.id)}
			<div class="ui-agl__row">
				<div class="ui-agl__who">
					<b>{l.name}{#if l.badge === 'idle'}<em>Idle</em>{:else if l.badge === 'needs'}<em class="n">Needs you</em>{/if}</b><small>{l.model}</small>
				</div>
				<div class="ui-agl__track">
					{#each l.runs as r (r.label)}
						<span class="ui-agl__run" data-tone={r.tone} data-live={r.to === 100 || undefined} style:left="{r.from}%" style:width="{r.to - r.from}%">{r.label}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.ui-agl {
		width: 100%;
		max-width: 620px;
		font-size: 12px;
		overflow: hidden;
	}
	.ui-agl__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-agl__bar b {
		font-weight: 600;
		margin-right: 6px;
	}
	.ui-agl__bar i {
		font-style: normal;
		font-size: 11px;
		margin-right: 8px;
	}
	.ui-agl__bar .b {
		color: var(--ag-blue);
	}
	.ui-agl__bar .a {
		color: var(--ag-amber);
	}
	.ui-agl__grid {
		padding: 8px 14px 12px;
		display: grid;
		gap: 6px;
	}
	.ui-agl__axis {
		display: grid;
		grid-template-columns: 120px repeat(5, 1fr) 30px;
		font-size: 10px;
		color: var(--ag-subtle);
	}
	.ui-agl__axis .now {
		color: var(--ag-blue);
		font-weight: 600;
	}
	.ui-agl__row {
		display: grid;
		grid-template-columns: 120px 1fr;
		align-items: center;
		min-height: 34px;
	}
	.ui-agl__who {
		display: grid;
		line-height: 1.25;
	}
	.ui-agl__who b {
		font-weight: 500;
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.ui-agl__who em {
		font-style: normal;
		font-size: 9.5px;
		background: var(--ag-fill);
		color: var(--ag-muted);
		border-radius: 4px;
		padding: 0 4px;
	}
	.ui-agl__who em.n {
		background: color-mix(in srgb, var(--ag-amber) 15%, transparent);
		color: var(--ag-amber);
	}
	.ui-agl__who small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-agl__track {
		position: relative;
		height: 22px;
		background: repeating-linear-gradient(90deg, transparent 0 calc(20% - 1px), var(--ag-line) calc(20% - 1px) 20%);
	}
	.ui-agl__run {
		position: absolute;
		top: 0;
		height: 22px;
		border-radius: 6px;
		padding: 0 8px;
		display: flex;
		align-items: center;
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background: var(--ag-fill);
		color: var(--ag-muted);
		animation: ui-ag-in 0.5s var(--ag-ease) both;
	}
	.ui-agl__run[data-tone='blue'] {
		background: color-mix(in srgb, var(--ag-blue) 11%, transparent);
		color: var(--ag-blue);
	}
	.ui-agl__run[data-tone='red'] {
		background: color-mix(in srgb, var(--ag-red) 11%, transparent);
		color: var(--ag-red);
	}
	.ui-agl__run[data-tone='amber'] {
		background: color-mix(in srgb, var(--ag-amber) 13%, transparent);
		color: var(--ag-amber);
	}
	.ui-agl__run[data-live] {
		box-shadow: inset -2px 0 0 currentColor;
	}
</style>
