<!-- Agent Checkpoints – an agent's run as a line of checkpoints, like git for agents: rewind to any of them and a new attempt branches out of it, while the one it left fades back but stays. -->
<script lang="ts" module>
	export type Checkpoint = { id: string; label: string; time: string; tool: number; files?: number; failed?: boolean; attempt?: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play } from '../utils/script';
	import './agents.css';
	const C = (id: string, label: string, time: string, tool: number, files?: number, extra: Partial<Checkpoint> = {}): Checkpoint => ({ id, label, time, tool, files, ...extra });
	let {
		task = 'Ship the pricing page',
		checkpoints = $bindable([C('a', 'Read the brief', '0:09', 3), C('b', 'Scaffolded the pricing page', '0:30', 11, 4)]),
		/** The scenario that plays on its own: more checkpoints, a failure, a rewind and a second attempt */
		autoplay = true,
		onrewind
	}: { task?: string; checkpoints?: Checkpoint[]; autoplay?: boolean; onrewind?: (c: Checkpoint) => void } = $props();
	// rewound[i] = index the i-th attempt branched from
	let rewoundAt = $state<number | null>(null);
	let fresh = $state<string | null>(null);
	const cost = $derived(checkpoints.length * 0.04 + (rewoundAt !== null ? 0.25 : 0));
	const attempts = $derived(1 + (rewoundAt !== null ? 1 : 0));
	const isOld = (i: number, c: Checkpoint) => rewoundAt !== null && i > rewoundAt && (c.attempt ?? 1) === 1;
	function add(c: Checkpoint) {
		checkpoints = [...checkpoints, c];
		fresh = c.id;
	}
	function rewind(i: number) {
		rewoundAt = i;
		onrewind?.(checkpoints[i]);
	}
	function manualRewind(i: number) {
		rewind(i);
		add(C('n' + Date.now(), 'New attempt from here', 'now', 11, undefined, { attempt: 2 }));
	}
	onMount(() =>
		play(
			[
				[1400, () => add(C('c', 'Wrote the plan copy', '0:47', 8, 1))],
				[1400, () => add(C('d', 'Built the pricing table', '1:21', 1, 3))],
				[1400, () => add(C('e', 'Added Stripe checkout', '2:02', 0, 2))],
				[1400, () => add(C('f', 'Tests failing – 4 of 12', '2:28', 11, undefined, { failed: true }))],
				[1600, () => rewind(3)],
				[900, () => add(C('g', 'Switched to Stripe Elements', '3:06', 8, 3, { attempt: 2 }))],
				[1400, () => add(C('h', 'Tests pass – 12 of 12', '3:30', 11, undefined, { attempt: 2 }))]
			],
			{ autoplay, still: 7 }
		)
	);
</script>

<div class="ui-ag ui-ag-card ui-ackp">
	<div class="ui-ag-title"><svg viewBox="0 0 16 16" width="13" aria-hidden="true"><path d="M5 3v10M5 9c0-3 6-2 6-6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><circle cx="11" cy="3" r="1.6" fill="currentColor" /></svg><b>Checkpoints</b><span class="ui-ag-muted">{task}</span><span class="ui-ag-meta">{checkpoints.length} checkpoints{attempts > 1 ? ` · ${attempts} attempts` : ''} · ${cost.toFixed(2)}</span></div>
	<ol>
		{#each checkpoints as c, i (c.id)}
			<li class="ui-ackp__row" class:ui-ag-rise={fresh === c.id} class:ui-ag-glint={fresh === c.id} data-old={isOld(i, c) || undefined} data-branch={(c.attempt ?? 1) > 1 || undefined} data-last={i === checkpoints.length - 1 || undefined}>
				<span class="ui-ackp__rail" aria-hidden="true"><i class="ui-ackp__line"></i><i class="ui-ackp__dot"></i></span>
				<Mark i={c.tool} size={12} />
				<span class="ui-ackp__label">{c.label}</span>
				{#if c.failed}<span class="ui-ag-pill" data-tone="red">Failed</span>{/if}
				{#if c.attempt === 2 && checkpoints.findIndex((x) => x.attempt === 2) === i}<span class="ui-ag-pill" data-tone="gray">Attempt 2</span>{/if}
				<span class="ui-ag-grow"></span>
				{#if !isOld(i, c) && i < checkpoints.length - 1}<button class="ui-ag-btn ui-ackp__rw" onclick={() => manualRewind(i)}>↶ Rewind</button>{/if}
				<span class="ui-ackp__files">{#if c.files}▬ {c.files} file{c.files > 1 ? 's' : ''}{/if}</span>
				<span class="ui-ackp__time">{c.time}</span>
			</li>
		{/each}
	</ol>
</div>

<style>
	.ui-ackp {
		width: 100%;
		max-width: 470px;
		padding: 12px 14px 10px;
		font-size: 12.5px;
	}
	ol {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
	}
	.ui-ackp__row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 26px;
		padding-right: 2px;
		border-radius: 6px;
		transition: opacity 0.4s var(--ag-ease);
	}
	.ui-ackp__row[data-old] {
		opacity: 0.45;
	}
	.ui-ackp__row[data-old] .ui-ackp__rail {
		transform: translateX(8px);
	}
	.ui-ackp__rail {
		position: relative;
		width: 10px;
		align-self: stretch;
		flex: none;
		transition: transform 0.4s var(--ag-ease);
	}
	.ui-ackp__line {
		position: absolute;
		left: 4px;
		top: -13px;
		height: 26px;
		border-left: 1.5px solid color-mix(in srgb, var(--ag-blue) 55%, transparent);
		transform-origin: top;
		animation: ui-ag-draw 0.5s var(--ag-ease) both;
	}
	.ui-ackp__row:first-child .ui-ackp__line {
		display: none;
	}
	.ui-ackp__row[data-old] .ui-ackp__line {
		border-left-style: dashed;
	}
	.ui-ackp__dot {
		position: absolute;
		left: 1px;
		top: 50%;
		width: 7px;
		height: 7px;
		margin-top: -3.5px;
		border-radius: 50%;
		box-sizing: border-box;
		border: 1.5px solid var(--ag-blue);
		background: var(--ag-surface);
		animation: ui-ag-pop 0.4s var(--ag-ease) both;
	}
	.ui-ackp__row[data-last] .ui-ackp__dot {
		background: var(--ag-blue);
	}
	.ui-ackp__row[data-old] .ui-ackp__dot {
		border-color: var(--ag-subtle);
	}
	.ui-ackp__label {
		white-space: nowrap;
	}
	.ui-ackp__files {
		width: 52px;
		color: var(--ag-subtle);
		font-size: 11px;
		white-space: nowrap;
	}
	.ui-ackp__time {
		width: 30px;
		text-align: right;
		color: var(--ag-muted);
		font-size: 11.5px;
		font-variant-numeric: tabular-nums;
	}
	.ui-ackp__rw {
		opacity: 0;
		padding: 2px 7px;
		font-size: 11px;
		transition: opacity 0.15s;
	}
	.ui-ackp__row:hover .ui-ackp__rw,
	.ui-ackp__rw:focus-visible {
		opacity: 1;
	}
	.ui-ackp__row:hover {
		background: var(--ag-fill);
	}
</style>
