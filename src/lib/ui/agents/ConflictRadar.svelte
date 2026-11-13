<!-- Conflict Radar – agents working on their own branches at once, and where they get in each other's way: a row per file and a column per agent, a line between the agents that touch the same lines, and a pick between their approaches to settle it. -->
<script lang="ts" module>
	export type Mark = 'changed' | 'conflict' | 'kept' | 'dropped' | null;
	export type RadarFile = { path: string; marks: Mark[] };
	export type Approach = { agent: number; text: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		agents = [
			{ name: 'Checkout', mark: '✳', color: '#d97757' },
			{ name: 'Stripe v2', mark: '◎', color: '#171717' },
			{ name: 'Retries', mark: '↻', color: '#525252' }
		],
		paths = ['src/checkout/payment.ts', 'src/checkout/receipt.tsx', 'tests/checkout.spec.ts', 'src/lib/stripe.ts', 'src/lib/retry.ts', 'package.json'],
		approaches = [
			{ agent: 0, text: 'Waits for the charge to settle before the receipt renders' },
			{ agent: 1, text: 'Moves to PaymentIntents.confirm with an idempotency key' },
			{ agent: 2, text: 'Wraps the charge in three retries with backoff' }
		] as Approach[],
		autoplay = true,
		onsettle
	}: { agents?: { name: string; mark: string; color: string }[]; paths?: string[]; approaches?: Approach[]; autoplay?: boolean; onsettle?: (path: string, agent: string) => void } = $props();
	// svelte-ignore state_referenced_locally
	let rows = $state<RadarFile[]>(paths.map((path) => ({ path, marks: agents.map(() => null) })));
	let started = $state(false);
	const set = (r: number, a: number, m: Mark) => (rows[r].marks[a] = m);
	const conflicted = $derived(rows.map((r, i) => (r.marks.filter((m) => m === 'conflict').length > 1 ? i : -1)).filter((i) => i >= 0));
	const first = $derived(conflicted[0]);
	function settle(r: number, a: number) {
		rows[r].marks = rows[r].marks.map((m, i) => (m === 'conflict' ? (i === a ? 'kept' : 'dropped') : m));
		onsettle?.(rows[r].path, agents[a].name);
	}
	onMount(() =>
		play(
			[
				[900, () => ((started = true), set(0, 0, 'changed'), set(1, 0, 'changed'))],
				[700, () => (set(3, 1, 'changed'), set(5, 1, 'changed'))],
				[700, () => (set(4, 2, 'changed'), set(2, 0, 'changed'))],
				[1200, () => (set(0, 0, 'conflict'), set(0, 1, 'conflict'), set(0, 2, 'conflict'))],
				[900, () => (set(2, 0, 'conflict'), set(2, 2, 'conflict'))]
			],
			{ autoplay }
		)
	);
	const status = $derived(!started ? `Waiting for ${agents.length} agents` : conflicted.length ? `${conflicted.length} conflict${conflicted.length > 1 ? 's' : ''} to settle` : rows.some((r) => r.marks.includes('kept')) ? 'All settled' : 'No overlaps');
</script>

