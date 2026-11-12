<!-- Judge Bracket – attempts from several models face off in a knockout bracket; a judge model compares each pair and advances the winner to the final. -->
<script lang="ts" module>
	export type Entrant = { name: string; model: string; color: string; summary: string; stats: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let {
		task = 'Fix: customers charged twice when a payment is retried',
		judge = 'Judge model',
		entrants = [
			{ name: 'Idempotency key', model: 'Model A', color: '#d97757', summary: 'Sends one idempotency key per checkout, so the provider returns the first charge on a retry instead of making a second.', stats: '+18 −4 · 3 files · 42/42 tests' },
			{ name: 'Retry guard', model: 'Model B', color: '#6b7280', summary: 'Skips the retry when the first request is still pending. Fails: webhook arrives before the client retry.', stats: '+9 −1 · 1 file · 41/42 tests' },
			{ name: 'Row lock', model: 'Model C', color: '#3b82f6', summary: 'Locks the order row while charging so a second request waits and sees the paid state.', stats: '+22 −6 · 2 files · 42/42 tests' },
			{ name: 'No retries', model: 'Model D', color: '#6b7280', summary: 'Turns client retries off. Payments that time out now need a manual retry.', stats: '+2 −14 · 1 file · 38/42 tests' },
			{ name: 'Webhook dedupe', model: 'Model A', color: '#d97757', summary: 'Stores processed webhook ids and ignores duplicates.', stats: '+31 −2 · 4 files · 40/42 tests' },
			{ name: 'State machine', model: 'Model B', color: '#6b7280', summary: 'Models payment as a state machine that refuses to charge twice.', stats: '+64 −20 · 5 files · 42/42 tests' },
			{ name: 'Button debounce', model: 'Model C', color: '#3b82f6', summary: 'Disables the pay button after the first click.', stats: '+5 −0 · 1 file · 36/42 tests' },
			{ name: 'Refund later', model: 'Model D', color: '#6b7280', summary: 'Refunds the duplicate charge in a nightly job.', stats: '+40 −0 · 2 files · 39/42 tests' }
		] as Entrant[],
		autoplay = true
	}: { task?: string; judge?: string; entrants?: Entrant[]; autoplay?: boolean } = $props();
	// winners[round][match] = index into entrants
	let winners = $state<number[][]>([[], [], []]);
	const score = (i: number) => +entrants[i].stats.match(/(\d+)\/\d+ tests/)![1] * 100 - +(entrants[i].stats.match(/\+(\d+)/)?.[1] ?? 0);
	const roundOf = (r: number): number[] => (r === 0 ? entrants.map((_, i) => i) : winners[r - 1]);
	const total = $derived(entrants.length - 1);
	const done = $derived(winners.flat().length);
	const next = $derived.by(() => {
		for (let r = 0; r < 3; r++) {
			const pool = roundOf(r);
			const m = winners[r].length;
			if (pool.length >= (m + 1) * 2) return { r, m, a: pool[m * 2], b: pool[m * 2 + 1] };
		}
		return null;
	});
	function step() {
		if (!next) return;
		const { r, a, b } = next;
		winners[r] = [...winners[r], score(a) >= score(b) ? a : b];
	}
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = setInterval(() => (next ? step() : clearInterval(t)), 1600);
		return () => clearInterval(t);
	});
	const names = ['Quarterfinal', 'Semifinal', 'Final'];
	// The judge's score out of 10, a little different each round
	const judge10 = (e: number, r: number) => Math.min(9.6, Math.max(3.8, score(e) / 470 + ((e * 7 + r * 3) % 5) / 10)).toFixed(1);
	const champion = $derived(winners[2][0]);
</script>

