<!-- Agent / Tasks – your work as tasks, not agents: a calm list grouped by project, each row a ring with its state; open one to see its steps, decisions and files, and decide what it waits on. -->
<script lang="ts" module>
	export type TaskRow = { name: string; doing: string; project: string; step: number; of: number; files: number; age: string; needs?: boolean; done?: boolean };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	const T = (name: string, doing: string, project: string, step: number, of: number, files: number, age: string, needs = false): TaskRow => ({ name, doing, project, step, of, files, age, needs });
	let {
		tasks = $bindable([
			T('Ingest pipeline', 'Picking a queue', 'Northwind', 2, 4, 4, '4m', true), T('Client dashboard', 'Choosing an empty state', 'Northwind', 1, 3, 3, '18m', true), T('Weekly update', 'Ready to send', 'Northwind', 2, 3, 1, '42m', true), T('Onboarding emails', 'Writing the draft', 'Northwind', 1, 3, 1, '12m'),
			T('Billing webhooks', 'Deploying to staging', 'Platform', 3, 4, 2, '6m'), T('API migration', 'Deciding the v1 end date', 'Platform', 2, 4, 2, '3h', true), T('Support triage', 'Rolling out to all queues', 'Platform', 2, 3, 2, '25m'),
			T('Launch post', 'Picking the tone', 'Evalkit', 1, 4, 2, '1h', true), T('Benchmark suite', 'Running the evals', 'Evalkit', 3, 5, 1, '2m')
		] as TaskRow[])
	}: { tasks?: TaskRow[] } = $props();
	let active = $state('tasks');
	let tab = $state<'Active' | 'Done'>('Active');
	let sel = $state('Ingest pipeline');
	let folded = $state<Set<string>>(new Set());
	const shown = $derived(tasks.filter((t) => (tab === 'Done') === !!t.done));
	const projects = $derived([...new Set(shown.map((t) => t.project))]);
	const cur = $derived(tasks.find((t) => t.name === sel));
	const nav = [{ items: AGENT_NAV[0].items }, { label: 'Workspace', items: [AGENT_NAV[1].items[4]] }];
	const fold = (p: string) => {
		const s = new Set(folded);
		if (s.has(p)) s.delete(p);
		else s.add(p);
		folded = s;
	};
	function decide() {
		if (!cur) return;
		tasks = tasks.map((t) => (t === cur ? { ...t, needs: false, step: Math.min(t.of, t.step + 1), doing: 'Deploying to staging' } : t));
	}
	function newTask() {
		const name = `New task ${tasks.length + 1}`;
		tasks = [...tasks, T(name, 'Planning', 'Northwind', 0, 3, 0, 'now')];
		sel = name;
	}
</script>

{#snippet detail()}
	<div class="ui-scr__tabs"><span class="ui-scr__tab">▦ {cur?.name}</span></div>
	{#if cur}
		<div class="ui-scr__panel">
			<p class="ui-ag-muted">Take in Northwind's order events and keep a day of them to replay after a bad deploy.</p>
			{#if cur.needs}<div class="ui-ag-card ui-tsk__ask"><small><span class="ui-ag-pill" data-tone="amber">Needs you</span> 1 decision waiting</small><div class="ui-ag-row"><b class="ui-ag-grow">Which queue should the ingest service use?</b><button class="ui-ag-btn" data-variant="primary" onclick={decide}>Decide</button></div></div>{/if}
			<dl class="ui-scr__kv"><dt>Status</dt><dd>{cur.doing} <small>{cur.step}/{cur.of}</small></dd><dt>Project</dt><dd>{cur.project}</dd><dt>Started</dt><dd>Mon, Nov 3</dd></dl>
			<small class="ui-scr__k">Steps</small>
			{#each ['Draft the event schema', 'Load test at 20k a minute', 'Pick a queue', 'Deploy to staging'].slice(0, cur.of) as s, i (s)}<div class="ui-ag-row"><span class="ui-ag-check" data-state={i < cur.step ? undefined : i === cur.step ? (cur.needs ? 'fail' : 'run') : 'todo'}></span><span class="ui-ag-grow">{s}</span></div>{/each}
			<small class="ui-scr__k">Artifacts</small>
			<div class="ui-ag-row" style:flex-wrap="wrap">{#each ['ingest-design.md', 'load-test-results.csv', 'event-schema.json'].slice(0, Math.max(1, cur.files)) as f (f)}<span class="ui-ag-pill" data-tone="gray">▤ {f}</span>{/each}</div>
		</div>
	{/if}
{/snippet}

<AppShell workspace="Fieldwork" {nav} bind:active cards={false} aside={detail} asideWidth={240}>
	<div class="ui-scr__bar"><b>Tasks <small>{tasks.length}</small></b><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['Active', 'Done'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t as 'Active' | 'Done')}>{t}</button>{/each}</div><button class="ui-ag-btn" onclick={newTask}>+ New task <span class="ui-ag-kbd">C</span></button></div>
	<div class="ui-tsk">
		{#each projects as p (p)}
			<button class="ui-tsk__proj" aria-expanded={!folded.has(p)} onclick={() => fold(p)}>{folded.has(p) ? '›' : '⌄'} ▭ {p} <small>{shown.filter((t) => t.project === p).length}</small></button>
			{#if !folded.has(p)}
				{#each shown.filter((t) => t.project === p) as t (t.name)}
					<button class="ui-tsk__row" aria-current={sel === t.name || undefined} onclick={() => (sel = t.name)}>
						<svg viewBox="0 0 16 16" class="ui-tsk__ring" data-needs={t.needs || undefined} aria-hidden="true"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="6" class="ui-tsk__arc" stroke-dasharray="37.7" stroke-dashoffset={37.7 * (1 - t.step / t.of)} /></svg>
						<b>{t.name}</b><span class="ui-ag-grow ui-ag-muted">{t.doing}</span>{#if t.needs}<span class="ui-ag-pill" data-tone="amber">Needs you</span>{/if}<small>{t.step}/{t.of}</small><small>▤ {t.files}</small><small class="ui-tsk__age">{t.age}</small>
					</button>
				{/each}
			{/if}
		{:else}<div class="ui-scr__empty"><b>Nothing finished yet</b></div>{/each}
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
	.ui-tsk {
		padding: 6px 8px;
		display: grid;
		gap: 1px;
	}
	.ui-tsk__proj,
	.ui-tsk__row {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 6px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-tsk__proj {
		margin-top: 8px;
		font-weight: 500;
	}
	.ui-tsk__row[aria-current] {
		background: var(--ag-fill);
	}
	.ui-tsk__row b {
		font-weight: 400;
	}
	.ui-tsk__age {
		width: 26px;
		text-align: right;
	}
	.ui-tsk__ring {
		width: 13px;
		height: 13px;
		transform: rotate(-90deg);
		fill: none;
		stroke-width: 2;
		stroke: color-mix(in srgb, var(--ag-green) 25%, transparent);
	}
	.ui-tsk__arc {
		stroke: var(--ag-green);
	}
	.ui-tsk__ring[data-needs] {
		stroke: color-mix(in srgb, var(--ag-amber) 25%, transparent);
	}
	.ui-tsk__ring[data-needs] .ui-tsk__arc {
		stroke: var(--ag-amber);
	}
	.ui-tsk__ask {
		padding: 8px 10px;
		display: grid;
		gap: 6px;
	}
</style>
