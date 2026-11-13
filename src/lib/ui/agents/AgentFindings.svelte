<!-- Agent Findings – a swarm of agents checking something: one calm row per agent with its progress, and their findings sliding into a short feed as they're found. Click an agent to see only its findings. -->
<script lang="ts" module>
	export type Checker = { name: string; mark: string; color: string; doing: string[]; done: number; total: number };
	export type Finding = { id: number; title: string; by: string; where: string; severity: 'critical' | 'warning' | 'note'; at: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play, tick } from '../utils/script';
	import './agents.css';
	let {
		title = 'Verification',
		total = 64,
		agents = $bindable([
			{ name: 'Auditor', mark: '✳', color: '#d97757', doing: ['Tracing calls in Vault.withdraw', 'Checking access control on mint'], done: 1, total: 24 },
			{ name: 'Fuzzer', mark: '◎', color: '#171717', doing: ['Fuzzing transfer with 10k inputs', 'Replaying failed sequences'], done: 1, total: 18 },
			{ name: 'Prover', mark: '✦', color: '#3b82f6', doing: ['Proving totalSupply invariant', 'Checking balance conservation'], done: 0, total: 12 },
			{ name: 'Gas review', mark: '✳', color: '#d97757', doing: ['Profiling storage reads', 'Checking loop costs'], done: 0, total: 10 }
		] as Checker[]),
		findings = $bindable([{ id: 1, title: 'Constant could be immutable', by: 'Gas review', where: 'Pool.sol:12', severity: 'note', at: -42 }] as Finding[]),
		autoplay = true
	}: { title?: string; total?: number; agents?: Checker[]; findings?: Finding[]; autoplay?: boolean } = $props();
	let now = $state(0);
	let only = $state<string | null>(null);
	let open = $state<number | null>(null);
	const checked = $derived(agents.reduce((s, a) => s + a.done, 0));
	const count = (sev: string, by?: string) => findings.filter((f) => f.severity === sev && (!by || f.by === by)).length;
	const shown = $derived(findings.filter((f) => !only || f.by === only).slice(0, 4));
	const age = (at: number) => (now - at < 2 ? 'now' : `${Math.round(now - at)}s`);
	const step = (gains: number[]) => (agents = agents.map((a, i) => ({ ...a, done: Math.min(a.total, a.done + (gains[i] ?? 0)) })));
	const find = (f: Omit<Finding, 'id' | 'at'>) => (findings = [{ ...f, id: findings.length + 1, at: now }, ...findings]);
	onMount(() => {
		const stop = play(
			[
				[700, () => step([1, 1, 1, 1])],
				[900, () => (step([1, 1, 0, 1]), find({ title: 'Reentrancy in withdraw()', by: 'Auditor', where: 'Vault.sol:142', severity: 'critical' }))],
				[900, () => step([1, 1, 1, 0])],
				[900, () => (step([1, 0, 0, 1]), find({ title: 'Return value of transfer not checked', by: 'Fuzzer', where: 'Token.sol:88', severity: 'warning' }))],
				[1200, () => step([2, 2, 1, 1])],
				[1200, () => (step([2, 1, 1, 1]), find({ title: 'Loop reads storage on every pass', by: 'Gas review', where: 'Pool.sol:61', severity: 'warning' }))],
				[1200, () => step([2, 2, 2, 1])],
				[1200, () => (step([2, 1, 1, 1]), find({ title: 'Owner can mint without a cap', by: 'Auditor', where: 'Token.sol:31', severity: 'warning' }))]
			],
			{ autoplay, still: 4 }
		);
		const t = tick(1000, () => (now += 1));
		return () => (stop(), t());
	});
	const sevIcon = { critical: '#e5484d', warning: '#f59e0b', note: '#93c5fd' };
</script>

