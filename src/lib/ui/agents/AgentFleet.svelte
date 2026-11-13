<!-- Agent Fleet – several agents side by side: each card sums up its sub-agents, and a click opens its tree to the right while the last one folds back into its card. Costs and clocks tick while they run. -->
<script lang="ts" module>
	export type Status = 'running' | 'done' | 'needs' | 'failed' | 'queued';
	export type Sub = { name: string; model: string; mark: string; color: string; status: Status; task: string; tools: number[]; cost: number; secs: number; tasks?: number; child?: boolean };
	export type Lead = Sub & { subs: Sub[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play, tick } from '../utils/script';
	import './agents.css';
	const S = (name: string, model: string, mark: string, color: string, status: Status, task: string, tools: number[], cost: number, secs: number, tasks?: number, child = false): Sub => ({ name, model, mark, color, status, task, tools, cost, secs, tasks, child });
	let {
		leads = $bindable([
			{ ...S('Launch lead', 'Atlas Max', '✳', '#d97757', 'running', 'Launch the new pricing page by Friday', [3, 11, 8], 1.71, 842), subs: [S('Researcher', 'Atlas Pro', '✳', '#d97757', 'done', 'Compare the pricing of five competitors', [11, 9], 0.31, 420, 4), S('Writer', 'Atlas Pro', '✳', '#d97757', 'needs', 'Write the copy for the three plans', [11, 1], 0.18, 722), S('Coder', 'Orbit Pro', '◎', '#171717', 'running', 'Build the page and wire up checkout', [11, 8, 1], 0.77, 662, 4), S('Tester', 'Orbit Mini', '◎', '#171717', 'running', 'Run the checkout tests', [11, 8], 0.08, 182, 3, true)] },
			{ ...S('Support lead', 'Atlas Pro', '✳', '#d97757', 'running', 'Answer the 48 open tickets in the queue', [9, 3], 0.83, 1562), subs: [S('Triage', 'Prism Flash', '✦', '#3b82f6', 'done', 'Sort the tickets by product and urgency', [9], 0.04, 300, 3), S('Billing', 'Atlas Pro', '✳', '#d97757', 'running', 'Reply to 19 questions about invoices', [8, 9], 0.4, 1205, 4), S('Bug reports', 'Orbit Mini', '◎', '#171717', 'running', 'Reproduce and file 11 bug reports', [11, 1], 0.2, 1085, 3), S('Escalation', 'Atlas Pro', '✳', '#d97757', 'queued', 'Hand upset customers to a human', [9], 0, 0, 1)] },
			{ ...S('Release manager', 'Orbit Pro', '◎', '#171717', 'running', 'Ship version 2.4 to the App Store', [11, 3], 0.58, 2282), subs: [S('Changelog', 'Atlas Pro', '✳', '#d97757', 'done', 'Write the release notes from 4 merged PRs', [11, 1], 0.09, 240, 3), S('iOS build', 'Orbit Mini', '◎', '#171717', 'failed', 'Sign and upload the iOS build', [11], 0.06, 180), S('Screenshots', 'Prism Flash', '✦', '#3b82f6', 'done', 'Render the store screenshots in 6 sizes', [1], 0.15, 480, 3)] },
			{ ...S('Market analyst', 'Prism Pro', '✦', '#3b82f6', 'done', 'Write the weekly competitor report', [11, 3], 0.82, 2520), subs: [S('Scanner', 'Prism Flash', '✦', '#3b82f6', 'done', 'Check 9 competitor sites for changes', [9], 0.21, 600, 4), S('Analyst', 'Prism Pro', '✦', '#3b82f6', 'done', 'Sum up the changes and what they mean', [11], 0.38, 900, 2), S('Writer', 'Atlas Pro', '✳', '#d97757', 'done', 'Write the report in the team template', [11], 0.23, 540, 1)] }
		] as Lead[]),
		active = $bindable(0),
		autoplay = true,
		onanswer
	}: { leads?: Lead[]; active?: number; autoplay?: boolean; onanswer?: (s: Sub) => void } = $props();
	let user = $state(false);
	const all = $derived(leads.flatMap((l) => [l, ...l.subs]));
	const running = $derived(all.filter((a) => a.status === 'running').length);
	const needs = $derived(all.filter((a) => a.status === 'needs').length);
	const total = $derived(leads.reduce((s, l) => s + l.cost, 0));
	const sum = (l: Lead) => (l.subs.some((s) => s.status === 'failed') ? `${l.subs.filter((s) => s.status === 'failed').length} failed` : l.subs.some((s) => s.status === 'needs') ? `${l.subs.filter((s) => s.status === 'needs').length} needs you` : l.subs.every((s) => s.status === 'done') ? `All ${l.subs.length} done` : `${l.subs.filter((s) => s.status === 'running').length}/${l.subs.length} running`);
	const clock = (s: number) => `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
	const label: Record<Status, string> = { running: 'Running', done: 'Done', needs: 'Needs you', failed: 'Failed', queued: 'Queued' };
	const tone: Record<Status, string> = { running: 'blue', done: 'green', needs: 'amber', failed: 'red', queued: 'gray' };
	function resolve(li: number, si: number, to: Status) {
		leads = leads.map((l, i) => (i !== li ? l : { ...l, subs: l.subs.map((s, j) => (j === si ? { ...s, status: to } : s)) }));
		onanswer?.(leads[li].subs[si]);
	}
	onMount(() => {
		const t = tick(1000, () => (leads = leads.map((l) => ({ ...l, ...(l.status === 'running' ? { secs: l.secs + 1, cost: l.cost + 0.013 } : {}), subs: l.subs.map((s) => (s.status === 'running' ? { ...s, secs: s.secs + 1, cost: s.cost + 0.004 } : s)) }))));
		const p = play([[4000, () => !user && (active = 1)], [4000, () => !user && (active = 2)], [4000, () => !user && (active = 0)]], { autoplay, still: 0, loop: () => {} });
		return () => (t(), p());
	});
	const cents = (n: number) => { const s = n.toFixed(2); return [s.slice(0, -1), s.slice(-1)]; };
</script>

{#snippet card(a: Sub, lead: boolean, li: number, si = -1)}
	<span class="ui-afl__top"><span class="ui-afl__mk" style:color={a.color}>{a.mark}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model}</small></span><span class="ui-ag-pill" data-tone={tone[a.status]}>{#if a.status === 'running'}<i class="ui-ag-spin"></i>{:else if a.status === 'done'}✓{:else if a.status === 'needs'}◷{:else if a.status === 'failed'}⚠{/if} {label[a.status]}</span></span>
	<span class="ui-afl__task">{#each a.tools as t (t)}<Mark i={t} size={11} />{/each}<span>{a.task}</span></span>
	<span class="ui-afl__foot">{#if lead}<small>◷ {sum(leads[li])}</small>{:else}<small><b class="ui-afl__c">${cents(a.cost)[0]}<em>{cents(a.cost)[1]}</em></b> · {clock(a.secs)}</small>{/if}<span class="ui-ag-grow"></span>{#if lead}<small><b class="ui-afl__c">${cents(a.cost)[0]}<em>{cents(a.cost)[1]}</em></b> · {clock(a.secs)}</small>{:else if a.status === 'needs'}<span role="button" tabindex="0" class="ui-ag-btn ui-afl__act" onclick={(e) => (e.stopPropagation(), resolve(li, si, 'running'))} onkeydown={(e) => e.key === 'Enter' && resolve(li, si, 'running')}>Answer</span>{:else if a.status === 'failed'}<span role="button" tabindex="0" class="ui-ag-btn ui-afl__act" onclick={(e) => (e.stopPropagation(), resolve(li, si, 'running'))} onkeydown={(e) => e.key === 'Enter' && resolve(li, si, 'running')}>Resolve</span>{:else if a.tasks}<small>{a.tasks} task{a.tasks > 1 ? 's' : ''}</small>{/if}</span>
{/snippet}

<div class="ui-ag ui-afl">
	<div class="ui-ag-title"><span style:color="var(--ag-blue)">✦</span><b>Fleet</b><span class="ui-ag-meta">{leads.length} agents / {all.length - leads.length} sub-agents &nbsp; {running} running &nbsp; {needs} needs you &nbsp; <b class="ui-afl__c" style:color="var(--ag-ink)">${cents(total)[0]}<em>{cents(total)[1]}</em></b></span></div>
	<div class="ui-afl__cols">
		<div class="ui-afl__leads">
			{#each leads as l, i (l.name)}
				<button class="ui-ag-card ui-afl__card" aria-pressed={active === i} data-dim={active !== i || undefined} onclick={() => ((active = i), (user = true))}>{@render card(l, true, i)}</button>
			{/each}
		</div>
		{#key active}
			<div class="ui-afl__tree" style:--y="{active * 104 + 46}px">
				<svg class="ui-afl__wires" aria-hidden="true"><path d="M0,{active * 104 + 46} C14,{active * 104 + 46} 14,{active * 104 + 46} 28,{active * 104 + 46}" /></svg>
				{#each leads[active].subs as s, j (s.name + j)}
					<div class="ui-ag-card ui-afl__card ui-afl__sub" data-child={s.child || undefined} style:animation-delay="{j * 70}ms">{@render card(s, false, active, j)}</div>
				{/each}
			</div>
		{/key}
	</div>
</div>

<style>
	.ui-afl {
		width: 100%;
		max-width: 640px;
		display: grid;
		gap: 10px;
		font-size: 12.5px;
	}
	.ui-afl__cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 56px;
		align-items: start;
	}
	.ui-afl__leads,
	.ui-afl__tree {
		display: grid;
		gap: 8px;
	}
	.ui-afl__tree {
		position: relative;
		border-left: 1.5px solid color-mix(in srgb, var(--ag-blue) 40%, transparent);
		padding-left: 18px;
		margin-left: -28px;
	}
	.ui-afl__wires {
		position: absolute;
		left: -30px;
		top: 0;
		width: 30px;
		height: 100%;
		overflow: visible;
		fill: none;
		stroke: color-mix(in srgb, var(--ag-blue) 40%, transparent);
		stroke-width: 1.5;
	}
	.ui-afl__card {
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 9px 10px;
		display: grid;
		gap: 6px;
		cursor: pointer;
		transition: opacity 0.3s var(--ag-ease);
	}
	.ui-afl__card[data-dim] {
		opacity: 0.5;
	}
	.ui-afl__card[aria-pressed='true'] {
		opacity: 1;
	}
	.ui-afl__sub {
		cursor: default;
		animation: ui-ag-rise 0.45s var(--ag-ease) both;
	}
	.ui-afl__sub[data-child] {
		margin-left: 22px;
	}
	.ui-afl__top {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}
	.ui-afl__top .ui-ag-grow {
		display: grid;
		line-height: 1.25;
	}
	.ui-afl__top b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-afl__mk {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		font-size: 11px;
		flex: none;
	}
	.ui-afl__task {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
	}
	.ui-afl__task span {
		margin-left: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-afl__foot {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-afl__c {
		font-weight: 500;
		color: var(--ag-ink);
		font-variant-numeric: tabular-nums;
	}
	.ui-afl__c em {
		font-style: normal;
		opacity: 0.4;
	}
	.ui-afl__act {
		padding: 2px 8px;
		font-size: 11px;
	}
</style>
