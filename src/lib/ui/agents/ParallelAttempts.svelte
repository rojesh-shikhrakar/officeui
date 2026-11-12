<!-- Parallel Attempts – an agent tries the same task several ways at once and the best one wins: every attempt races as a row with its model, approach and live bar, then gets a score; the best is put in use, a failed one says why, and you can pick another. -->
<script lang="ts" module>
	export type Attempt = { model: string; mark: string; color: string; idea: string; file: string; rate: number; cost: number; score: number; fails?: string; result: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from './script';
	import './agents.css';
	let {
		task = 'Fix the flaky checkout test',
		attempts = [
			{ model: 'Atlas Max', mark: '✳', color: '#d97757', idea: 'Add a retry with backoff', file: 'checkout.spec.ts', rate: 5, cost: 0.31, score: 78, result: '20/20 runs green · adds 1.4s per test' },
			{ model: 'Orbit Pro', mark: '◎', color: '#171717', idea: 'Mock the payment API', file: 'payment.ts', rate: 7, cost: 0.27, score: 94, result: '20/20 runs green · suite 30% faster' },
			{ model: 'Prism Ultra', mark: '✦', color: '#3b82f6', idea: 'Wait for the network to settle', file: 'checkout.spec.ts', rate: 6, cost: 0.18, score: 0, fails: 'Still flaky · 3 of 20 runs failed', result: '' }
		] as Attempt[],
		start = [13, 17, 12],
		autoplay = true,
		onpick
	}: { task?: string; attempts?: Attempt[]; start?: number[]; autoplay?: boolean; onpick?: (a: Attempt) => void } = $props();
	// svelte-ignore state_referenced_locally
	let pct = $state<number[]>(attempts.map((_, i) => start[i] ?? 0));
	// svelte-ignore state_referenced_locally
	let secs = $state(attempts.map(() => 0));
	let picked = $state<number | null>(null);
	const finished = (i: number) => pct[i] >= 100;
	const done = $derived(pct.filter((p) => p >= 100).length);
	const spent = $derived(pct.reduce((s, p, i) => s + (Math.min(p, 100) / 100) * attempts[i].cost, 0));
	const best = $derived(done === attempts.length ? attempts.reduce((b, a, i) => (a.score > attempts[b].score ? i : b), 0) : -1);
	const inUse = $derived(picked ?? best);
	$effect(() => {
		if (best >= 0 && picked === null) onpick?.(attempts[best]);
	});
	onMount(() =>
		tick(400, () => {
			pct = pct.map((p, i) => (p >= 100 ? p : Math.min(100, p + Math.random() * attempts[i].rate)));
			secs = secs.map((t, i) => (pct[i] >= 100 ? t : t + 0.4));
		})
	);
	const clock = (s: number) => `${Math.floor(s / 60) ? Math.floor(s / 60) + 'm ' : ''}${Math.round(s % 60 + 36)}s`;
	const runs = (i: number) => Math.floor((pct[i] / 100) * 20);
</script>

<div class="ui-ag ui-pa">
	<div class="ui-ag-title"><span style:color="var(--ag-blue)">☰</span><b>Best of {attempts.length}</b><span class="ui-ag-muted">{task}</span><span class="ui-ag-meta"><b style:color="var(--ag-ink)">{done}</b> of {attempts.length} done &nbsp; <b style:color="var(--ag-ink)">${spent.toFixed(2)}</b></span></div>
	{#each attempts as a, i (a.model)}
		{@const f = finished(i)}
		<div class="ui-ag-card ui-pa__row" data-best={inUse === i || undefined} data-fail={f && a.fails ? '' : undefined} data-dim={best >= 0 && inUse !== i || undefined}>
			<span class="ui-pa__mk" style:color={a.color}>{a.mark}</span>
			<span class="ui-pa__t"><span><b>{a.model}</b> <span class="ui-ag-muted">· {a.idea}</span></span><small data-state={f ? (a.fails ? 'fail' : 'ok') : 'run'}>{#if !f}{pct[i] < 30 ? `Reading ${a.file}` : `Running tests ${runs(i)}/20`}{:else if a.fails}{a.fails}{:else}{a.result}{/if}</small></span>
			<span class="ui-ag-bar ui-pa__bar" data-state={f ? (a.fails ? 'fail' : inUse === i ? 'best' : 'ok') : 'run'}><i style:width="{Math.min(100, pct[i])}%"></i></span>
			<span class="ui-pa__n">
				{#if !f}<span>{Math.floor(pct[i])}%</span><small>${((pct[i] / 100) * a.cost).toFixed(2)}</small>
				{:else if a.fails}<span style:color="var(--ag-red)">Failed</span><small>{clock(secs[i])} · ${a.cost.toFixed(2)}</small>
				{:else}<span>{#if inUse === i}<span class="ui-ag-pill" data-tone="green">Best</span> {/if}<b>{a.score}</b></span>{#if inUse === i}<small style:color="var(--ag-green)">✓ In use</small>{:else}<button class="ui-ag-btn" data-variant="ghost" onclick={() => ((picked = i), onpick?.(a))}>Use this</button>{/if}{/if}
			</span>
		</div>
	{/each}
</div>

<style>
	.ui-pa {
		width: 100%;
		max-width: 540px;
		display: grid;
		gap: 6px;
		font-size: 12px;
	}
	.ui-pa__row {
		display: grid;
		grid-template-columns: 26px minmax(0, 1.3fr) 1fr 76px;
		gap: 12px;
		align-items: center;
		padding: 10px 12px;
		transition:
			opacity 0.4s,
			box-shadow 0.3s;
	}
	.ui-pa__row[data-dim] {
		opacity: 0.55;
	}
	.ui-pa__row[data-best] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-green) 50%, transparent),
			0 6px 18px -8px color-mix(in srgb, var(--ag-green) 60%, transparent);
	}
	.ui-pa__mk {
		width: 24px;
		height: 24px;
		border-radius: 7px;
		display: grid;
		place-items: center;
		box-shadow: 0 0 0 1px var(--ag-line);
	}
	.ui-pa__t {
		display: grid;
		min-width: 0;
	}
	.ui-pa__t > span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-pa__t b {
		font-weight: 500;
	}
	.ui-pa__t small {
		font-size: 11px;
		color: var(--ag-blue);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-pa__t small[data-state='ok'] {
		color: var(--ag-muted);
	}
	.ui-pa__t small[data-state='fail'] {
		color: var(--ag-red);
	}
	.ui-pa__bar i {
		background: linear-gradient(90deg, color-mix(in srgb, var(--ag-blue) 30%, transparent), color-mix(in srgb, var(--ag-blue) 60%, transparent), color-mix(in srgb, var(--ag-blue) 30%, transparent)) 0 0 / 200% 100%;
		animation: ui-ag-sheen 1.8s linear infinite;
		transition: width 0.4s var(--ag-ease);
	}
	.ui-pa__bar[data-state='ok'] i {
		background: color-mix(in srgb, var(--ag-green) 30%, transparent);
		animation: none;
	}
	.ui-pa__bar[data-state='best'] i {
		background: color-mix(in srgb, var(--ag-green) 55%, transparent);
		animation: none;
	}
	.ui-pa__bar[data-state='fail'] i {
		background: color-mix(in srgb, var(--ag-red) 30%, transparent);
		animation: none;
	}
	.ui-pa__n {
		display: grid;
		justify-items: end;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.ui-pa__n small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-pa__n b {
		font-weight: 500;
		font-size: 13px;
	}
	.ui-pa__n .ui-ag-btn {
		padding: 1px 6px;
		font-size: 10.5px;
	}
</style>