{#snippet grid(color: string, n: number)}<span class="ui-afd__n" data-zero={!n || undefined}><i style:--c={color}></i>{n}</span>{/snippet}

<div class="ui-ag ui-ag-card ui-afd">
	<div class="ui-ag-title ui-afd__head"><span style:color="var(--ag-blue)">✦</span><b>{title}</b><span class="ui-ag-muted">{checked} of {total} checks</span><span class="ui-ag-meta"><span class="ui-afd__sum" data-on={count('critical') > 0 || undefined} style:--c="var(--ag-red)">● {count('critical')} critical</span><span class="ui-afd__sum" data-on={count('warning') > 0 || undefined} style:--c="var(--ag-amber)">● {count('warning')} warning{count('warning') === 1 ? '' : 's'}</span></span></div>
	{#each agents as a, i (a.name)}
		<button class="ui-afd__row" aria-label="{a.name} – {a.doing[a.done > a.total / 3 ? 1 : 0]}, {a.done} of {a.total}" aria-pressed={only === a.name} onclick={() => (only = only === a.name ? null : a.name)}>
			<span class="ui-afd__mk" style:color={a.color} data-live={a.done < a.total || undefined}>{a.mark}</span>
			<span class="ui-afd__who"><b>{a.name}</b><small>{a.doing[a.done > a.total / 3 ? 1 : 0]}</small></span>
			<span class="ui-afd__bar"><i style:width="{(a.done / a.total) * 100}%"></i></span>
			<span class="ui-afd__frac">{a.done}/{a.total}</span>
			{@render grid('#e5484d', count('critical', a.name))}{@render grid('#f59e0b', count('warning', a.name))}
		</button>
	{/each}
	<small class="ui-afd__h">Latest findings{only ? ` · ${only}` : ''}</small>
	<ul>
		{#each shown as f (f.id)}
			<li class="ui-ag-rise">
				<button class="ui-afd__f" aria-expanded={open === f.id} onclick={() => (open = open === f.id ? null : f.id)}><i class="ui-afd__sev" style:--c={sevIcon[f.severity]}></i><span class="ui-afd__ft">{f.title}</span><small>{f.by}</small><small>·</small><code>{f.where}</code><span class="ui-ag-grow"></span><small>{age(f.at)}</small></button>
				{#if open === f.id}<p class="ui-afd__more ui-ag-in">{f.severity === 'critical' ? 'Critical' : f.severity === 'warning' ? 'Warning' : 'Note'}: found by {f.by} at {f.where}. Open the file to see the lines and a suggested fix.</p>{/if}
			</li>
		{:else}<li class="ui-afd__none">No findings yet.</li>{/each}
	</ul>
</div>

<style>
	.ui-afd {
		width: 100%;
		max-width: 520px;
		padding: 0;
		font-size: 12.5px;
		overflow: hidden;
	}
	.ui-afd__head {
		padding: 12px 14px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-afd__sum {
		color: var(--ag-subtle);
		margin-left: 10px;
	}
	.ui-afd__sum[data-on] {
		color: var(--c);
	}
	.ui-afd__row {
		width: 100%;
		display: grid;
		grid-template-columns: 22px 1fr 130px 38px 26px 22px;
		align-items: center;
		gap: 8px;
		padding: 7px 14px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	.ui-afd__row:hover,
	.ui-afd__row[aria-pressed='true'] {
		background: var(--ag-fill);
	}
	.ui-afd__mk {
		width: 20px;
		height: 20px;
		display: grid;
		place-items: center;
		font-size: 12px;
	}
	.ui-afd__mk[data-live] {
		animation: ui-ag-breathe 2.4s ease-in-out infinite;
	}
	.ui-afd__who {
		display: grid;
		min-width: 0;
	}
	.ui-afd__who b {
		font-weight: 400;
	}
	.ui-afd__who small {
		color: var(--ag-muted);
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-afd__bar {
		height: 4px;
		border-radius: 2px;
		background: color-mix(in srgb, var(--ag-ink) 6%, transparent);
		overflow: hidden;
	}
	.ui-afd__bar i {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: linear-gradient(90deg, color-mix(in srgb, var(--ag-blue) 30%, transparent), color-mix(in srgb, var(--ag-blue) 55%, transparent), color-mix(in srgb, var(--ag-blue) 30%, transparent)) 0 0 / 200% 100%;
		transition: width 0.6s var(--ag-ease);
		animation: ui-ag-sheen 2.2s linear infinite;
	}
	.ui-afd__frac {
		text-align: right;
		color: var(--ag-muted);
		font-size: 11.5px;
		font-variant-numeric: tabular-nums;
	}
	.ui-afd__n {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 11px;
		color: var(--c, var(--ag-ink));
	}
	.ui-afd__n i,
	.ui-afd__sev {
		width: 8px;
		height: 8px;
		background: conic-gradient(var(--c) 0 25%, transparent 0 50%, var(--c) 0 75%, transparent 0) 0 0 / 4px 4px;
		box-shadow: inset 0 0 0 0.5px var(--c);
		border-radius: 1px;
	}
	.ui-afd__n[data-zero] {
		opacity: 0.3;
		color: var(--ag-muted);
	}
	.ui-afd__n[data-zero] i {
		--c: var(--ag-subtle);
	}
	.ui-afd__h {
		display: block;
		padding: 10px 14px 4px;
		border-top: 1px solid var(--ag-line);
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 6px;
	}
	.ui-afd__f {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 6px 14px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
	}
	.ui-afd__f:hover {
		background: var(--ag-fill);
	}
	.ui-afd__f small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-afd__ft {
		white-space: nowrap;
	}
	code {
		font-size: 11px;
		color: var(--ag-muted);
	}
	.ui-afd__more {
		margin: 0 14px 6px 29px;
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	.ui-afd__none {
		padding: 6px 14px;
		color: var(--ag-muted);
	}
</style>