<div class="ui-ag ui-ag-card ui-crd">
	<div class="ui-ag-title ui-crd__head"><span style:color="var(--ag-blue)">◎</span><b>Parallel work</b><span class="ui-ag-meta"><span class="ui-ag-pill" data-tone={conflicted.length ? 'amber' : 'gray'}>{status}</span></span></div>
	<table>
		<thead><tr><th><span class="ui-crd__leg"><i data-m="changed"></i>Changed <i data-m="conflict"></i>Conflict <i data-m="kept"></i>Kept</span></th>{#each agents as a (a.name)}<th><span style:color={a.color}>{a.mark}</span> {a.name}</th>{/each}</tr></thead>
		<tbody>
			{#each rows as r, ri (r.path)}
				{@const hits = r.marks.map((m, i) => (m === 'conflict' ? i : -1)).filter((i) => i >= 0)}
				<tr data-conflict={hits.length > 1 || undefined}>
					<td><span class="ui-crd__dot"></span><span class="ui-ag-muted">{r.path.includes('/') ? r.path.slice(0, r.path.lastIndexOf('/') + 1) : ''}</span>{r.path.split('/').pop()}</td>
					{#each r.marks as m, i (i)}<td class="ui-crd__cell">{#if m}<i data-m={m} title="{agents[i].name}: {m}"></i>{:else}<span class="ui-crd__none">–</span>{/if}</td>{/each}
					{#if hits.length > 1}<td class="ui-crd__line" aria-hidden="true" style:--from={hits[0]} style:--to={hits[hits.length - 1]}></td>{/if}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if first !== undefined}
		{#key first}
			<div class="ui-crd__pick ui-ag-in">
				<div class="ui-ag-row"><b>Pick a way</b><small class="ui-ag-muted">{rows[first].path.split('/').pop()} · lines {40 + first * 12}–{80 + first * 12}</small></div>
				<div class="ui-crd__opts">
					{#each approaches.filter((a) => rows[first].marks[a.agent] === 'conflict') as ap (ap.agent)}
						<button class="ui-ag-card ui-crd__opt" onclick={() => settle(first, ap.agent)}><span><span style:color={agents[ap.agent].color}>{agents[ap.agent].mark}</span> <b>{agents[ap.agent].name}</b></span><small>{ap.text}</small></button>
					{/each}
				</div>
			</div>
		{/key}
	{:else}
		<p class="ui-crd__foot">{started ? (rows.some((r) => r.marks.includes('kept')) ? 'Every overlap is settled – the branches can merge.' : 'No two agents touch the same lines.') : `Watching ${agents.length} agents for overlaps`}</p>
	{/if}
</div>

<style>
	.ui-crd {
		width: 100%;
		max-width: 470px;
		padding: 0;
		font-size: 12px;
		overflow: hidden;
	}
	.ui-crd__head {
		padding: 12px 14px;
	}
	b {
		font-weight: 500;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		font-weight: 400;
		color: var(--ag-muted);
		font-size: 11px;
		padding: 6px 8px;
		border-top: 1px solid var(--ag-line);
		border-bottom: 1px solid var(--ag-line);
		text-align: center;
		white-space: nowrap;
	}
	th:first-child {
		text-align: left;
		padding-left: 14px;
	}
	th + th,
	td + td {
		border-left: 1px solid var(--ag-line);
	}
	.ui-crd__leg {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 10.5px;
	}
	.ui-crd__leg i {
		width: 12px !important;
	}
	tr {
		position: relative;
		transition: background-color 0.3s;
	}
	tr[data-conflict] {
		background: color-mix(in srgb, var(--ag-amber) 8%, transparent);
	}
	td {
		padding: 6px 8px;
		border-bottom: 1px solid var(--ag-line);
		white-space: nowrap;
	}
	td:first-child {
		padding-left: 14px;
	}
	.ui-crd__dot {
		display: inline-block;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		margin-right: 6px;
		background: var(--ag-line);
	}
	tr[data-conflict] .ui-crd__dot {
		background: var(--ag-amber);
	}
	.ui-crd__cell {
		text-align: center;
		width: 70px;
	}
	.ui-crd__none {
		color: var(--ag-line);
	}
	i[data-m] {
		display: inline-block;
		width: 22px;
		height: 6px;
		border-radius: 3px;
		vertical-align: middle;
		transform-origin: left;
		animation: ui-crd-grow 0.5s var(--ag-ease) both;
	}
	@keyframes ui-crd-grow {
		from {
			transform: scaleX(0);
		}
	}
	i[data-m='changed'] {
		background: color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	i[data-m='conflict'] {
		background: color-mix(in srgb, var(--ag-amber) 70%, transparent);
	}
	i[data-m='kept'] {
		background: color-mix(in srgb, var(--ag-green) 55%, transparent);
	}
	i[data-m='dropped'] {
		background: var(--ag-line);
	}
	.ui-crd__line {
		position: absolute;
		left: calc(100% - 70px * (3 - var(--from)) - 35px + 11px);
		width: calc(70px * (var(--to) - var(--from)) - 22px);
		top: 50%;
		padding: 0;
		border: 0 !important;
		border-top: 1.5px solid color-mix(in srgb, var(--ag-amber) 60%, transparent) !important;
		transform-origin: left;
		animation: ui-crd-grow 0.6s var(--ag-ease) both;
	}
	.ui-crd__pick {
		padding: 10px 14px 12px;
		display: grid;
		gap: 8px;
	}
	.ui-crd__opts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		gap: 6px;
	}
	.ui-crd__opt {
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 8px 10px;
		display: grid;
		gap: 4px;
		align-content: start;
		cursor: pointer;
		background: var(--ag-fill);
		box-shadow: none;
	}
	.ui-crd__opt:hover {
		box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 40%, transparent);
	}
	.ui-crd__opt small {
		color: var(--ag-muted);
		font-size: 11px;
		line-height: 1.4;
	}
	.ui-crd__foot {
		margin: 0;
		padding: 22px 14px;
		text-align: center;
		color: var(--ag-muted);
	}
</style>
