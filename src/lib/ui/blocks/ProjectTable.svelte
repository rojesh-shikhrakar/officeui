<!-- Project Table – a project's tasks as a sortable, searchable table; change a status inline and click a title to open the task. -->
<script lang="ts">
	import {
		PROJECTS,
		STATUSES,
		STATUS_COLOR,
		fmtDay,
		type ProjectTask,
		type Status
	} from './projects';
	import '../agents/agents.css';
	let {
		tasks = $bindable(PROJECTS[0].tasks),
		onopen
	}: { tasks?: ProjectTask[]; onopen?: (id: string) => void } = $props();
	type Key = 'id' | 'title' | 'status' | 'assignee' | 'priority' | 'end';
	const COLS: [Key, string][] = [
		['id', 'ID'],
		['title', 'Title'],
		['status', 'Status'],
		['assignee', 'Assignee'],
		['priority', 'Priority'],
		['end', 'Due']
	];
	let q = $state('');
	let key = $state<Key>('id');
	let dir = $state<1 | -1>(1);
	const rank = (t: ProjectTask, k: Key) =>
		k === 'status'
			? STATUSES.indexOf(t.status)
			: k === 'priority'
				? ['Low', 'Medium', 'High'].indexOf(t.priority)
				: t[k];
	const shown = $derived(
		tasks
			.filter((t) => (t.title + t.id + t.assignee).toLowerCase().includes(q.toLowerCase()))
			.toSorted((a, b) =>
				rank(a, key) < rank(b, key) ? -dir : rank(a, key) > rank(b, key) ? dir : 0
			)
	);
	const sort = (k: Key) => (key === k ? (dir = dir === 1 ? -1 : 1) : ((key = k), (dir = 1)));
	const setStatus = (id: string, status: Status) =>
		(tasks = tasks.map((t) =>
			t.id === id
				? { ...t, status, doneAt: status === 'Done' ? (t.doneAt ?? t.end) : undefined }
				: t
		));
</script>

<div class="ui-pt">
	<div class="ui-pt__bar">
		<input
			class="ui-ag-input"
			placeholder="⌕ Filter tasks"
			aria-label="Filter tasks"
			bind:value={q}
		/><small class="ui-ag-muted">{shown.length} of {tasks.length} tasks</small>
	</div>
	<table>
		<thead>
			<tr
				>{#each COLS as [k, label] (k)}<th
						aria-sort={key === k ? (dir === 1 ? 'ascending' : 'descending') : 'none'}
						><button onclick={() => sort(k)}
							>{label}{key === k ? (dir === 1 ? ' ↑' : ' ↓') : ''}</button
						></th
					>{/each}</tr
			>
		</thead>
		<tbody>
			{#each shown as t (t.id)}
				<tr>
					<td class="ui-ag-muted">{t.id}</td>
					<td><button class="ui-pt__title" onclick={() => onopen?.(t.id)}>{t.title}</button></td>
					<td
						><select
							class="ui-ag-input"
							aria-label="Status of {t.id}"
							value={t.status}
							style:--c={STATUS_COLOR[t.status]}
							onchange={(e) => setStatus(t.id, e.currentTarget.value as Status)}
							>{#each STATUSES as s (s)}<option>{s}</option>{/each}</select
						></td
					>
					<td>{t.assignee}</td>
					<td
						><span
							class="ui-ag-pill"
							data-tone={t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'gray'}
							>{t.priority}</span
						></td
					>
					<td>{fmtDay(t.end)}</td>
				</tr>
			{:else}
				<tr><td colspan="6" class="ui-ag-muted">No tasks match “{q}”.</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.ui-pt__bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		text-align: left;
		padding: 7px 12px;
		border-top: 1px solid var(--ag-line);
	}
	th button,
	.ui-pt__title {
		all: unset;
		cursor: pointer;
		color: var(--ag-muted);
	}
	.ui-pt__title {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-pt__title:hover,
	th button:hover {
		text-decoration: underline;
	}
	th button:focus-visible,
	.ui-pt__title:focus-visible {
		outline: 2px solid var(--ag-blue);
		border-radius: 3px;
	}
	select {
		border-left: 3px solid var(--c);
		padding-block: 2px;
	}
</style>
