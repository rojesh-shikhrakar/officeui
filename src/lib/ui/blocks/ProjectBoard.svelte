<!-- Project Board – a project's tasks as kanban columns by status: drag a card (or use the arrow keys) to change its status, Enter opens the task. -->
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
	let dragging = $state<string | null>(null);
	let over = $state<Status | null>(null);
	const move = (id: string, status: Status) =>
		(tasks = tasks.map((t) =>
			t.id === id
				? { ...t, status, doneAt: status === 'Done' ? (t.doneAt ?? t.end) : undefined }
				: t
		));
	function key(e: KeyboardEvent, t: ProjectTask) {
		const i = STATUSES.indexOf(t.status);
		if (e.key === 'ArrowRight' && i < STATUSES.length - 1) {
			e.preventDefault();
			move(t.id, STATUSES[i + 1]);
		} else if (e.key === 'ArrowLeft' && i > 0) {
			e.preventDefault();
			move(t.id, STATUSES[i - 1]);
		} else if (e.key === 'Enter') onopen?.(t.id);
	}
</script>

<div class="ui-pb">
	{#each STATUSES as s (s)}
		<section
			class="ui-pb__col"
			aria-label={s}
			data-over={over === s || undefined}
			ondragover={(e) => (e.preventDefault(), (over = s))}
			ondragleave={() => over === s && (over = null)}
			ondrop={(e) => (
				e.preventDefault(),
				dragging && move(dragging, s),
				(over = null),
				(dragging = null)
			)}
		>
			<header>
				<i style:background={STATUS_COLOR[s]}></i><b>{s}</b><span
					class="ui-ag-pill"
					data-tone="gray">{tasks.filter((t) => t.status === s).length}</span
				>
			</header>
			{#each tasks.filter((t) => t.status === s) as t (t.id)}
				<div
					class="ui-ag-card ui-pb__card"
					role="button"
					tabindex="0"
					draggable="true"
					aria-label="{t.title}, {s}. Arrow keys change the status."
					data-drag={dragging === t.id || undefined}
					ondragstart={() => (dragging = t.id)}
					ondragend={() => (dragging = null)}
					onclick={() => onopen?.(t.id)}
					onkeydown={(e) => key(e, t)}
				>
					<b>{t.title}</b>
					<small class="ui-ag-muted">{t.id} · {t.assignee} · due {fmtDay(t.end)}</small>
					<span
						class="ui-ag-pill"
						data-tone={t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'gray'}
						>{t.priority}</span
					>
				</div>
			{/each}
		</section>
	{/each}
</div>

<style>
	.ui-pb {
		display: grid;
		grid-template-columns: repeat(4, minmax(150px, 1fr));
		gap: 8px;
		padding: 10px 12px;
		overflow-x: auto;
	}
	.ui-pb__col {
		display: grid;
		gap: 6px;
		align-content: start;
		padding: 6px;
		min-height: 120px;
		border-radius: 8px;
		background: var(--ag-fill);
	}
	.ui-pb__col[data-over] {
		outline: 2px dashed var(--ag-blue);
	}
	header {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	header i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.ui-pb__card {
		display: grid;
		gap: 4px;
		padding: 8px;
		cursor: grab;
		justify-items: start;
	}
	.ui-pb__card[data-drag] {
		opacity: 0.5;
	}
	.ui-pb__card:focus-visible {
		outline: 2px solid var(--ag-blue);
	}
</style>
