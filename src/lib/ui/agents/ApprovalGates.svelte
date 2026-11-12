<!-- Approval Gates – the approval requests of an agent run as a stack of cards: the one to decide now on top with who asks, what and the diff; decided ones fold below. -->
<script lang="ts" module>
	export type Gate = { id: string; who: string; kind: string; ago: string; title: string; detail: string; file: string; diff: [string, string][]; holds: string[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		run = 'Launch the new pricing page',
		gates = [
			{ id: 'g1', who: 'Coder', kind: 'File change', ago: '1m ago', title: 'Change prices in pricing.ts', detail: 'Changes what customers pay from Monday', file: 'src/billing/pricing.ts', diff: [[' ', 'export const plans = {'], ['-', '  pro: { seat: 8, currency: "usd" },'], ['+', '  pro: { seat: 10, currency: "usd" },'], ['-', '  team: { seat: 12, currency: "usd" },'], ['+', '  team: { seat: 15, currency: "usd", minSeats: 3 },'], [' ', '};']], holds: ['Deploy to production', 'Post to #launch'] },
			{ id: 'g2', who: 'Growth agent', kind: 'Message', ago: 'just now', title: 'Email 1,284 trial users', detail: 'Sends to customers outside the team', file: 'Subject: New plans, same price for you', diff: [[' ', "Hi {first_name}, we're changing our plans on Monday."], [' ', "As a trial user you keep today's price for a year."]], holds: ['Schedule the send'] },
			{ id: 'g3', who: 'Researcher', kind: 'Tool', ago: 'just now', title: 'Start a browser agent', detail: 'Opens competitor sites in a remote browser', file: 'browser.start', diff: [['+', 'sites: 9 competitor pricing pages'], ['+', 'budget: $2.00']], holds: [] }
		],
		autoplay = true,
		ondecide
	}: { run?: string; gates?: Gate[]; autoplay?: boolean; ondecide?: (g: Gate, ok: boolean) => void } = $props();
	let stopped = $state<Gate | null>(null);
	let changes = $state(false);
	let decided = $state<{ gate: Gate; ok: boolean }[]>([{ gate: { id: 'g0', who: 'Coder', kind: '', ago: '6m ago', title: 'Run the database migration', detail: '', file: '', diff: [], holds: [] }, ok: true }]);
	let index = $state(0);
	const open = $derived(gates.filter((g) => !decided.some((d) => d.gate.id === g.id)));
	const current = $derived(open[Math.min(index, open.length - 1)]);
	function decide(ok: boolean) {
		if (!current || stopped) return;
		decided = [{ gate: current, ok }, ...decided];
		ondecide?.(current, ok);
		if (!ok) stopped = current;
		index = 0;
		changes = false;
	}
	onMount(() => play([[3200, () => decide(true)], [3200, () => decide(true)], [3200, () => decide(false)]], { autoplay, still: 0 }));
</script>

<div class="ui-ag ui-aga">
	<div class="ui-ag-panel ui-aga__sum">
		<div class="ui-ag-head"><span>▤</span><b>Approvals <span class="ui-ag-muted">{run}</span></b>{#if stopped}<span class="ui-ag-pill" data-tone="red">Stopped</span>{:else}<span class="ui-ag-pill" data-tone={open.length ? 'amber' : 'green'}><i class="ui-aga__pulse"></i> {open.length ? 'Waiting on you' : 'All clear'}</span>{/if}</div>
		<div class="ui-aga__stats"><div><small>Waiting on you</small><b>{open.length}</b></div><div><small>Decided</small><b>{decided.length}/{gates.length + 1}</b></div><div><small>Run</small><b>{stopped ? `Stopped at “${stopped.title}”` : open.length ? `Paused – ${open.reduce((n, g) => n + g.holds.length, 0) + 1} steps wait on ${open.length} gate${open.length > 1 ? 's' : ''}` : 'Running'}</b></div></div>
	</div>
	{#if stopped}
		<div class="ui-ag-panel ui-aga__stop ui-ag-in"><span style:color="var(--ag-red)">⊘</span><b>The run stopped</b><small class="ui-ag-muted">“{stopped.title}” was rejected – nothing after it runs</small></div>
	{:else if current}
		{#key current.id}
			<div class="ui-ag-panel ui-aga__gate ui-ag-in">
				<div class="ui-ag-body">
					<div class="ui-ag-row"><span class="ui-ag-muted">● {current.who} · {current.kind} · {current.ago}</span><span class="ui-ag-pill" data-tone="amber" style:margin-left="auto">Blocking</span></div>
					<b class="ui-aga__t">{current.title}</b>
					<small class="ui-ag-muted">{current.detail}</small>
					<small class="ui-aga__label">{current.kind === 'Message' ? 'Message' : current.kind === 'Tool' ? 'Arguments' : 'Changes'}</small>
					<pre class="ui-aga__diff"><span class="ui-aga__file">{current.file}</span>{#each current.diff as [m, l], i (i)}<span data-m={m}>{m} {l}</span>{/each}</pre>
					{#if changes}<textarea class="ui-ag-input ui-ag-in" rows="2" placeholder="What should change?" aria-label="What should change"></textarea>{/if}
				</div>
				<div class="ui-ag-foot"><button class="ui-ag-btn" data-variant="ghost" style:margin-right="auto" aria-pressed={changes} onclick={() => (changes = !changes)}>✎ {current.kind === 'Message' ? 'Edit' : 'Ask for changes'}</button><button class="ui-ag-btn" onclick={() => decide(false)}>Reject</button><button class="ui-ag-btn" data-variant="primary" onclick={() => decide(true)}>Approve</button></div>
			</div>
		{/key}
		<div class="ui-aga__holds"><span style:color="var(--ag-amber)">Holds {current.holds.length} steps:</span> {current.holds.join(', ')}<span class="ui-aga__pager"><button aria-label="Previous gate" onclick={() => (index = Math.max(0, index - 1))}>‹</button>{index + 1} of {open.length}<button aria-label="Next gate" onclick={() => (index = Math.min(open.length - 1, index + 1))}>›</button></span></div>
	{/if}
	<small class="ui-aga__label">Decided</small>
	{#each decided as d (d.gate.id)}<div class="ui-ag-card ui-aga__dec ui-ag-rise"><span class="ui-ag-check" data-state={d.ok ? undefined : 'fail'}>{d.ok ? '✓' : '×'}</span><span class="ui-ag-grow">{d.gate.title}</span><small class="ui-ag-muted">{d.gate.who} · {d.ok ? 'Approved' : 'Rejected'}</small></div>{/each}
</div>

<style>
	.ui-aga__pulse {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		animation: ui-ag-breathe 1.4s ease-in-out infinite;
	}
	.ui-aga__stop {
		display: grid;
		justify-items: center;
		gap: 4px;
		padding: 28px 16px;
		max-width: none;
		text-align: center;
	}
	.ui-aga {
		width: 100%;
		max-width: 400px;
		display: grid;
		gap: 8px;
		font-size: 12px;
	}
	.ui-aga__sum,
	.ui-aga__gate {
		max-width: none;
	}
	.ui-aga__stats {
		display: grid;
		grid-template-columns: 1fr 1fr 2fr;
	}
	.ui-aga__stats div {
		padding: 7px 14px;
		display: grid;
	}
	.ui-aga__stats div + div {
		border-left: 1px solid var(--ag-line);
	}
	.ui-aga__stats small,
	.ui-aga__label {
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-aga__stats b {
		font-weight: 500;
		font-size: 11.5px;
	}
	.ui-aga__t {
		font-weight: 500;
		font-size: 13px;
	}
	.ui-aga__diff {
		margin: 0;
		padding: 6px 0;
		border-radius: 6px;
		background: var(--ag-fill);
		font: 10.5px/1.6 ui-monospace, 'SF Mono', Menlo, monospace;
		display: grid;
		overflow-x: auto;
	}
	.ui-aga__diff span {
		padding: 0 8px;
		white-space: pre;
	}
	.ui-aga__file {
		color: var(--ag-muted);
	}
	.ui-aga__diff span[data-m='-'] {
		background: color-mix(in srgb, var(--ag-red) 12%, transparent);
		color: var(--ag-red);
	}
	.ui-aga__diff span[data-m='+'] {
		background: color-mix(in srgb, var(--ag-green) 12%, transparent);
		color: var(--ag-green);
	}
	.ui-aga__holds {
		display: flex;
		gap: 4px;
		font-size: 11px;
		color: var(--ag-muted);
	}
	.ui-aga__pager {
		margin-left: auto;
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.ui-aga__pager button {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		font: inherit;
	}
	.ui-aga__dec {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 6px 10px;
	}
</style>
