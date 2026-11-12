<!-- Project Card – a project at a glance: progress ring, status, due date, assignees and a checklist you can tick off. -->
<script lang="ts" module>
	export type Task = { title: string; done?: boolean };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		title = 'Onboarding flow',
		due = 'Due Oct 24',
		people = ['M', 'J', 'P'],
		tasks = $bindable([{ title: 'Welcome screen', done: true }, { title: 'Workspace setup', done: true }, { title: 'Invite teammates', done: true }, { title: 'First-run checklist' }, { title: 'Lifecycle emails' }] as Task[]),
		onopen
	}: { title?: string; due?: string; people?: string[]; tasks?: Task[]; onopen?: () => void } = $props();
	const done = $derived(tasks.filter((t) => t.done).length);
	const left = $derived(tasks.length - done);
	const C = 2 * Math.PI * 10;
	const tones = ['#dcfce7', '#dbeafe', '#ede9fe', '#fee2e2'];
</script>

<div class="ui-ag ui-ag-panel ui-pc">
	<div class="ui-ag-head">
		<span class="ui-pc__ring" aria-label="{done} of {tasks.length} done"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="10" class="ui-pc__arc" stroke-dasharray={C} stroke-dashoffset={C * (1 - done / tasks.length)} /></svg><b>{done}</b></span>
		<span class="ui-ag-grow"><b>{title}</b><small>{#if left}<span class="ui-ag-pill" data-tone="amber">◷ In progress</span>{:else}<span class="ui-ag-pill" data-tone="green">✓ Done</span>{/if} {due}</small></span>
		<span class="ui-pc__ppl">{#each people as p, i (i)}<i style:background={tones[i % tones.length]}>{p}</i>{/each}</span>
	</div>
	<div class="ui-pc__list">
		{#each tasks as t, i (t.title)}
			<label data-done={t.done || undefined}><input type="checkbox" checked={!!t.done} onchange={() => (tasks = tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} />{t.title}</label>
		{/each}
	</div>
	<div class="ui-ag-foot"><small class="ui-ag-grow ui-ag-muted">{left ? `${left} left` : 'All done'}</small><button class="ui-ag-btn" data-variant="primary" onclick={() => onopen?.()}>Open →</button></div>
</div>

<style>
	.ui-pc {
		max-width: 250px;
		font-size: 12px;
	}
	.ui-pc__ring {
		position: relative;
		width: 26px;
		height: 26px;
		display: grid;
		place-items: center;
	}
	.ui-pc__ring svg {
		position: absolute;
		inset: 0;
		transform: rotate(-90deg);
		fill: none;
		stroke: var(--ag-line);
		stroke-width: 2.4;
	}
	.ui-pc__arc {
		stroke: var(--ag-blue);
		stroke-linecap: round;
		transition: stroke-dashoffset 0.4s var(--ag-ease);
	}
	.ui-pc__ring b {
		font-size: 11px;
		font-weight: 500;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-pc__ppl {
		display: flex;
	}
	.ui-pc__ppl i {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		margin-left: -4px;
		box-shadow: 0 0 0 2px var(--ag-surface);
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 8.5px;
		color: #374151;
	}
	.ui-pc__list {
		padding: 6px 10px;
		display: grid;
	}
	label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 0;
		cursor: pointer;
	}
	label[data-done] {
		color: var(--ag-muted);
	}
	input {
		accent-color: var(--ag-blue);
		margin: 0;
	}
</style>
