<!-- Projects – a project dashboard (filter and sort) that opens into a project with Table, Board, Roadmap and Insights tabs and a task detail. Opened projects are listed under "Projects" in the sidebar for quick switching. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import ProjectTable from '../blocks/ProjectTable.svelte';
	import ProjectBoard from '../blocks/ProjectBoard.svelte';
	import ProjectRoadmap from '../blocks/ProjectRoadmap.svelte';
	import ProjectInsights from '../blocks/ProjectInsights.svelte';
	import TaskDetail from '../blocks/TaskDetail.svelte';
	import {
		HEALTH_TONE,
		fmtDay,
		progress,
		toDay,
		type Project,
		type ProjectHealth
	} from '../blocks/projects';
	import { PROJECTS } from '../blocks/projects';
	import type { NavSection } from './shell/nav';
	import './shell/screen.css';
	const TABS = ['Table', 'Board', 'Roadmap', 'Insights'] as const;
	const SORTS = ['Recently updated', 'Name', 'Due date', 'Progress'] as const;
	let {
		projects = $bindable(
			PROJECTS.map((p) => ({
				...p,
				tasks: p.tasks.map((t) => ({ ...t, assets: [...t.assets], comments: [...t.comments] }))
			})) as Project[]
		),
		today = '2026-11-10',
		/** Project ids already in the recent list */
		recent = $bindable([] as string[]),
		/** The open project id, or '' for the dashboard */
		current = $bindable(''),
		tab = $bindable('Table' as (typeof TABS)[number])
	}: {
		projects?: Project[];
		today?: string;
		recent?: string[];
		current?: string;
		tab?: (typeof TABS)[number];
	} = $props();
	let q = $state('');
	let health = $state<ProjectHealth | ''>('');
	let sort = $state<(typeof SORTS)[number]>('Recently updated');
	let openTask = $state<string | null>(null);
	const project = $derived(projects.find((p) => p.id === current));
	const shown = $derived(
		projects
			.filter(
				(p) =>
					(!health || p.health === health) &&
					(p.name + p.owner).toLowerCase().includes(q.toLowerCase())
			)
			.toSorted((a, b) =>
				sort === 'Name'
					? a.name.localeCompare(b.name)
					: sort === 'Due date'
						? toDay(a.due) - toDay(b.due)
						: sort === 'Progress'
							? progress(b) - progress(a)
							: toDay(b.updated) - toDay(a.updated)
			)
	);
	const nav = $derived<NavSection[]>([
		{
			items: [
				{ id: 'projects', label: 'Projects', icon: '▭', count: projects.length },
				...recent.flatMap((id) => {
					const p = projects.find((x) => x.id === id);
					return p ? [{ id: 'p:' + id, label: p.name, indent: true }] : [];
				})
			]
		}
	]);
	const active = $derived(current ? 'p:' + current : 'projects');
	function open(id: string) {
		current = id;
		openTask = null;
		recent = [id, ...recent.filter((r) => r !== id)].slice(0, 5);
	}
	function navigate(id: string) {
		if (id === 'projects') {
			current = '';
			openTask = null;
		} else if (id.startsWith('p:')) open(id.slice(2));
	}
	const detail = $derived(project?.tasks.find((t) => t.id === openTask));
</script>

<AppShell {nav} {active} onnavigate={navigate}>
	{#if project}
		<div class="ui-scr__bar">
			<span class="ui-scr__crumbs"
				><button class="ui-pj__link" onclick={() => navigate('projects')}>Projects</button> /
				<b>{project.name}</b></span
			><span class="ui-ag-grow"></span><span
				class="ui-ag-pill"
				data-tone={HEALTH_TONE[project.health]}>{project.health}</span
			>
		</div>
		<div class="ui-scr__bar">
			<div class="ui-ag-tabs" role="tablist">
				{#each TABS as t (t)}<button
						class="ui-ag-tab"
						role="tab"
						aria-selected={tab === t}
						onclick={() => (tab = t)}>{t}</button
					>{/each}
			</div>
		</div>
		<div class="ui-pj__work" data-detail={detail ? '' : undefined}>
			<div class="ui-pj__view">
				{#if tab === 'Table'}<ProjectTable
						bind:tasks={project.tasks}
						onopen={(id) => (openTask = id)}
					/>
				{:else if tab === 'Board'}<ProjectBoard
						bind:tasks={project.tasks}
						onopen={(id) => (openTask = id)}
					/>
				{:else if tab === 'Roadmap'}<ProjectRoadmap
						tasks={project.tasks}
						{today}
						onopen={(id) => (openTask = id)}
					/>
				{:else}<ProjectInsights tasks={project.tasks} {today} />{/if}
			</div>
			{#if detail}
				<div class="ui-pj__detail">
					{#each project.tasks.filter((t) => t.id === openTask) as t (t.id)}<TaskDetail
							bind:task={project.tasks[project.tasks.indexOf(t)]}
							onclose={() => (openTask = null)}
						/>{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="ui-scr">
			<h1>Projects</h1>
			<div class="ui-pj__filters">
				<input
					class="ui-ag-input"
					placeholder="⌕ Search projects"
					aria-label="Search projects"
					bind:value={q}
				/>
				<label
					>Status <select class="ui-ag-input" bind:value={health}
						><option value="">All</option>{#each Object.keys(HEALTH_TONE) as h (h)}<option
								>{h}</option
							>{/each}</select
					></label
				>
				<label
					>Sort by <select class="ui-ag-input" bind:value={sort}
						>{#each SORTS as s (s)}<option>{s}</option>{/each}</select
					></label
				>
			</div>
			<div class="ui-pj__grid">
				{#each shown as p (p.id)}
					<button
						class="ui-ag-card ui-pj__card"
						aria-label="Open {p.name}"
						onclick={() => open(p.id)}
					>
						<b>{p.name}</b>
						<span class="ui-ag-pill" data-tone={HEALTH_TONE[p.health]}>{p.health}</span>
						<span class="ui-ag-bar"><i style:width="{Math.round(progress(p) * 100)}%"></i></span>
						<small class="ui-ag-muted"
							>{Math.round(progress(p) * 100)}% · {p.tasks.length} tasks · {p.owner} · due {fmtDay(
								p.due
							)}</small
						>
					</button>
				{:else}<p class="ui-ag-muted">No projects match.</p>{/each}
			</div>
		</div>
	{/if}
</AppShell>

<style>
	.ui-pj__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
	}
	.ui-pj__filters label {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--ag-muted);
	}
	.ui-pj__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 10px;
	}
	.ui-pj__card {
		display: grid;
		gap: 8px;
		justify-items: start;
		padding: 12px;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}
	.ui-pj__card:focus-visible,
	.ui-pj__link:focus-visible {
		outline: 2px solid var(--ag-blue);
	}
	.ui-pj__card .ui-ag-bar {
		width: 100%;
	}
	.ui-pj__link {
		all: unset;
		cursor: pointer;
	}
	.ui-pj__link:hover {
		text-decoration: underline;
	}
	.ui-pj__work {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.ui-pj__work[data-detail] {
		grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
	}
	.ui-pj__view {
		min-width: 0;
	}
	.ui-pj__detail {
		border-left: 1px solid var(--ag-line);
		min-width: 0;
	}
</style>