<div class="ui-ag ui-jb">
	<div class="ui-ag-row ui-jb__top"><b>⚖ Judge</b><span class="ui-ag-muted ui-ag-grow">{task}</span>{#if champion === undefined}<span class="ui-ag-pill" data-tone="blue"><span class="ui-ag-spin"></span> Judging</span>{:else}<span class="ui-ag-pill" data-tone="green">✓ Winner</span>{/if}<small class="ui-ag-muted">{next ? names[next.r] : 'Done'} · {done}/{total}</small></div>
	<div class="ui-jb__grid">
		{#each [0, 1, 2] as r (r)}
			<div class="ui-jb__col" style:--n={4 >> r}>
				<small class="ui-jb__h">{names[r]}</small>
				{#each Array(4 >> r) as _, m (m)}
					<div class="ui-jb__match" data-live={next?.r === r && next.m === m || undefined}>
						{#each [0, 1] as k (k)}
							{@const e = roundOf(r)[m * 2 + k]}
							{#if e !== undefined}
								<div class="ui-jb__slot" data-out={winners[r][m] !== undefined && winners[r][m] !== e || undefined} data-win={champion === e && r === 2 || undefined}><i style:color={entrants[e].color}>✦</i><span class="ui-jb__nm">{entrants[e].name}</span>{#if winners[r][m] !== undefined}<b class="ui-jb__sc">{judge10(e, r)}</b>{/if}</div>
							{:else}<div class="ui-jb__slot ui-jb__empty"></div>{/if}
						{/each}
					</div>
				{/each}
			</div>
		{/each}
	</div>
	{#if next}
		<div class="ui-ag-card ui-jb__cmp ui-ag-in">
			<div class="ui-ag-row"><b class="ui-ag-grow">{names[next.r]} {next.m + 1}</b><small class="ui-ag-muted">{judge} is comparing…</small><button class="ui-ag-btn" data-variant="ghost" onclick={step}>Decide</button></div>
			<div class="ui-jb__pair">
				{#each [next.a, next.b] as e (e)}
					<div><b><i style:color={entrants[e].color}>✦</i> {entrants[e].name}</b><small>{entrants[e].model} · {entrants[e].stats}</small><p>{entrants[e].summary}</p></div>
				{/each}
			</div>
		</div>
	{:else if champion !== undefined}
		<div class="ui-ag-card ui-jb__cmp ui-ag-in"><b>✓ {entrants[champion].name}</b> <small class="ui-ag-muted">by {entrants[champion].model} · {entrants[champion].stats}</small><p class="ui-ag-muted">{entrants[champion].summary}</p></div>
	{/if}
</div>

<style>
	.ui-jb__nm {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-jb__sc {
		font-size: 9.5px;
		color: var(--ag-muted);
		animation: ui-ag-rise 0.3s var(--ag-ease);
	}
	.ui-jb {
		width: 100%;
		max-width: 420px;
		display: grid;
		gap: 10px;
		font-size: 11px;
	}
	.ui-jb__top b {
		font-weight: 500;
	}
	.ui-jb__grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.ui-jb__col {
		display: grid;
		grid-template-rows: auto repeat(var(--n), 1fr);
		gap: 8px;
	}
	.ui-jb__h {
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-jb__match {
		display: grid;
		gap: 3px;
		align-content: center;
		border-radius: 9px;
		transition: box-shadow 0.2s;
	}
	.ui-jb__match[data-live] {
		box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	.ui-jb__slot {
		height: 24px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		border-radius: 7px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		white-space: nowrap;
		overflow: hidden;
		transition: opacity 0.3s;
	}
	.ui-jb__slot[data-out] {
		opacity: 0.4;
		text-decoration: line-through;
	}
	.ui-jb__slot[data-win] {
		box-shadow: 0 0 0 1.5px var(--ag-green);
	}
	.ui-jb__empty {
		background: var(--ag-fill);
		box-shadow: none;
	}
	i {
		font-style: normal;
		font-size: 9px;
	}
	.ui-jb__cmp {
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-jb__pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.ui-jb__pair > div {
		background: var(--ag-fill);
		border-radius: 8px;
		padding: 8px;
		display: grid;
		gap: 3px;
		align-content: start;
	}
	.ui-jb__pair b {
		font-weight: 500;
	}
	small {
		color: var(--ag-subtle);
		font-size: 9.5px;
	}
	p {
		margin: 0;
		color: var(--ag-muted);
		line-height: 1.45;
	}
</style>
