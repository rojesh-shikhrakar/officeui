<!-- Agent Trail – the steps an agent works through, as one quiet trail: a header with the task and "2/5", done ones with a check and their time, the one it is on says what it is doing with its sub-steps (click to fold them), and an approval waiting at the end. -->
<script lang="ts" module>
	export type TrailStep = { title: string; secs?: number; state: 'done' | 'run' | 'todo' | 'approval'; doing?: string; subs?: { title: string; meta: string }[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play, tick } from './script';
	import './agents.css';
	let {
		task = 'Fix the checkout crash',
		steps = $bindable([
			{ title: 'Read the bug report', secs: 8, state: 'done' },
			{ title: 'Reproduce the crash', secs: 34, state: 'done' },
			{ title: 'Patch the checkout form', secs: 22, state: 'run', doing: 'Editing', subs: [{ title: 'Found the empty-cart case', meta: 'cart.ts:142' }, { title: 'Added a guard and 2 tests', meta: '+18 −3' }] },
			{ title: 'Write the release note', state: 'todo' },
			{ title: 'Open a pull request', state: 'approval' }
		] as TrailStep[]),
		autoplay = true,
		onapprove
	}: { task?: string; steps?: TrailStep[]; autoplay?: boolean; onapprove?: () => void } = $props();
	let folded = $state(false);
	let tests = $state(0);
	const done = $derived(steps.filter((s) => s.state === 'done').length);
	const cur = $derived(steps.findIndex((s) => s.state === 'run'));
	const upd = (i: number, p: Partial<TrailStep>) => (steps = steps.map((s, j) => (j === i ? { ...s, ...p } : s)));
	function approve() {
		const i = steps.findIndex((s) => s.state === 'approval');
		if (i < 0) return;
		upd(i, { state: 'run', doing: 'Opening', secs: 0 });
		onapprove?.();
		setTimeout(() => upd(i, { state: 'done', doing: undefined }), 1400);
	}
	onMount(() => {
		const p = play(
			[
				[3000, () => (upd(2, { doing: 'Testing' }), upd(2, { subs: [...steps[2].subs!, { title: 'Running the test suite', meta: '' }] }))],
				[3200, () => upd(2, { state: 'done', doing: undefined, subs: [] })],
				[200, () => upd(3, { state: 'run', doing: 'Writing', secs: 0 })],
				[3200, () => upd(3, { state: 'done', doing: undefined })]
			],
			{ autoplay, still: 0 }
		);
		const t = tick(250, () => {
			if (cur >= 0) upd(cur, { secs: (steps[cur].secs ?? 0) + 0.25 });
			if (steps[2]?.doing === 'Testing') tests = Math.min(214, tests + 6);
		});
		return () => (p(), t());
	});
</script>

<div class="ui-ag ui-ag-card ui-atr">
	<div class="ui-ag-title"><b>{task}</b><span class="ui-ag-meta">{done}/{steps.length}</span></div>
	<ol>
		{#each steps as s, i (i)}
			<li data-state={s.state}>
				<span class="ui-atr__ic" aria-hidden="true">{#if s.state === 'done'}<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" /><path d="M5 8.2l2 2 4-4.4" /></svg>{:else if s.state === 'run'}<i class="ui-atr__spin"></i>{/if}</span>
				{#if s.state === 'run'}
					<button class="ui-atr__row ui-atr__cur" aria-expanded={!folded} aria-label="{s.title} – {s.doing}" onclick={() => (folded = !folded)}><span class="ui-ag-grow">{s.title}</span><em>{s.doing}</em><small>{Math.floor(s.secs ?? 0)}s</small></button>
					{#if !folded && s.subs?.length}
						<ul class="ui-ag-in">{#each s.subs as sub, k (sub.title)}<li class="ui-ag-rise" data-live={k === s.subs.length - 1 || undefined}><span class="ui-ag-grow">{sub.title}</span><small>{sub.meta || `${tests}/214`}</small></li>{/each}</ul>
					{/if}
				{:else}
					<span class="ui-atr__row"><span class="ui-ag-grow">{s.title}</span>{#if s.state === 'approval'}<button class="ui-ag-pill ui-atr__ap" data-tone="amber" onclick={approve}>Approval</button>{:else if s.secs}<small>{Math.floor(s.secs)}s</small>{/if}</span>
				{/if}
			</li>
		{/each}
	</ol>
</div>

<style>
	.ui-atr {
		width: 100%;
		max-width: 330px;
		padding: 12px 14px;
		font-size: 12px;
	}
	.ui-atr .ui-ag-title b {
		font-weight: 500;
	}
	ol {
		list-style: none;
		margin: 10px 0 0;
		padding: 0;
	}
	ol > li {
		position: relative;
		display: grid;
		grid-template-columns: 14px 1fr;
		column-gap: 10px;
		padding: 4px 0;
	}
	ol > li + li::before {
		content: '';
		position: absolute;
		left: 6.5px;
		top: -6px;
		height: 12px;
		border-left: 1.5px solid color-mix(in srgb, var(--ag-blue) 50%, transparent);
		transform-origin: top;
		animation: ui-ag-draw 0.4s var(--ag-ease) both;
	}
	ol > li[data-state='todo']::before,
	ol > li[data-state='approval']::before {
		border-left-color: var(--ag-line);
	}
	.ui-atr__ic {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.3px var(--ag-line);
		display: grid;
		place-items: center;
		margin-top: 1px;
	}
	[data-state='approval'] .ui-atr__ic {
		box-shadow: inset 0 0 0 1.5px var(--ag-amber);
		animation: ui-ag-breathe 2s ease-in-out infinite;
	}
	[data-state='done'] .ui-atr__ic,
	[data-state='run'] .ui-atr__ic {
		box-shadow: none;
	}
	.ui-atr__ic svg {
		width: 14px;
		height: 14px;
		fill: none;
		stroke: var(--ag-blue);
		stroke-width: 1.5;
		animation: ui-ag-pop 0.35s var(--ag-ease);
	}
	.ui-atr__ic svg path {
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.ui-atr__spin {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1.5px solid color-mix(in srgb, var(--ag-blue) 25%, transparent);
		border-top-color: var(--ag-blue);
		animation: ui-ag-spin 0.9s linear infinite;
	}
	.ui-atr__row {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--ag-muted);
	}
	[data-state='run'] .ui-atr__row,
	[data-state='todo'] .ui-atr__row {
		color: var(--ag-ink);
	}
	[data-state='todo'] .ui-atr__row {
		color: var(--ag-subtle);
	}
	.ui-atr__cur {
		border: 0;
		background: none;
		font: inherit;
		padding: 0;
		text-align: left;
		cursor: pointer;
	}
	.ui-atr__cur em {
		font-style: normal;
		color: var(--ag-blue);
		font-size: 11px;
		background: linear-gradient(90deg, color-mix(in srgb, var(--ag-blue) 50%, transparent) 30%, var(--ag-blue) 50%, color-mix(in srgb, var(--ag-blue) 50%, transparent) 70%) 0 0 / 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: ui-ag-sheen 1.8s linear infinite;
	}
	small {
		color: var(--ag-subtle);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
	}
	ul {
		grid-column: 2;
		list-style: none;
		margin: 4px 0 0;
		padding: 0;
		display: grid;
		gap: 4px;
	}
	ul li {
		position: relative;
		display: flex;
		gap: 8px;
		padding-left: 12px;
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	ul li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--ag-subtle);
	}
	ul li[data-live]::before {
		background: var(--ag-blue);
	}
	.ui-atr__ap {
		border: 0;
		cursor: pointer;
		font: inherit;
		font-size: 10.5px;
	}
</style>
