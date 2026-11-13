<!-- Agent Queue – the work waiting for your agents and how fast it moves: jobs drop into a live queue, glide into free worker slots as growing bars and land in Done or Failed; rate limits pause the line. Pause it, change the number of workers, or click a waiting job to move it to the front. -->
<script lang="ts" module>
	export type Job = { id: number; name: string; kind: 'llm' | 'tool'; wait: number; progress: number; ms: number; high?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { linePath, areaPath } from '../utils/chart';
	import { tick } from '../utils/script';
	import './agents.css';
	let {
		name = 'agent-jobs',
		workers = $bindable(4),
		models = ['Atlas Pro', 'Orbit Pro', 'Prism Flash', 'Atlas Mini', 'Atlas Max', 'Orbit Mini'],
		titles = ['Score lead – Tailspin', 'Draft reply – Hooli', 'Summarize ticket #4931', 'Classify 12 support emails', 'Enrich account – Initech', 'Extract invoice fields #2215', 'Post digest to #support', 'Open PR #500', 'Search docs: refunds', 'Update roadmap page', 'Embed 240 docs · 5/5', 'Translate release notes']
	}: { name?: string; workers?: number; models?: string[]; titles?: string[] } = $props();
	let n = 0;
	const J = (i: number, wait = 0, progress = 0, high = false): Job => ({ id: n++, name: titles[i % titles.length], kind: i % 3 === 1 ? 'tool' : 'llm', wait, progress, ms: 0, high });
	let queue = $state<Job[]>([J(0, 2.1), J(6, 0.9), J(3, 0.3)]);
	let slots = $state<(Job | null)[]>([J(9, 0, 0.94), J(10, 0, 0.6), J(7, 0, 0.3), J(1, 0, 0.18, true)]);
	let done = $state(132);
	let failed = $state(3);
	let paused = $state(false);
	let limited = $state(0);
	let depth = $state<number[]>([4, 6, 9, 7, 5, 3, 4, 8, 14, 18, 15, 10, 6, 4, 3, 5, 9, 16, 21, 17, 12, 8, 5, 3, 2, 4, 7, 10, 6, 3]);
	let bands = $state<number[]>([7, 8, 9, 17, 18, 19]);
	let hits = $state(0);
	let flash = $state<'done' | 'failed' | null>(null);
	const running = $derived(slots.slice(0, workers).filter(Boolean).length);
	const throughput = $derived(72 + workers * 2 + (limited ? -6 : 0));
	$effect(() => {
		if (slots.length < workers) slots = [...slots, ...Array(workers - slots.length).fill(null)];
	});
	function step() {
		if (paused) return;
		queue = queue.map((j) => ({ ...j, wait: j.wait + 0.3 }));
		if (Math.random() < 0.45) queue = [...queue, J(Math.floor(Math.random() * titles.length))];
		if (!limited && Math.random() < 0.015) limited = 9;
		if (limited) {
			limited = Math.max(0, +(limited - 0.3).toFixed(1));
		} else {
			slots = slots.map((s, i) => {
				if (i >= workers) return s;
				if (!s) {
					const next = queue[0];
					if (!next) return null;
					queue = queue.slice(1);
					return { ...next, progress: 0 };
				}
				const p = s.progress + 0.06 + Math.random() * 0.08;
				if (p >= 1) {
					if (Math.random() < 0.04) ((failed += 1), (flash = 'failed'));
					else ((done += 1), (flash = 'done'));
					hits++;
					return null;
				}
				return { ...s, progress: p, ms: s.ms + 0.3 };
			});
		}
		depth = [...depth.slice(1), queue.length];
		bands = bands.map((b) => b - 1).filter((b) => b >= 0).concat(limited ? [depth.length - 1] : []);
	}
	onMount(() => tick(300, step));
	function prioritize(id: number) {
		const j = queue.find((x) => x.id === id);
		if (j) queue = [{ ...j, high: true }, ...queue.filter((x) => x.id !== id)];
	}
	const p95 = $derived(Math.max(...queue.map((j) => j.wait), 13).toFixed(0));
	const W = 340, H = 60;
</script>

<div class="ui-ag ui-ag-card ui-aqu">
	<div class="ui-ag-title ui-aqu__head">
		<span style:color="var(--ag-blue)">▤</span><b>Queue</b><span class="ui-ag-muted">{name}</span>
		{#if paused}<span class="ui-ag-pill" data-tone="gray">Paused</span>{:else if limited}<span class="ui-ag-pill" data-tone="amber">Rate limited · {Math.ceil(limited)}s</span>{:else}<span class="ui-ag-pill" data-tone="blue"><i class="ui-aqu__pulse"></i>Live</span>{/if}
		<span class="ui-ag-grow"></span>
		<button class="ui-ag-btn" aria-label={paused ? 'Resume the queue' : 'Pause the queue'} onclick={() => (paused = !paused)}>{paused ? '▷ Resume' : 'Ⅱ Pause'}</button>
		<span class="ui-aqu__w"><button aria-label="One worker less" disabled={workers <= 1} onclick={() => (workers -= 1)}>−</button><b>{workers}</b><button aria-label="One worker more" disabled={workers >= models.length} onclick={() => (workers += 1)}>+</button></span>
	</div>
	<div class="ui-aqu__stats">{#each [['Waiting', queue.length, queue.length > 10], ['Running', `${running}/${workers}`, false], ['Throughput', `${throughput}/min`, false], ['Wait p95', `${p95}s`, false]] as [k, v, warn] (k)}<span><small>{k}</small><b data-warn={warn || undefined}>{v}</b></span>{/each}</div>
	<div class="ui-aqu__cols">
		<div class="ui-aqu__q">
			<small class="ui-aqu__h">Queue <b>{queue.length}</b></small>
			{#each queue.slice(0, 5) as j, i (j.id)}<button class="ui-aqu__job ui-ag-rise" aria-label="{j.name}, {j.kind === 'llm' ? 'LLM call' : 'Tool call'}, waiting {j.wait.toFixed(1)}s, position {i + 1} of {queue.length}" onclick={() => prioritize(j.id)}><i data-kind={j.kind}>{j.kind === 'llm' ? '✎' : '⚙'}</i><span>{j.high ? '⚑ ' : ''}{j.name}</span><small>{j.wait.toFixed(1)}s</small></button>{/each}
			{#if queue.length > 5}<span class="ui-aqu__more">{#each Array(Math.min(12, queue.length - 5)) as _, i (i)}<i></i>{/each}</span>{/if}
		</div>
		<div class="ui-aqu__workers">
			<small class="ui-aqu__h">Workers <b>{running}/{workers}</b></small>
			{#each models.slice(0, workers) as m, i (m)}
				{@const s = slots[i]}
				<div class="ui-aqu__slot"><span class="ui-aqu__m">{m}</span>{#if s}<span class="ui-aqu__bar" data-paused={limited > 0 || paused || undefined}><i style:width="{s.progress * 100}%"></i><span>{s.kind === 'llm' ? '✎' : '⚙'} {s.name}</span><small>{limited || paused ? 'Paused' : `${s.ms.toFixed(1)}s`}</small></span>{:else}<span class="ui-aqu__idle">Idle</span>{/if}</div>
			{/each}
		</div>
		<div class="ui-aqu__out">
			<div class="ui-aqu__box" data-hit={flash === 'done' || undefined}>{#key hits}<span class:ui-aqu__hit={flash === 'done'}></span>{/key}<small>✓ Done</small><b>{done}</b></div>
			<div class="ui-aqu__box" data-hit={flash === 'failed' || undefined}><small>✕ Failed</small><b style:color="var(--ag-red)">{failed}</b></div>
		</div>
	</div>
	<div class="ui-aqu__depth">
		<small class="ui-aqu__h">Queue depth</small>
		<svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="Queue depth over the last 90 seconds">
			{#each bands as b (b)}<rect x={(b / (depth.length - 1)) * W - 6} y="0" width="12" height={H} fill="color-mix(in srgb, var(--ag-amber) 12%, transparent)" />{/each}
			<line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="var(--ag-line)" stroke-dasharray="3 3" />
			<path d={areaPath(depth, W, H, 24)} fill="color-mix(in srgb, #a855f7 12%, transparent)" />
			<path d={linePath(depth, W, H, 24)} fill="none" stroke="#a855f7" stroke-width="1.3" vector-effect="non-scaling-stroke" />
		</svg>
		<div class="ui-ag-row"><small class="ui-ag-grow">96s ago</small><small>now</small></div>
	</div>
</div>

<style>
	.ui-aqu {
		width: 100%;
		max-width: 520px;
		padding: 0;
		font-size: 12px;
		overflow: hidden;
	}
	.ui-aqu__head {
		padding: 10px 12px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-aqu__pulse {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		margin-right: 4px;
		animation: ui-ag-breathe 1.4s ease-in-out infinite;
	}
	.ui-aqu__w {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-aqu__w button {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		font-size: 14px;
	}
	.ui-aqu__stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-aqu__stats span {
		display: grid;
		padding: 8px 12px;
	}
	.ui-aqu__stats span + span {
		border-left: 1px solid var(--ag-line);
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-aqu__stats small,
	.ui-aqu__h {
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-aqu__stats b {
		font-weight: 500;
		font-size: 14px;
	}
	.ui-aqu__stats b[data-warn] {
		color: var(--ag-amber);
	}
	.ui-aqu__h b {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-aqu__cols {
		display: grid;
		grid-template-columns: 1fr 1.6fr 70px;
		gap: 10px;
		padding: 10px 12px;
	}
	.ui-aqu__q,
	.ui-aqu__workers,
	.ui-aqu__out {
		display: grid;
		gap: 4px;
		align-content: start;
	}
	.ui-aqu__job {
		display: flex;
		align-items: center;
		gap: 5px;
		border: 0;
		background: var(--ag-fill);
		border-radius: 6px;
		padding: 4px 6px;
		font: inherit;
		font-size: 10.5px;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-aqu__job span {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-aqu__job i,
	.ui-aqu__bar span {
		font-style: normal;
	}
	.ui-aqu__job i[data-kind='llm'] {
		color: #a855f7;
	}
	.ui-aqu__job i[data-kind='tool'] {
		color: var(--ag-blue);
	}
	.ui-aqu__more {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
	}
	.ui-aqu__more i {
		width: 10px;
		height: 6px;
		border-radius: 2px;
		background: color-mix(in srgb, #a855f7 25%, transparent);
	}
	.ui-aqu__slot {
		display: grid;
		grid-template-columns: 70px 1fr;
		align-items: center;
		gap: 6px;
		height: 22px;
	}
	.ui-aqu__m {
		font-weight: 500;
		font-size: 10.5px;
		white-space: nowrap;
		overflow: hidden;
	}
	.ui-aqu__bar {
		position: relative;
		height: 20px;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		border-radius: 6px;
		background: var(--ag-fill);
		overflow: hidden;
		font-size: 10.5px;
		animation: ui-ag-rise 0.35s var(--ag-ease);
	}
	.ui-aqu__bar i {
		position: absolute;
		inset: 0 auto 0 0;
		background: color-mix(in srgb, var(--ag-blue) 14%, transparent);
		transition: width 0.3s linear;
	}
	.ui-aqu__bar[data-paused] i {
		background: color-mix(in srgb, var(--ag-amber) 14%, transparent);
	}
	.ui-aqu__bar span {
		position: relative;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-aqu__bar small {
		position: relative;
		color: var(--ag-blue);
	}
	.ui-aqu__idle {
		color: var(--ag-subtle);
		font-size: 10.5px;
		padding-left: 6px;
	}
	.ui-aqu__box {
		position: relative;
		display: grid;
		gap: 2px;
		padding: 8px;
		border-radius: 8px;
		background: var(--ag-fill);
		text-align: center;
		overflow: hidden;
	}
	.ui-aqu__box b {
		font-size: 15px;
		font-weight: 500;
	}
	.ui-aqu__hit {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--ag-green) 18%, transparent);
		animation: ui-aqu-hit 0.6s ease-out forwards;
	}
	@keyframes ui-aqu-hit {
		to {
			opacity: 0;
		}
	}
	.ui-aqu__depth {
		padding: 0 12px 10px;
		display: grid;
		gap: 4px;
	}
	svg {
		width: 100%;
		height: 60px;
	}
</style>
