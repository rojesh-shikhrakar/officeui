<!-- Agent / Inbox – what your orchestrator needs from you, one question at a time: pick an option (or say something else), send it, and see the task it belongs to beside it. -->
<script lang="ts" module>
	export type Question = { id: string; q: string; task: string; age: string; body: string; options: { title: string; sub: string; points?: string[]; recommended?: boolean }[]; unread?: boolean };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	let {
		questions = $bindable([
			{ id: 'q1', q: 'Which queue should the ingest service use?', task: 'Ingest pipeline', age: '4m', body: 'Events arrive in bursts of up to 20k a minute. The service needs retries, and a way to replay a day of events after a bad deploy.', options: [{ title: 'Durable log', sub: 'A durable log – replay is built in', recommended: true, points: ['+ Replays any day after a bad deploy', '+ Takes the bursts with room to spare', '− One more cluster to run'] }, { title: 'Managed queue', sub: 'Managed, nothing to operate' }, { title: 'Database queue', sub: 'Use the database you already have' }] },
			{ id: 'q2', q: 'Which empty state for the dashboard?', task: 'Client dashboard', age: '18m', body: 'New clients see the dashboard before any data arrives.', options: [{ title: 'Sample data', sub: 'Show a greyed-out example' }, { title: 'Setup checklist', sub: 'Show the next steps', recommended: true }], unread: true },
			{ id: 'q3', q: 'Send the weekly update to Northwind?', task: 'Weekly update', age: '42m', body: 'The draft is ready and covers three shipped items.', options: [{ title: 'Send now', sub: 'Goes out by email', recommended: true }, { title: 'Hold until Monday', sub: 'Sends Monday 9:00' }], unread: true },
			{ id: 'q4', q: 'What tone should the launch post have?', task: 'Launch post', age: '1h', body: 'The post goes out on the blog and social.', options: [{ title: 'Playful', sub: 'Short and warm' }, { title: 'Plain', sub: 'Facts first', recommended: true }] },
			{ id: 'q5', q: 'Keep the old API until March or drop it now?', task: 'API migration', age: '3h', body: 'Two clients still call API v1.', options: [{ title: 'Keep until March', sub: 'Time to move', recommended: true }, { title: 'Drop now', sub: 'Less to maintain' }] }
		] as Question[]),
		onanswer
	}: { questions?: Question[]; onanswer?: (q: Question, answer: string) => void } = $props();
	let active = $state('inbox');
	let tab = $state<'Open' | 'Done'>('Open');
	let sel = $state('q1');
	let pick = $state(0);
	let other = $state('');
	let done = $state<{ q: Question; a: string }[]>([]);
	const cur = $derived(questions.find((q) => q.id === sel) ?? questions[0]);
	const nav = [{ items: AGENT_NAV[0].items.map((i) => (i.id === 'inbox' ? { ...i, count: questions.length } : i)) }, { label: 'Workspace', items: [AGENT_NAV[1].items[4]] }];
	function send() {
		if (!cur) return;
		const a = other.trim() || cur.options[pick].title;
		done = [{ q: cur, a }, ...done];
		onanswer?.(cur, a);
		const i = questions.indexOf(cur);
		questions = questions.filter((q) => q !== cur);
		sel = questions[Math.min(i, questions.length - 1)]?.id ?? '';
		pick = 0;
		other = '';
	}
</script>

