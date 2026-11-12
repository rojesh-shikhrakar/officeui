<!-- Fallback Chain – one request finding a model that answers, as a small flow: it tries each model in its chain, rate limits fall through, the first answer wins. -->
<script lang="ts" module>
	export type ChainModel = { name: string; provider: string; outcome: 'fail' | 'ok' | 'wait'; reason?: string; ms?: number; cost?: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let {
		task = 'Summarize support ticket',
		route = 'router/auto',
		models = [
			{ name: 'Atlas Max', provider: 'Cloud A', outcome: 'fail', reason: 'Rate limited · 429', ms: 1600, cost: 0 },
			{ name: 'Orbit Pro', provider: 'Cloud B', outcome: 'fail', reason: 'Timed out', ms: 5000, cost: 0.0006 },
			{ name: 'Prism Pro', provider: 'Cloud C', outcome: 'ok', reason: 'Answered · 412 tokens', ms: 1900, cost: 0.0021 },
			{ name: 'Nova 4', provider: 'Cloud D', outcome: 'wait' }
		] as ChainModel[],
		autoplay = true
	}: { task?: string; route?: string; models?: ChainModel[]; autoplay?: boolean } = $props();
	let step = $state(0);
	let replay = $state(0);
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return void (step = 99);
		const t = setInterval(() => (step < models.length + 1 ? (step += 1) : null), 1500);
		return () => clearInterval(t);
	});
	const winner = $derived(models.findIndex((m) => m.outcome === 'ok'));
	const stateOf = (i: number) => (i < step ? (models[i].outcome === 'fail' ? 'fail' : models[i].outcome === 'ok' ? 'ok' : 'skip') : i === step ? 'try' : 'next');
	const answered = $derived(step > winner && winner >= 0);
	const tried = $derived(models.slice(0, Math.min(step, winner + 1)));
	const secs = $derived(tried.reduce((n, m) => n + (m.ms ?? 0), 0) / 1000);
	const spent = $derived(tried.reduce((n, m) => n + (m.cost ?? 0), 0));
	const ys = $derived(models.map((_, i) => ((i + 0.5) / models.length) * 100));
	const wire = (i: number) => {
		const st = step > winner && i > winner ? 'skip' : stateOf(i);
		return st === 'fail' ? 'fail' : st === 'ok' ? 'ok' : st === 'try' ? 'try' : 'idle';
	};
</script>

