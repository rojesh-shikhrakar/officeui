<!-- Agent Plan – an agent's step-by-step plan to review before it runs: rename, drag to reorder, remove or add steps, then watch each one run with live timers and retry from a failed step. -->
<script lang="ts" module>
	export type PlanStep = { id: string; title: string; detail?: string; tool: string };
	type Run = { state: 'todo' | 'run' | 'done' | 'fail'; secs: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { play, tick } from './script';
	import './agents.css';
	let {
		title = 'Prepare the Q3 board update',
		estimate = '~2 min',
		steps = $bindable([
			{ id: '1', title: 'Pull Q3 revenue and ARR', detail: 'Monthly revenue, ARR and net retention', tool: 'payments.query' },
			{ id: '2', title: 'Summarize product launches', detail: 'Shipped projects and adoption', tool: 'tracker.search' },
			{ id: '3', title: 'Draft the board memo', detail: 'One page, wins, risks and asks', tool: 'docs.write' },
			{ id: '4', title: 'Build the KPI slides', detail: 'Six charts in the board template', tool: 'slides.create' },
			{ id: '5', title: 'Send the draft to Maya for review', tool: 'mail.draft' }
		] as PlanStep[]),
		/** Plays the demo: a reorder, then a run with one failure and a retry */
		autoplay = true,
		onrun,
		oncancel
	}: { title?: string; estimate?: string; steps?: PlanStep[]; autoplay?: boolean; onrun?: (s: PlanStep[]) => void; oncancel?: () => void } = $props();
	let runs = $state<Record<string, Run>>({});
	let mode = $state<'review' | 'running' | 'failed' | 'done'>('review');
	let editing = $state<string | null>(null);
	let draft = $state('');
	let dragging = $state<string | null>(null);
	let elapsed = $state(0);
	let failOnce = $state(true);
	const at = $derived(steps.findIndex((s) => runs[s.id]?.state === 'run'));
	const doneCount = $derived(steps.filter((s) => runs[s.id]?.state === 'done').length);
	function move(i: number, d: number) {
		const j = i + d;
		if (j < 0 || j >= steps.length) return;
		const next = [...steps];
		[next[i], next[j]] = [next[j], next[i]];
		steps = next;
	}
	function rename(id: string, v: string) {
		if (v.trim()) steps = steps.map((s) => (s.id === id ? { ...s, title: v.trim() } : s));
		editing = null;
	}
	function key(e: KeyboardEvent, i: number, s: PlanStep) {
		if (mode !== 'review' || editing) return;
		if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) (e.preventDefault(), move(i, e.key === 'ArrowUp' ? -1 : 1));
		else if (e.key === 'Enter') (e.preventDefault(), (editing = s.id));
		else if (e.key === 'Delete' || e.key === 'Backspace') (e.preventDefault(), (steps = steps.filter((x) => x.id !== s.id)));
	}
	function add() {
		if (draft.trim()) steps = [...steps, { id: String(Date.now()), title: draft.trim(), tool: 'agent.step' }];
		draft = '';
	}
	function startFrom(i: number) {
		mode = 'running';
		steps.forEach((s, j) => (runs[s.id] = j < i ? runs[s.id] ?? { state: 'done', secs: 1.2 } : { state: j === i ? 'run' : 'todo', secs: 0 }));
	}
	function run() {
		onrun?.(steps);
		elapsed = 0;
		startFrom(0);
	}
	// Advance the running step: finish it (or fail once on the fourth step) and start the next
	function stepOn() {
		if (mode !== 'running' || at < 0) return;
		const s = steps[at];
		if (at === 3 && failOnce) return void ((runs[s.id] = { ...runs[s.id], state: 'fail' }), (mode = 'failed'), (failOnce = false));
		runs[s.id] = { ...runs[s.id], state: 'done' };
		const n = steps[at + 1];
		if (n) runs[n.id] = { state: 'run', secs: 0 };
		else mode = 'done';
	}
	onMount(() => {
		const p = play(
			[
				[1300, () => move(2, 1)],
				[1300, () => move(3, -1)],
				[1100, run],
				[1300, stepOn],
				[1200, stepOn],
				[1300, stepOn],
				[1400, stepOn],
				[1600, () => startFrom(3)],
				[1300, stepOn],
				[1200, stepOn]
			],
			{ autoplay, still: 0 }
		);
		const t = tick(100, () => {
			if (mode !== 'running' || at < 0) return;
			elapsed += 0.1;
			runs[steps[at].id].secs += 0.1;
		});
		return () => (p(), t());
	});
</script>

