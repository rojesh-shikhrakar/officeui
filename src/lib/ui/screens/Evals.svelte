<!-- Evals – a prompt evaluation dashboard: pass rate, score, latency and cost against the last version, pass rate by version, the prompt change to review, and the test cases with a filter. -->
<script lang="ts" module>
	export type Case = { id: string; input: string; expected: string; output: string; score: number; result: 'pass' | 'partial' | 'fail'; latency: number };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import InlineDiff from '../agents/InlineDiff.svelte';
	import { linePath } from '../agents/chart';
	import './shell/screen.css';
	let {
		prompt = 'Support reply prompt',
		version = 'v12',
		cases = [
			{ id: 'TC-01', input: "Where is my order #48213? It's been 9 days", expected: 'Look up the status, share the tracking link', output: 'Sorry for the wait – order #48213 shipped on May…', score: 5, result: 'pass', latency: 1.2 },
			{ id: 'TC-02', input: 'Can I get a refund for my annual plan?', expected: 'Link the refund policy, no promises', output: 'Annual plans can be refunded within 30 days of p…', score: 5, result: 'pass', latency: 1.2 },
			{ id: 'TC-03', input: 'Wie ändere ich meine Rechnungsadresse?', expected: 'Answer in German with the settings path', output: 'Unter Einstellungen → Abrechnung → Adresse…', score: 5, result: 'pass', latency: 1.1 },
			{ id: 'TC-04', input: 'My invoice shows the wrong VAT number.', expected: 'Explain how to edit it, offer to reissue', output: 'You can fix the VAT number in Settings → Billing…', score: 4, result: 'pass', latency: 1.4 },
			{ id: 'TC-05', input: 'The app crashes when I upload a 200 MB file', expected: 'Mention the 100 MB limit and suggest…', output: 'Uploads are limited to 100 MB per file, which is w…', score: 3, result: 'partial', latency: 1.6 },
			{ id: 'TC-06', input: 'How do I add a teammate to my workspace?', expected: 'Settings → Members → Invite, mention seats', output: 'Go to Settings → Members → Invite and enter thei…', score: 5, result: 'pass', latency: 1.0 },
			{ id: 'TC-07', input: 'Cancel my account right now', expected: 'Confirm, link to cancellation, no retention push', output: "I'm sorry to see you go! Before you leave, did you…", score: 1, result: 'fail', latency: 1.3 }
		] as Case[],
		onrun
	}: { prompt?: string; version?: string; cases?: Case[]; onrun?: () => void } = $props();
	let active = $state('evals');
	let filter = $state<'all' | 'pass' | 'partial' | 'fail'>('all');
	let running = $state(false);
	const nav = [{ items: [{ id: 'home', label: 'Home', icon: '⌂' }, { id: 'chat', label: 'Chat', icon: '◎' }, { id: 'evals', label: 'Evals', icon: '⚗', count: 3 }, { id: 'data', label: 'Datasets', icon: '▦' }, { id: 'an', label: 'Analytics', icon: '▦' }] }, { label: 'Prompts', items: [{ id: 'sr', label: 'Support reply', icon: '▭' }, { id: 'tt', label: 'Ticket triage', icon: '▭' }, { id: 'rc', label: 'Refund check', icon: '▭' }, { id: 'ob', label: 'Onboarding', icon: '⚇' }] }];
	const versions = [72, 74, 73, 78, 80, 79, 83, 84, 82, 86, 88, 92];
	const shown = $derived(cases.filter((c) => filter === 'all' || c.result === filter));
	const cnt = (r: string) => cases.filter((c) => c.result === r).length;
	const metrics = [['Pass rate', '92%', '+4', true], ['Avg score', '4.6', '+0.3', true], ['Latency p50', '1.2s', '−0.2s', true], ['Cost per 1k runs', '$1.84', '+$0.06', false]] as const;
	function run() {
		running = true;
		onrun?.();
		setTimeout(() => (running = false), 1500);
	}
</script>

