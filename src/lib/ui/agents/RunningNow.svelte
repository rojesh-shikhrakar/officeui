<!-- Running Now – a breadcrumb-bar status pill that opens a menu of background agent tasks: progress, pause/resume, and the ones that need you. -->
<script lang="ts" module>
	export type BgTask = { name: string; detail: string; step: number; of: number; paused?: boolean; needs?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from './script';
	import './agents.css';
	let {
		crumbs = ['Workspace', 'Agents'],
		tasks = $bindable([
			{ name: 'Ingest pipeline', detail: 'Embedding chunks', step: 2, of: 4 },
			{ name: 'Refund review', detail: 'Approve a $240 refund to a customer', step: 0, of: 0, needs: true },
			{ name: 'Weekly report', detail: 'Building 4 charts', step: 2, of: 5 },
			{ name: 'Dependency upgrade', detail: 'Running 212 tests', step: 1, of: 4, paused: true },
			{ name: 'Lead enrichment', detail: 'Loading 420 leads', step: 0, of: 6 }
		] as BgTask[]),
		open = $bindable(true),
		onopen
	}: { crumbs?: string[]; tasks?: BgTask[]; open?: boolean; onopen?: (t: BgTask) => void } = $props();
	const running = $derived(tasks.filter((t) => !t.paused && !t.needs).length);
	const needs = $derived(tasks.filter((t) => t.needs).length);
	const doing: Record<string, string[]> = { 'Ingest pipeline': ['Embedding chunks', 'Writing the index', 'Checking the index'], 'Weekly report': ['Drafting the summary', 'Building 4 charts', 'Checking numbers'], 'Lead enrichment': ['Loading 420 leads', 'Matching companies', 'Finding titles'] };
	let beat = 0;
	onMount(() =>
		tick(2600, () => {
			beat++;
			tasks = tasks.map((t) => {
				if (t.paused || t.needs || !doing[t.name]) return t;
				const step = Math.min(t.of, t.step + (beat % 2 === 0 ? 1 : 0));
				return { ...t, step, detail: doing[t.name][beat % doing[t.name].length] };
			});
		})
	);
	const toggle = (i: number) => (tasks = tasks.map((t, j) => (j === i ? { ...t, paused: !t.paused } : t)));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div class="ui-ag ui-rn">
	<div class="ui-ag-card ui-rn__bar">
		<span class="ui-rn__logo">◧</span>
		{#each crumbs as c, i (c)}{#if i}<span class="ui-ag-muted">/</span>{/if}<span class={i < crumbs.length - 1 ? 'ui-ag-muted' : ''}>{c}</span>{/each}
		<span class="ui-ag-grow"></span>
		<button class="ui-ag-chip" aria-expanded={open} aria-haspopup="menu" onclick={() => (open = !open)}><span class="ui-ag-dot" style:background="var(--ag-green)"></span><b>{running}</b> running {#if needs}<span class="ui-ag-muted">·</span><span class="ui-ag-dot" style:background="var(--ag-amber)"></span><b>{needs}</b> needs you{/if} {open ? '⌃' : '⌄'}</button>
	</div>
	{#if open}
		<div class="ui-ag-panel ui-rn__menu ui-ag-in" role="menu">
			<small class="ui-rn__h">Background tasks <span>{tasks.length}</span></small>
			{#each tasks as t, i (t.name)}
				<div class="ui-rn__item" role="menuitem" tabindex="-1">
					<svg class="ui-rn__ring" viewBox="0 0 16 16" data-tone={t.needs ? 'amber' : t.paused ? 'gray' : 'amber'}><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="6" class="ui-rn__arc" stroke-dasharray="37.7" stroke-dashoffset={t.of ? 37.7 * (1 - t.step / t.of) : t.needs ? 0 : 37.7} /></svg>
					<span class="ui-ag-grow ui-rn__t"><b>{t.name}</b><small>{t.paused ? `Paused · ${t.detail}` : t.detail}</small></span>
					{#if t.needs}<span class="ui-ag-pill" data-tone="amber">Needs you</span><button class="ui-ag-btn" onclick={() => onopen?.(t)}>Open</button>
					{:else}<small class="ui-ag-muted">{t.step}/{t.of}</small><button class="ui-ag-btn" data-variant="ghost" aria-label={t.paused ? `Resume ${t.name}` : `Pause ${t.name}`} onclick={() => toggle(i)}>{t.paused ? '▷' : 'Ⅱ'}</button>{/if}
				</div>
			{/each}
			<button class="ui-rn__all" role="menuitem">▤ Open Tasks <span>›</span></button>
		</div>
	{/if}
</div>

<style>
	.ui-rn {
		position: relative;
		width: 100%;
		max-width: 520px;
		font-size: 11.5px;
	}
	.ui-rn__bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px;
	}
	.ui-rn__logo {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		background: var(--ag-ink);
		color: var(--ag-surface);
		display: grid;
		place-items: center;
		font-size: 9px;
	}
	b {
		font-weight: 500;
	}
	.ui-rn__menu {
		position: absolute;
		right: 6px;
		top: calc(100% + 4px);
		width: 270px;
		padding: 4px;
		z-index: 5;
	}
	.ui-rn__h {
		display: block;
		padding: 6px 8px;
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-rn__item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 8px;
		border-radius: 8px;
	}
	.ui-rn__item:hover {
		background: var(--ag-fill);
	}
	.ui-rn__t {
		display: grid;
		min-width: 0;
	}
	.ui-rn__t small {
		color: var(--ag-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 10.5px;
	}
	.ui-rn__ring {
		width: 14px;
		height: 14px;
		flex: none;
		transform: rotate(-90deg);
		fill: none;
		stroke-width: 1.8;
		stroke: color-mix(in srgb, var(--ag-amber) 30%, transparent);
	}
	.ui-rn__arc {
		stroke: var(--ag-amber);
	}
	.ui-rn__ring[data-tone='gray'] {
		stroke: var(--ag-line);
	}
	.ui-rn__ring[data-tone='gray'] .ui-rn__arc {
		stroke: var(--ag-subtle);
	}
	.ui-rn__all {
		width: 100%;
		display: flex;
		justify-content: space-between;
		border: 0;
		border-top: 1px solid var(--ag-line);
		margin-top: 4px;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		padding: 8px;
		cursor: pointer;
	}
</style>