<div class="ui-ag ui-fbc">
	<div class="ui-fbc__bar"><b>{task}</b>{#if answered}<small style:color="var(--ag-green)">● Answered</small>{:else}<small class="ui-ag-muted"><span style:color="var(--ag-blue)">●</span> Attempt {Math.min(step + 1, winner + 1)} of {models.length}</small>{/if}<small class="ui-ag-muted">◷ {secs.toFixed(1)}s</small><small class="ui-ag-muted">${spent.toFixed(4)}</small><button class="ui-ag-btn" data-variant="ghost" onclick={() => ((step = 0), (replay += 1))}>↻ Replay</button></div>
	<div class="ui-fbc__flow ui-ag-card">
		<div class="ui-ag-card ui-fbc__node">⇢ <span><b>Request</b><small>{route}</small></span></div>
		<svg class="ui-fbc__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{#each ys as y, i (i)}<path d="M0,50 C50,50 50,{y} 100,{y}" data-w={wire(i)} vector-effect="non-scaling-stroke" />{/each}</svg>
		<div class="ui-fbc__models">
			{#each models as m, i (m.name)}
				{@const s = step > winner && i > winner ? 'skip' : stateOf(i)}
				<div class="ui-ag-card ui-fbc__m" data-s={s}>
					<span class="ui-fbc__n">{i + 1}</span>
					<span class="ui-ag-grow"><b>{m.name} <small class="ui-ag-muted">{m.provider}</small></b><small>{s === 'fail' ? m.reason : s === 'ok' ? 'Answered' : s === 'try' ? 'Trying…' : s === 'skip' ? 'Not needed' : i === step + 1 ? 'Up next' : 'Waiting'}</small></span>
					{#if s === 'fail' || s === 'ok'}<small class="ui-ag-muted">{m.ms}ms<br />${m.cost}</small>{/if}
					{#if s === 'try'}<span class="ui-fbc__dots"><i></i><i></i><i></i></span><span class="ui-fbc__tok"></span>{/if}
				</div>
			{/each}
		</div>
		<svg class="ui-fbc__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{#each ys as y, i (i)}<path d="M0,{y} C50,{y} 50,50 100,50" data-w={answered && i === winner ? 'ok' : 'idle'} vector-effect="non-scaling-stroke" />{/each}</svg>
		<div class="ui-ag-card ui-fbc__node" data-done={answered || undefined}>▤ <span><b>Response</b><small>{answered ? `From ${models[winner].name}` : 'Waiting…'}</small></span></div>
	</div>
</div>

<style>
	.ui-fbc__wires {
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: none;
		stroke-width: 1.3;
	}
	.ui-fbc__wires path {
		stroke: var(--ag-line);
		transition: stroke 0.3s;
	}
	.ui-fbc__wires path[data-w='try'] {
		stroke: var(--ag-blue);
		stroke-dasharray: 4 4;
		animation: ui-fbc-run 0.6s linear infinite;
	}
	.ui-fbc__wires path[data-w='fail'] {
		stroke: color-mix(in srgb, var(--ag-red) 50%, transparent);
		stroke-dasharray: 2 3;
	}
	.ui-fbc__wires path[data-w='ok'] {
		stroke: var(--ag-green);
		stroke-width: 1.8;
	}
	@keyframes ui-fbc-run {
		to {
			stroke-dashoffset: -8;
		}
	}
	.ui-fbc__tok {
		position: absolute;
		left: 34px;
		right: 12px;
		bottom: 5px;
		height: 2px;
		background: repeating-linear-gradient(90deg, var(--ag-blue) 0 2px, transparent 2px 4px);
		opacity: 0.6;
		-webkit-mask: linear-gradient(90deg, #000, transparent);
		mask: linear-gradient(90deg, #000, transparent);
		animation: ui-ag-sheen 1.4s linear infinite;
	}
	.ui-fbc {
		width: 100%;
		max-width: 540px;
		display: grid;
		gap: 8px;
		font-size: 11.5px;
	}
	.ui-fbc__bar {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.ui-fbc__bar b {
		font-weight: 500;
		margin-right: auto;
	}
	.ui-fbc__flow {
		display: grid;
		grid-template-columns: auto 34px 1fr 34px auto;
		gap: 0;
		align-items: stretch;
		padding: 12px;
		background: radial-gradient(var(--ag-line) 0.8px, transparent 0.8px) 0 0 / 10px 10px, var(--ag-surface);
	}
	.ui-fbc__node {
		align-self: center;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px;
		color: var(--ag-muted);
	}
	.ui-fbc__node b {
		display: block;
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-fbc__node small {
		font-size: 10px;
	}
	.ui-fbc__node[data-done] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-green) 50%, transparent);
	}
	.ui-fbc__models {
		display: grid;
		gap: 6px;
	}
	.ui-fbc__m {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 9px;
		transition:
			opacity 0.3s,
			box-shadow 0.3s;
	}
	.ui-fbc__m[data-s='next'],
	.ui-fbc__m[data-s='skip'] {
		opacity: 0.5;
	}
	.ui-fbc__m[data-s='try'] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 55%, transparent);
	}
	.ui-fbc__m[data-s='fail'] .ui-ag-grow > small {
		color: var(--ag-red);
	}
	.ui-fbc__m[data-s='ok'] .ui-ag-grow > small,
	.ui-fbc__m[data-s='try'] .ui-ag-grow > small {
		color: var(--ag-blue);
	}
	.ui-fbc__n {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: var(--ag-fill);
		font-size: 9px;
		display: grid;
		place-items: center;
		flex: none;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		font-size: 10.5px;
		color: var(--ag-muted);
	}
	.ui-fbc__m > small {
		text-align: right;
		font-size: 10px;
	}
	.ui-fbc__dots {
		display: flex;
		gap: 2px;
	}
	.ui-fbc__dots i {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--ag-blue);
		animation: ui-fbc-dot 1s infinite;
	}
	.ui-fbc__dots i:nth-child(2) {
		animation-delay: 0.15s;
	}
	.ui-fbc__dots i:nth-child(3) {
		animation-delay: 0.3s;
	}
	@keyframes ui-fbc-dot {
		50% {
			opacity: 0.25;
		}
	}
	@media (width <= 560px) {
		.ui-fbc__flow {
			grid-template-columns: 1fr;
		}
		.ui-fbc__wires {
			display: none;
		}
	}
</style>
