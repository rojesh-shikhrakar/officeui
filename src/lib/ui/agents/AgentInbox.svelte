<script lang="ts" module>
	export type Task = { id: string; title: string; text: string; status: 'waiting' | 'failed' | 'running' | 'done'; time: string; tools: number; edits: number };
	export type Column = { id: string; label: string; tasks: Task[] };
</script>

<script lang="ts">
	import './agents.css';
	let {
		columns = [
			{
				id: 'needs',
				label: 'Needs you',
				tasks: [
					{ id: '1', title: 'Migrate users table', text: 'Split users into accounts and profiles on Postgres 17. The dry run is ready.', status: 'waiting', time: '6m 12s', tools: 9, edits: 14 },
					{ id: '2', title: 'Clean up CRM contacts', text: 'Matched 1,312 likely duplicates, then the merge hit the API rate limit.', status: 'failed', time: '', tools: 2, edits: 6 }
				]
			},
			{
				id: 'running',
				label: 'Running',
				tasks: [
					{ id: '3', title: 'Review PR #482', text: 'Billing webhooks: reading the diff and the test run, writing comments.', status: 'running', time: '3m 40s', tools: 12, edits: 21 },
					{ id: '4', title: 'Release notes v2.4', text: 'Grouping 23 merged pull requests into features and fixes.', status: 'running', time: '1m 18s', tools: 23, edits: 5 }
				]
			},
			{
				id: 'done',
				label: 'Done',
				tasks: [{ id: '5', title: 'Weekly metrics digest', text: 'Pulled numbers from three dashboards and posted the summary.', status: 'done', time: '4m 12s', tools: 3, edits: 8 }]
			}
		],
		view = $bindable('board')
	}: { columns?: Column[]; view?: 'board' | 'list' } = $props();

	const icon = { waiting: '▲', failed: '●', running: '', done: '●' } as const;
	const tone = { waiting: 'amber', failed: 'red', running: 'blue', done: 'green' } as const;
</script>

<div class="ui-ag ui-agi">
	<div class="ui-agi__bar">
		<span class="ui-agi__crumb">Agents <i>/</i> <b>Agent inbox</b></span>
		<div class="ui-agi__seg" role="tablist" aria-label="View">
			<button role="tab" aria-selected={view === 'board'} onclick={() => (view = 'board')}>Board</button>
			<button role="tab" aria-selected={view === 'list'} onclick={() => (view = 'list')}>List</button>
		</div>
	</div>
	<div class="ui-agi__cols" data-view={view}>
		{#each columns as col (col.id)}
			<section class="ui-agi__col">
				<header><span>{col.label}</span><em>{col.tasks.length}</em></header>
				{#each col.tasks as t (t.id)}
					<article class="ui-agi__task ui-ag-card">
						<b>{t.title}</b>
						<p>{t.text}</p>
						<footer>
							<span class="ui-agi__st" data-tone={tone[t.status]}>
								{#if t.status === 'running'}<i class="ui-ag-spin"></i>{:else}<i>{icon[t.status]}</i>{/if}
								{t.status === 'failed' ? 'Failed' : t.status === 'waiting' ? `Waiting · ${t.time}` : t.time}
							</span>
							<span class="ui-agi__n">⚒ {t.tools}</span><span class="ui-agi__n">✎ {t.edits}</span>
						</footer>
					</article>
				{/each}
			</section>
		{/each}
	</div>
</div>

<style>
	.ui-agi {
		width: 100%;
		max-width: 640px;
	}
	.ui-agi__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		font-size: 12px;
	}
	.ui-agi__crumb {
		color: var(--ag-muted);
	}
	.ui-agi__crumb i {
		font-style: normal;
		margin: 0 4px;
		opacity: 0.6;
	}
	.ui-agi__crumb b {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-agi__seg {
		display: flex;
		background: var(--ag-fill);
		border-radius: 999px;
		padding: 2px;
	}
	.ui-agi__seg button {
		border: 0;
		background: none;
		font: inherit;
		font-size: 11.5px;
		color: var(--ag-muted);
		padding: 2px 10px;
		border-radius: 999px;
		cursor: pointer;
		transition: background-color 0.2s var(--ag-ease), color 0.2s;
	}
	.ui-agi__seg button[aria-selected='true'] {
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
	}
	.ui-agi__cols {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		align-items: start;
	}
	.ui-agi__cols[data-view='list'] {
		grid-template-columns: minmax(0, 1fr);
	}
	.ui-agi__col {
		background: var(--ag-fill);
		border-radius: 12px;
		padding: 4px;
		display: grid;
		gap: 4px;
	}
	.ui-agi__col header {
		display: flex;
		justify-content: center;
		position: relative;
		padding: 4px 8px;
		font-size: 9.5px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-agi__col header em {
		position: absolute;
		right: 6px;
		font-style: normal;
		background: var(--ag-surface);
		border-radius: 5px;
		padding: 0 5px;
		letter-spacing: 0;
	}
	.ui-agi__task {
		padding: 10px;
		display: grid;
		gap: 5px;
		text-align: left;
		animation: ui-ag-in 0.4s var(--ag-ease) both;
	}
	.ui-agi__task b {
		font-weight: 500;
		font-size: 12.5px;
	}
	.ui-agi__task p {
		margin: 0;
		font-size: 11.5px;
		color: var(--ag-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.ui-agi__task footer {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		color: var(--ag-muted);
	}
	.ui-agi__st {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-agi__st i {
		font-style: normal;
		font-size: 9px;
	}
	.ui-agi__st[data-tone='amber'] i {
		color: var(--ag-amber);
	}
	.ui-agi__st[data-tone='red'] i {
		color: var(--ag-red);
	}
	.ui-agi__st[data-tone='green'] i {
		color: var(--ag-green);
	}
	.ui-agi__st[data-tone='blue'] i {
		color: var(--ag-blue);
	}
</style>