<AppShell {nav} bind:active>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">Evals / <b>{prompt}</b> <span class="ui-ag-pill" data-tone="gray">{version} current</span> <span class="ui-ag-kbd">model-pro-5</span></span><span class="ui-ag-grow"></span><small>Last run 2 hours ago</small><button class="ui-ag-btn" data-variant="primary" disabled={running} onclick={run}>{running ? '◌ Running…' : '▷ Run eval'}</button></div>
	<div class="ui-evl">
		<div class="ui-evl__m">{#each metrics as [l, v, d, good] (l)}<div class="ui-ag-card"><small>{l}</small><div class="ui-ag-row"><b class="ui-ag-grow">{v}</b><small style:color={good ? 'var(--ag-green)' : 'var(--ag-red)'}>{d} vs v11</small></div></div>{/each}</div>
		<div class="ui-evl__row">
			<div class="ui-ag-card ui-evl__chart"><small>Pass rate by version</small><div class="ui-ag-row"><b>92%</b><span class="ui-ag-pill" data-tone="green">+4%</span></div><svg viewBox="0 0 300 90" preserveAspectRatio="none" role="img" aria-label="Pass rate rising from 72% in v1 to 92% in v12"><path d={linePath(versions, 300, 90, 100)} fill="none" stroke="var(--ag-blue)" vector-effect="non-scaling-stroke" /></svg><div class="ui-ag-row"><small class="ui-ag-grow">v1</small><small class="ui-ag-grow" style:text-align="center">v7</small><small>v12</small></div><small>Last 12 versions · {cases.length} test cases</small></div>
			<InlineDiff instruction="Changes in v12 · system prompt, edited by Mara K." parts={['You are a support agent. Answer the question ', { del: 'politely and in as much detail as possible', add: 'in three sentences or fewer' }, ", in the customer's language. If ", { del: 'you are', add: 'the answer is' }, ' not in the help center, ', { del: 'apologize', add: 'say so' }, ' and offer to hand the ticket to a human. Never promise refunds; link the refund policy instead.']} />
		</div>
		<div class="ui-ag-row"><b class="ui-ag-grow">Test cases <small>{cases.length}</small></b><div class="ui-ag-tabs" role="tablist">{#each [['all', 'All', cases.length], ['pass', 'Pass', cnt('pass')], ['partial', 'Partial', cnt('partial')], ['fail', 'Fail', cnt('fail')]] as [k, l, n] (k)}<button class="ui-ag-tab" role="tab" aria-selected={filter === k} onclick={() => (filter = k as typeof filter)}>{l} {n}</button>{/each}</div></div>
		<table><thead><tr><th>Input</th><th>Expected</th><th>{version} output</th><th>Score</th><th>Latency</th></tr></thead><tbody>{#each shown as c (c.id)}<tr><td><small>{c.id}</small> {c.input}</td><td class="ui-ag-muted">{c.expected}</td><td class="ui-ag-muted">{c.output}</td><td><span class="ui-ag-pill" data-tone={c.result === 'pass' ? 'green' : c.result === 'partial' ? 'amber' : 'red'}>● {c.result[0].toUpperCase() + c.result.slice(1)} {c.score}/5</span></td><td>{c.latency}s</td></tr>{/each}</tbody></table>
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
	.ui-evl {
		padding: 10px;
		display: grid;
		gap: 10px;
	}
	.ui-evl__m {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.ui-evl__m .ui-ag-card {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
	}
	.ui-evl__m b {
		font-size: 15px;
	}
	.ui-evl__row {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: 8px;
		align-items: start;
	}
	.ui-evl__row :global(.ui-idf) {
		max-width: none;
		font-size: 11px;
	}
	.ui-evl__chart {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
	}
	.ui-evl__chart svg {
		width: 100%;
		height: 90px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 10.5px;
	}
	th {
		text-align: left;
		font-weight: 400;
		color: var(--ag-muted);
		padding: 6px;
		border-bottom: 1px solid var(--ag-line);
	}
	th:nth-child(4) {
		width: 90px;
	}
	th:nth-child(5) {
		width: 50px;
	}
	td {
		padding: 8px 6px;
		border-bottom: 1px solid var(--ag-line);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
