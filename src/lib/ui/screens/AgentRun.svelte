<!-- AI Chat / Run – one autonomous agent run: the plan ticking through its steps, the tool calls under each, live totals, and a side panel for anything that needs you plus the draft it's writing. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from './shell/AppShell.svelte';
	import InlineDiff from '../agents/InlineDiff.svelte';
	import './shell/screen.css';
	let { title = 'Prepare the Q3 board update', autoplay = true, onstop }: { title?: string; autoplay?: boolean; onstop?: () => void } = $props();
	const steps = [
		{ t: 'Pull Q3 revenue and churn', d: 'From payments, July to September', tool: 'payments.query', s: 2.0 },
		{ t: "Read last quarter's board memo", d: 'Keeps the structure the board knows', tool: 'search', s: 0.6 },
		{ t: 'Update the memo draft', d: 'Revenue, churn and the Q4 outlook', tool: 'docs.write', s: 3.1 },
		{ t: 'Send the draft to Maya', d: 'Needs your approval first', tool: 'mail.send', s: 0 },
		{ t: 'Book a review with Maya', d: '30 minutes before the board meeting', tool: 'calendar.create', s: 0 }
	];
	let at = $state(1);
	let running = $state(true);
	let secs = $state(3);
	let active = $state('runs');
	const nav = [{ items: [{ id: 'home', label: 'Home', icon: '⌂' }, { id: 'chat', label: 'Chat', icon: '◎' }, { id: 'runs', label: 'Runs', icon: '◷', count: 3 }, { id: 'analytics', label: 'Analytics', icon: '▦' }, { id: 'deliv', label: 'Deliverables', icon: '▤' }] }, { label: 'Agents', items: [{ id: 'board', label: 'Board prep', icon: '✳' }, { id: 'rev', label: 'Revenue ops', icon: '✳' }, { id: 'inbox', label: 'Inbox triage', icon: '✳' }, { id: 'wf', label: 'Workflows', icon: '⛬' }] }];
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = setInterval(() => {
			if (!running) return;
			secs++;
			if (secs % 4 === 0 && at < 3) at++;
		}, 1000);
		return () => clearInterval(t);
	});
	const stop = () => ((running = false), onstop?.());
</script>

{#snippet side()}
	<div class="ui-scr__tabs"><span class="ui-scr__tab">◔ Needs your input</span></div>
	<div class="ui-scr__panel">
		{#if at >= 3 && running}<div class="ui-ag-card ui-arn__ask ui-ag-in"><b>Send the draft to Maya?</b><small>The memo is ready – it will go out by email.</small><div class="ui-ag-row"><button class="ui-ag-btn" data-variant="primary" onclick={() => (at = 4)}>Send</button><button class="ui-ag-btn" data-variant="ghost" onclick={stop}>Not yet</button></div></div>{:else}<div class="ui-scr__empty"><i>◔</i><b>Nothing needs you yet</b><span>The agent asks here before it sends or books anything.</span></div>{/if}
		<small class="ui-scr__k">Draft</small>
		<InlineDiff instruction="Board memo – Q3 Revenue" parts={['Revenue grew ', { del: '18', add: '21' }, '% in Q3 to $4.', { del: '2M', add: '3M' }, ', driven by six new enterprise customers. Churn ', { del: 'stayed flat at 2.', add: 'fell to 1.8' }, ' %, and the pipeline supports raising the Q4 target by 5%.']} />
		<small class="ui-scr__k">Files</small>
		<div class="ui-ag-row"><span class="ui-ag-pill" data-tone="blue">▤ board-memo-q3.md</span><span class="ui-ag-pill" data-tone="green">▦ q3-revenue.csv</span></div>
	</div>
{/snippet}

<AppShell {nav} bind:active aside={side} asideWidth={250}>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">Runs / <b>{title}</b></span>{#if running}<span class="ui-ag-pill" data-tone="blue">◌ Running</span>{:else}<span class="ui-ag-pill" data-tone="gray">Stopped</span>{/if}<span class="ui-ag-grow"></span><button class="ui-ag-btn" disabled={!running} onclick={stop}>◻ Stop run</button></div>
	<div class="ui-scr ui-arn">
		<small>✳ Board prep · started by Alex Morgan at 10:28 AM</small>
		<h1>{title}</h1>
		<span class="ui-ag-bar"><i style:width="{(at / steps.length) * 100}%"></i></span>
		<div class="ui-arn__stats"><span><small>Steps</small><b>{at} / {steps.length}</b></span><span><small>Tool calls</small><b>{at * 3 + 2}</b></span><span><small>Time</small><b>0:{String(secs).padStart(2, '0')}</b></span><span><small>Cost</small><b>${(0.05 * at + 0.04).toFixed(2)}</b></span></div>
		<div class="ui-ag-card ui-arn__plan">
			<div class="ui-ag-row"><b class="ui-ag-grow">☰ Plan</b><small>{steps.length} steps</small></div>
			{#each steps as s, i (s.t)}
				<div class="ui-arn__step" data-state={i < at ? 'done' : i === at && running ? 'run' : 'todo'}><span class="ui-arn__n">{i < at ? '✓' : i === at && running ? '◌' : i + 1}</span><span class="ui-ag-grow"><b>{s.t}</b><small>{s.d} <span class="ui-ag-kbd">{s.tool}</span></small></span><small>{i < at ? `${s.s}s` : ''}</small></div>
			{/each}
			<small>{running ? `◌ Running · ${at} of ${steps.length}` : `Stopped at step ${at + 1}`}</small>
		</div>
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-arn__stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}
	.ui-arn__stats span {
		display: grid;
		gap: 2px;
	}
	.ui-arn__stats b {
		font-size: 14px;
	}
	.ui-arn__plan {
		padding: 12px;
		display: grid;
		gap: 10px;
	}
	.ui-arn__step {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}
	.ui-arn__step .ui-ag-grow {
		display: grid;
		gap: 2px;
	}
	.ui-arn__step[data-state='todo'] b {
		font-weight: 400;
	}
	.ui-arn__n {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 9px;
		background: var(--ag-fill);
		color: var(--ag-muted);
		flex: none;
	}
	.ui-arn__step[data-state='done'] .ui-arn__n {
		background: var(--ag-blue);
		color: #fff;
	}
	.ui-arn__step[data-state='run'] .ui-arn__n {
		color: var(--ag-blue);
	}
	.ui-arn__ask {
		padding: 10px;
		display: grid;
		gap: 6px;
	}
	.ui-arn :global(.ui-ag-bar) {
		height: 3px;
	}
</style>