{#snippet task()}
	<div class="ui-scr__tabs"><span class="ui-scr__tab">▦ {cur?.task ?? 'Tasks'}</span></div>
	{#if cur}<div class="ui-scr__panel"><p class="ui-ag-muted">Take in Northwind's order events and keep a day of them to replay after a bad deploy.</p><dl class="ui-scr__kv"><dt>Status</dt><dd>◔ Waiting on you <small>2/4</small></dd><dt>Project</dt><dd>Northwind</dd><dt>Started</dt><dd>Mon, Nov 3</dd></dl><small class="ui-scr__k">Steps</small>{#each [['Draft the event schema', 'done'], ['Load test at 20k a minute', 'done'], ['Pick a queue', 'needs'], ['Deploy to staging', 'todo']] as [s, st] (s)}<div class="ui-ag-row"><span class="ui-ag-check" data-state={st === 'done' ? undefined : st === 'needs' ? 'run' : 'todo'}></span><span class="ui-ag-grow">{s}</span>{#if st === 'needs'}<span class="ui-ag-pill" data-tone="amber">Needs you</span>{/if}</div>{/each}</div>{/if}
{/snippet}

<AppShell workspace="Fieldwork" {nav} bind:active cards={false} aside={task} asideWidth={230}>
	<div class="ui-inb">
		<div class="ui-inb__list">
			<div class="ui-ag-row"><b class="ui-ag-grow">Inbox <small>{questions.length}</small></b><div class="ui-ag-tabs" role="tablist">{#each ['Open', 'Done'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t as 'Open' | 'Done')}>{t}</button>{/each}</div></div>
			{#if tab === 'Open'}{#each questions as q (q.id)}<button class="ui-inb__q" aria-current={sel === q.id || undefined} onclick={() => ((sel = q.id), (pick = 0))}><span><b>{q.q}</b><small>{q.task} · {q.age}</small></span>{#if q.unread}<i></i>{/if}</button>{:else}<p class="ui-ag-muted">You're all caught up.</p>{/each}
			{:else}{#each done as d (d.q.id)}<div class="ui-inb__q"><span><b>{d.q.q}</b><small>✓ {d.a}</small></span></div>{:else}<p class="ui-ag-muted">Nothing answered yet.</p>{/each}{/if}
		</div>
		{#if cur && tab === 'Open'}
			{#key cur.id}
				<div class="ui-inb__q-detail ui-ag-in">
					<small>⁙ {cur.task} · {cur.age} ago</small>
					<h1>{cur.q}</h1>
					<p class="ui-ag-muted">{cur.body}</p>
					<div class="ui-ag-card ui-inb__opts" role="radiogroup" aria-label="Options">
						{#each cur.options as o, i (o.title)}<button role="radio" aria-checked={pick === i && !other} class="ui-inb__opt" onclick={() => ((pick = i), (other = ''))}><span class="ui-inb__n">{i + 1}</span><span><b>{o.title}</b> {#if o.recommended}<span class="ui-ag-pill" data-tone="blue">Recommended</span>{/if}<small>{o.sub}</small>{#if pick === i}{#each o.points ?? [] as p (p)}<small>{p}</small>{/each}{/if}</span></button>{/each}
					</div>
					<div class="ui-ag-row"><input class="ui-ag-input ui-ag-grow" placeholder="Or tell it something else…" aria-label="Or tell it something else" bind:value={other} onkeydown={(e) => e.key === 'Enter' && send()} /><button class="ui-ag-btn" data-variant="ghost" onclick={() => (sel = questions[(questions.indexOf(cur) + 1) % questions.length].id)}>Later</button><button class="ui-ag-btn" data-variant="primary" onclick={send}>Send ↵</button></div>
				</div>
			{/key}
		{/if}
	</div>
</AppShell>

<svelte:window onkeydown={(e) => { if (!cur || (e.target as HTMLElement).matches('input,textarea')) return; const n = +e.key; if (n >= 1 && n <= cur.options.length) pick = n - 1; }} />

<style>
	b {
		font-weight: 500;
	}
	small {
		display: block;
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-inb {
		display: grid;
		grid-template-columns: 200px 1fr;
		height: 100%;
	}
	.ui-inb__list {
		border-right: 1px solid var(--ag-line);
		padding: 10px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.ui-inb__list > .ui-ag-row b small {
		display: inline;
	}
	.ui-inb__q {
		display: flex;
		align-items: center;
		gap: 6px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 6px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-inb__q span {
		flex: 1;
		min-width: 0;
	}
	.ui-inb__q b {
		display: block;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-inb__q[aria-current] {
		background: var(--ag-fill);
	}
	.ui-inb__q i {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--ag-blue);
	}
	.ui-inb__q-detail {
		padding: 40px 30px;
		display: grid;
		gap: 12px;
		align-content: start;
		max-width: 360px;
	}
	h1 {
		margin: 0;
		font-size: 17px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	p {
		margin: 0;
		line-height: 1.6;
	}
	.ui-inb__opts {
		padding: 4px;
		display: grid;
		gap: 2px;
	}
	.ui-inb__opt {
		display: flex;
		gap: 10px;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-inb__opt[aria-checked='true'] {
		background: var(--ag-fill);
	}
	.ui-inb__n {
		width: 15px;
		height: 15px;
		border-radius: 4px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		font-size: 9px;
		flex: none;
	}
	.ui-inb__opt[aria-checked='true'] .ui-inb__n {
		background: var(--ag-ink);
		color: var(--ag-surface);
	}
</style>