<div class="ui-ag ui-ag-card ui-apl" data-mode={mode}>
	<div class="ui-apl__top"><small>☰ Plan · {steps.length} steps</small><span class="ui-ag-grow"></span>{#if mode === 'review'}<small>◷ {estimate}</small>{/if}</div>
	<h3>{title}</h3>
	<p class="ui-apl__sr">Press Enter to rename, Alt plus arrow keys to move, Delete to remove.</p>
	<ol role="listbox" aria-label="Plan steps">
		{#each steps as s, i (s.id)}
			{@const r = runs[s.id]}
			<li animate:flip={{ duration: 260 }} role="option" aria-selected="false" class="ui-apl__step" data-state={r?.state} data-drag={dragging === s.id || undefined} tabindex="0" draggable={mode === 'review'} ondragstart={() => (dragging = s.id)} ondragend={() => (dragging = null)} ondragover={(e) => { e.preventDefault(); if (dragging && dragging !== s.id) { const from = steps.findIndex((x) => x.id === dragging); move(from, i > from ? 1 : -1); } }} onkeydown={(e) => key(e, i, s)}>
				<span class="ui-apl__n">{#if r?.state === 'done'}✓{:else if r?.state === 'run'}<i class="ui-ag-spin"></i>{:else if r?.state === 'fail'}!{:else}{i + 1}{/if}</span>
				<span class="ui-apl__body">
					{#if editing === s.id}
						<!-- svelte-ignore a11y_autofocus -->
						<input class="ui-ag-input" value={s.title} aria-label="Step title" autofocus onkeydown={(e) => (e.key === 'Enter' ? rename(s.id, e.currentTarget.value) : e.key === 'Escape' && (editing = null))} onblur={(e) => rename(s.id, e.currentTarget.value)} />
					{:else}
						<b role="presentation" ondblclick={() => mode === 'review' && (editing = s.id)}>{s.title}</b>
					{/if}
					<small>{#if s.detail}{s.detail} {/if}<code>{s.tool}</code></small>
					{#if r?.state === 'fail'}<span class="ui-apl__fail ui-ag-in">Timed out reaching the slides service <button class="ui-ag-btn" onclick={() => startFrom(i)}>↻ Retry from here</button></span>{/if}
				</span>
				{#if r && r.state !== 'todo'}<small class="ui-apl__t">{r.secs.toFixed(1)}s</small>{:else if mode === 'review'}<button class="ui-ag-btn ui-apl__x" data-variant="ghost" aria-label="Remove step {i + 1}: {s.title}" onclick={() => (steps = steps.filter((x) => x.id !== s.id))}>×</button>{/if}
			</li>
		{/each}
	</ol>
	{#if mode === 'review'}
		<form class="ui-apl__add" onsubmit={(e) => (e.preventDefault(), add())}><span>+</span><input placeholder="Add step" aria-label="Add a step at the end" bind:value={draft} /></form>
		<div class="ui-apl__foot"><small class="ui-ag-grow">Drag to reorder · double-click to rename</small><button class="ui-ag-btn" data-variant="ghost" onclick={() => oncancel?.()}>Cancel</button><button class="ui-ag-btn" data-variant="primary" disabled={!steps.length} onclick={run}>Run plan ▸</button></div>
	{:else}
		<div class="ui-apl__foot ui-apl__status"><small class="ui-ag-grow">{#if mode === 'running'}<i class="ui-ag-spin"></i> Running · {at + 1} of {steps.length}{:else if mode === 'failed'}<span style:color="var(--ag-red)">●</span> Stopped at step {steps.findIndex((s) => runs[s.id]?.state === 'fail') + 1}{:else}✓ Done · {doneCount} of {steps.length}{/if}</small><small>{Math.round(elapsed)}s</small>{#if mode === 'done'}<button class="ui-ag-btn" onclick={() => ((mode = 'review'), (runs = {}), (failOnce = true))}>Edit plan</button>{/if}</div>
	{/if}
</div>

<style>
	.ui-apl {
		width: 100%;
		max-width: 400px;
		padding: 12px 14px;
		font-size: 12.5px;
	}
	.ui-apl__top {
		display: flex;
		align-items: center;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	h3 {
		margin: 2px 0 10px;
		font-size: 14px;
		font-weight: 500;
	}
	.ui-apl__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		position: relative;
	}
	.ui-apl__step {
		position: relative;
		display: flex;
		gap: 10px;
		padding: 6px 6px 6px 4px;
		border-radius: 8px;
		outline: none;
		cursor: grab;
	}
	.ui-apl__step:focus-visible,
	.ui-apl__step:hover {
		background: var(--ag-fill);
	}
	.ui-apl__step[data-drag] {
		opacity: 0.5;
	}
	[data-mode='running'] .ui-apl__step,
	[data-mode='done'] .ui-apl__step,
	[data-mode='failed'] .ui-apl__step {
		cursor: default;
	}
	.ui-apl__step[data-state='todo'] {
		opacity: 0.55;
	}
	.ui-apl__n {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		flex: none;
		margin-top: 1px;
		font-size: 10px;
		color: var(--ag-muted);
	}
	[data-state='done'] .ui-apl__n {
		background: var(--ag-blue);
		color: #fff;
		animation: ui-ag-pop 0.35s var(--ag-ease);
	}
	[data-state='fail'] .ui-apl__n {
		background: var(--ag-red);
		color: #fff;
		font-weight: 700;
	}
	[data-state='done'] + [data-state]::before,
	.ui-apl__step[data-state='done']::after {
		content: '';
		position: absolute;
		left: 11.5px;
		top: 23px;
		bottom: -7px;
		border-left: 1.5px solid color-mix(in srgb, var(--ag-blue) 45%, transparent);
	}
	.ui-apl__body {
		flex: 1;
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.ui-apl__body b {
		font-weight: 400;
	}
	code {
		font-size: 10.5px;
		padding: 0 5px;
		border-radius: 4px;
		background: var(--ag-fill);
		color: var(--ag-muted);
	}
	.ui-apl__fail {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--ag-red);
		font-size: 11.5px;
		margin-top: 4px;
	}
	.ui-apl__t {
		font-variant-numeric: tabular-nums;
	}
	.ui-apl__x {
		opacity: 0;
		align-self: center;
	}
	.ui-apl__step:hover .ui-apl__x,
	.ui-apl__x:focus-visible {
		opacity: 1;
	}
	.ui-apl__add {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px;
		color: var(--ag-subtle);
	}
	.ui-apl__add input {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-apl__foot {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 6px -14px -12px;
		padding: 8px 14px;
		border-top: 1px solid var(--ag-line);
	}
	.ui-apl__status small {
		display: flex;
		align-items: center;
		gap: 6px;
	}
</style>
