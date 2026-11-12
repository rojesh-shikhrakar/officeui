<!-- Decision Tree – an agent stuck on a decision lays out its options as a tree: the consequences of each branch, the risky ones marked, its own pick highlighted – and you pick a branch (keys 1–4, a second press confirms; → for the next decision). -->
<script lang="ts" module>
	export type Leaf = { label: string; detail: string; pick?: boolean; risky?: boolean; note?: string };
	export type TreeBranch = { label: string; icon?: string; agentsPick?: boolean; next?: { question: string; options: Leaf[] } };
	export type Decision = { agent: string; model: string; mark: string; color: string; risk: 'High risk' | 'Medium risk' | 'Low risk'; question: string; detail: string; branches: TreeBranch[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		decisions = [
			{
				agent: 'Incident agent', model: 'Atlas Max', mark: '✳', color: '#d97757', risk: 'High risk',
				question: 'Checkout errors jumped to 18% after deploy #482 – what should I do?', detail: '2,140 errors in 12 minutes · about $3.2k in orders an hour at risk.',
				branches: [
					{ label: 'Roll back to #481', icon: '▲', agentsPick: true, next: { question: 'Tell customers about it?', options: [{ label: 'Post on the status page', detail: 'Public · updates every 15 min', pick: true }, { label: 'Only tell the team', detail: '#incidents only · nothing public' }] } },
					{ label: 'Ship a hotfix', icon: '⑂', next: { question: 'Wait for the test run?', options: [{ label: 'Ship right away', detail: 'Skips 1,284 tests', risky: true }, { label: 'After the tests', detail: '14 min · errors keep coming' }] } },
					{ label: 'Turn the flag off', icon: '⚑', next: { question: '', options: [{ label: 'New checkout off for 30%', detail: 'The old one takes over' }] } },
					{ label: 'Other…' }
				]
			},
			{
				agent: 'Sales agent', model: 'Orbit Pro', mark: '◎', color: '#171717', risk: 'Medium risk',
				question: 'Acme wants 25% off their $84k renewal or they’ll leave – how should I respond?', detail: 'Renewal in 9 days · 212 seats · they asked twice on yesterday’s call.',
				branches: [
					{ label: 'Offer 15% instead', icon: '◐', agentsPick: true, next: { question: 'Tie it to a longer contract?', options: [{ label: 'Only with 2 years', detail: '$71.4k a year until 2028', pick: true }, { label: 'For one year', detail: '$71.4k · renews at full price' }] } },
					{ label: 'Ask the VP', icon: '⚇', next: { question: 'What should I send along?', options: [{ label: 'The call notes', detail: 'Plus the usage report', note: 'Anything above 20% off needs the VP’s approval before the quote goes out.' }] } },
					{ label: 'Accept 25%', icon: '$', next: { question: '', options: [{ label: '$63k a year', detail: 'Needs sign-off', risky: true }] } },
					{ label: 'Other…' }
				]
			},
			{
				agent: 'Ops agent', model: 'Prism Flash', mark: '✦', color: '#3b82f6', risk: 'Low risk',
				question: 'The nightly backup took 3× longer than usual – what now?', detail: '2h 41m instead of 52m · finished, nothing missing.',
				branches: [
					{ label: 'Watch it tonight', icon: '◔', agentsPick: true, next: { question: 'Alert when?', options: [{ label: 'Over 1h 30m', detail: 'Pages the on-call', pick: true }, { label: 'Only if it fails', detail: 'No page otherwise' }] } },
					{ label: 'Move it earlier', icon: '◷', next: { question: '', options: [{ label: 'Start at 1:00', detail: 'Before the import job' }] } },
					{ label: 'Other…' }
				]
			}
		] as Decision[],
		autoplay = true,
		onpick
	}: { decisions?: Decision[]; autoplay?: boolean; onpick?: (d: Decision, branch: TreeBranch, leaf?: Leaf) => void } = $props();
	let at = $state(0);
	let focus = $state(0);
	let leaf = $state<number | null>(null);
	let done = $state<Record<number, string>>({});
	const d = $derived(decisions[at]);
	const left = $derived(decisions.length - Object.keys(done).length);
	function confirm(i: number) {
		const b = d.branches[i];
		const l = leaf !== null ? b.next?.options[leaf] : b.next?.options.find((o) => o.pick);
		done[at] = b.label + (l ? ` · ${l.label}` : '');
		onpick?.(d, b, l);
		next();
	}
	function next() {
		const n = decisions.findIndex((_, k) => !done[k] && k !== at);
		if (n >= 0) at = n;
		focus = Math.max(0, decisions[at].branches.findIndex((b) => b.agentsPick));
		leaf = null;
	}
	function choose(i: number) {
		if (focus === i) confirm(i);
		else ((focus = i), (leaf = null));
	}
	function key(e: KeyboardEvent) {
		if ((e.target as HTMLElement).matches('input, textarea') || done[at]) return;
		const n = +e.key;
		if (n >= 1 && n <= d.branches.length) choose(n - 1);
		else if (e.key === 'ArrowRight') next();
	}
	onMount(() => play([[3200, () => confirm(focus)], [3600, () => (focus = 1)], [1600, () => confirm(0)]], { autoplay, still: 0 }));
	const tone = { 'High risk': 'red', 'Medium risk': 'amber', 'Low risk': 'gray' } as const;
</script>

<svelte:window onkeydown={key} />

<div class="ui-ag ui-dtr">
	<div class="ui-ag-title"><span style:color="var(--ag-blue)">⑂</span><b>Decisions</b><span class="ui-ag-muted">{left} waiting for you</span><span class="ui-ag-meta"><span class="ui-dtr__dots">{#each decisions as _, k (k)}<i data-on={k === at || undefined} data-done={done[k] ? '' : undefined}></i>{/each}</span>{Math.min(at + 1, decisions.length)} of {decisions.length}</span></div>
	{#key at}
		<div class="ui-dtr__body ui-ag-in">
			<div class="ui-dtr__root">
				<span class="ui-ag-pill" data-tone={tone[d.risk]}>{d.risk}</span>
				<div class="ui-ag-card ui-dtr__q"><div class="ui-ag-row"><span class="ui-dtr__mk" style:color={d.color}>{d.mark}</span><span class="ui-ag-grow"><b>{d.agent}</b><small>{d.model}</small></span></div><b class="ui-dtr__qt">{d.question}</b><small class="ui-ag-muted">{d.detail}</small></div>
			</div>
			<div class="ui-dtr__branches">
				{#each d.branches as b, i (b.label)}
					<div class="ui-dtr__branch" data-focus={focus === i || undefined}>
						<button class="ui-ag-card ui-dtr__opt" aria-label="{b.label}{b.agentsPick ? ' – the agent’s pick' : ''}" onclick={() => choose(i)}><span class="ui-ag-kbd">{i + 1}</span>{#if b.icon}<span class="ui-dtr__ic">{b.icon}</span>{/if}<span><b>{b.label}</b>{#if b.agentsPick}<small class="ui-dtr__ap">Agent's pick</small>{/if}</span></button>
						{#if b.next}
							<div class="ui-dtr__next">
								{#if b.next.question}<small class="ui-dtr__nq">{b.next.question}</small>{/if}
								{#each b.next.options as o, k (o.label)}
									<button class="ui-ag-card ui-dtr__leaf" data-pick={o.pick || undefined} data-chosen={focus === i && leaf === k ? '' : undefined} aria-label="{o.label}{o.pick ? ' – the agent’s pick' : ''}" onclick={() => ((focus = i), (leaf = k))}>
										<span class="ui-ag-row"><span class="ui-ag-kbd">{k + 1}</span><b class="ui-ag-grow">{o.label}</b>{#if o.pick}<small class="ui-dtr__ap">Agent's pick</small>{/if}</span>
										<small data-risky={o.risky || undefined}>{o.detail}</small>
										{#if o.note && focus === i}<span class="ui-dtr__note ui-ag-in"><b>⚠ Agent's note</b>{o.note}</span>{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/key}
	<small class="ui-ag-muted">{#if left === 0}All decided – {Object.values(done).join(' · ')}{:else}Pick a branch <span class="ui-ag-kbd">1</span> – <span class="ui-ag-kbd">{d.branches.length}</span> · next <span class="ui-ag-kbd">→</span>{/if}</small>
</div>

<style>
	.ui-dtr {
		width: 100%;
		max-width: 620px;
		display: grid;
		gap: 12px;
		font-size: 11.5px;
	}
	b {
		font-weight: 500;
	}
	small {
		font-size: 10.5px;
	}
	.ui-dtr__dots {
		display: inline-flex;
		gap: 3px;
		margin-right: 8px;
	}
	.ui-dtr__dots i {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--ag-line);
		transition: width 0.3s var(--ag-ease);
	}
	.ui-dtr__dots i[data-on] {
		width: 12px;
		border-radius: 3px;
		background: var(--ag-ink);
	}
	.ui-dtr__dots i[data-done] {
		background: var(--ag-green);
	}
	.ui-dtr__body {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 22px;
		align-items: center;
	}
	.ui-dtr__root {
		display: grid;
		gap: 6px;
		justify-items: start;
	}
	.ui-dtr__q {
		padding: 10px;
		display: grid;
		gap: 6px;
	}
	.ui-dtr__q .ui-ag-grow {
		display: grid;
		line-height: 1.25;
	}
	.ui-dtr__q small {
		color: var(--ag-muted);
	}
	.ui-dtr__mk {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		font-size: 10px;
	}
	.ui-dtr__qt {
		line-height: 1.4;
	}
	.ui-dtr__branches {
		position: relative;
		display: grid;
		gap: 8px;
		padding-left: 16px;
		border-left: 1.5px solid var(--ag-line);
	}
	.ui-dtr__branch {
		position: relative;
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 16px;
		align-items: start;
		opacity: 0.45;
		transition: opacity 0.3s var(--ag-ease);
	}
	.ui-dtr__branch::before {
		content: '';
		position: absolute;
		left: -17px;
		top: 16px;
		width: 16px;
		border-top: 1.5px solid var(--ag-line);
	}
	.ui-dtr__branch[data-focus] {
		opacity: 1;
	}
	.ui-dtr__branch[data-focus]::before {
		border-top-color: color-mix(in srgb, var(--ag-blue) 55%, transparent);
	}
	.ui-dtr__opt,
	.ui-dtr__leaf {
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-dtr__opt {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		padding: 7px 8px;
	}
	.ui-dtr__opt > span:last-child {
		display: grid;
	}
	[data-focus] .ui-dtr__opt {
		box-shadow:
			var(--ag-shadow),
			0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	.ui-dtr__ic {
		font-size: 10px;
	}
	.ui-dtr__ap {
		color: var(--ag-blue);
	}
	.ui-dtr__next {
		display: grid;
		gap: 4px;
	}
	.ui-dtr__nq {
		color: var(--ag-muted);
	}
	.ui-dtr__leaf {
		display: grid;
		gap: 2px;
		padding: 6px 8px;
		box-shadow: none;
		background: var(--ag-fill);
	}
	.ui-dtr__leaf[data-pick] {
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
	}
	.ui-dtr__leaf[data-chosen] {
		box-shadow: 0 0 0 1.5px var(--ag-blue);
	}
	.ui-dtr__leaf small {
		color: var(--ag-muted);
	}
	.ui-dtr__leaf small[data-risky] {
		color: var(--ag-amber);
	}
	.ui-dtr__note {
		display: grid;
		gap: 2px;
		margin-top: 4px;
		padding: 6px 8px;
		border-radius: 6px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		font-size: 10.5px;
	}
	.ui-dtr__note b {
		color: var(--ag-amber);
		font-size: 9px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
</style>
