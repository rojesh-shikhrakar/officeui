<!-- Scheduled Runs – a week board of agent sessions: drag tasks from "To schedule" into a day's time slot, or let Auto place them; each slot shows how full it is. -->
<script lang="ts" module>
	export type SRun = { id: number; title: string; agent: string; note: string; files: number; items: number; pct: number; day?: number; slot?: number };
</script>

<script lang="ts">
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		days = ['Tue 27', 'Wed 28', 'Thu 29'],
		slots = ['07:00', '12:00', '17:00'],
		runs = $bindable([
			{ id: 1, title: 'Support themes for October', agent: 'Atlas CLI', note: 'Cluster 480 tickets', files: 480, items: 0, pct: 25 },
			{ id: 2, title: 'Split billing into a service', agent: 'Coder', note: 'Move invoices, usage', files: 112, items: 3, pct: 90 },
			{ id: 3, title: 'November changelog', agent: 'Atlas CLI', note: 'Everything merged since', files: 46, items: 0, pct: 20 },
			{ id: 4, title: 'Upgrade to UI kit 19', agent: 'Coder', note: 'Bump every package', files: 48, items: 1, pct: 30, day: 0, slot: 0 },
			{ id: 5, title: 'Triage 120 open issues', agent: 'Triage', note: 'Label, size and assign', files: 120, items: 0, pct: 25, day: 1, slot: 0 },
			{ id: 6, title: 'Public API reference', agent: 'Writer', note: 'Every endpoint', files: 38, items: 52, pct: 45, day: 1, slot: 0 },
			{ id: 7, title: 'Ship the v3.0 release', agent: 'Coder', note: 'Changelog, tag, publish', files: 14, items: 22, pct: 60, day: 2, slot: 0 },
			{ id: 8, title: 'Q4 metrics report', agent: 'Coder', note: 'Signups and churn', files: 6, items: 3, pct: 40, day: 0, slot: 1 },
			{ id: 9, title: 'Migrate auth to OAuth', agent: 'Coder', note: 'Move every route', files: 63, items: 210, pct: 60, day: 0, slot: 1 },
			{ id: 10, title: 'Fix the flaky checkout test', agent: 'Coder', note: 'Find why it fails', files: 12, items: 1, pct: 35, day: 1, slot: 1 },
			{ id: 11, title: 'Rebuild help center search', agent: 'Atlas CLI', note: 'Index 340 articles', files: 340, items: 50, pct: 20, day: 1, slot: 2 }
		] as SRun[]),
		mode = $bindable<'auto' | 'manual'>('manual')
	}: { days?: string[]; slots?: string[]; runs?: SRun[]; mode?: 'auto' | 'manual' } = $props();
	let dragging = $state<number | null>(null);
	let picked = $state<number | null>(null);
	const queue = $derived(runs.filter((r) => r.day === undefined));
	const at = (d: number, s: number) => runs.filter((r) => r.day === d && r.slot === s);
	const load = (d: number, s: number) => Math.min(100, at(d, s).reduce((n, r) => n + r.pct, 0));
	function place(id: number, day?: number, slot?: number) {
		runs = runs.map((r) => (r.id === id ? { ...r, day, slot } : r));
		picked = null;
	}
	function auto(limit = Infinity) {
		mode = 'auto';
		let next = [...runs];
		for (const r of next.filter((x) => x.day === undefined).slice(0, limit)) {
			let best: [number, number] = [0, 0];
			let min = Infinity;
			days.forEach((_, d) => slots.forEach((_, s) => {
				const l = next.filter((x) => x.day === d && x.slot === s).reduce((n, x) => n + x.pct, 0);
				if (l + r.pct <= 100 && l < min) ((min = l), (best = [d, s]));
			}));
			next = next.map((x) => (x.id === r.id ? { ...x, day: best[0], slot: best[1] } : x));
		}
		runs = next;
	}
	onMount(() => play([[1800, () => auto(1)], [1200, () => auto(1)], [1200, () => auto(1)]], { still: 0 }));
	const drop = (day?: number, slot?: number) => (e: DragEvent) => {
		e.preventDefault();
		if (dragging !== null) place(dragging, day, slot);
		dragging = null;
	};
</script>

{#snippet card(r: SRun)}
	<div class="ui-sr__card" role="button" tabindex="0" draggable="true" aria-pressed={picked === r.id} ondragstart={() => (dragging = r.id)} ondragend={() => (dragging = null)} onclick={() => (picked = picked === r.id ? null : r.id)} onkeydown={(e) => e.key === 'Enter' && (picked = picked === r.id ? null : r.id)}>
		<b>{r.title}</b><small>{r.agent} · {r.note}</small>
		<span class="ui-ag-row"><small>▤ {r.files}</small>{#if r.items}<small>⑂ {r.items}</small>{/if}<span class="ui-ag-grow"></span><span class="ui-ag-pill" data-tone="gray">{r.pct}%</span></span>
	</div>
{/snippet}

<div class="ui-ag ui-sr">
	<div class="ui-ag-row"><b>This week</b><small class="ui-ag-muted ui-ag-grow">5-hour sessions</small><small class="ui-ag-muted">{runs.length} tasks</small>
		<div class="ui-ag-tabs" role="tablist"><button class="ui-ag-tab" role="tab" aria-selected={mode === 'auto'} onclick={() => auto()}>✦ Auto</button><button class="ui-ag-tab" role="tab" aria-selected={mode === 'manual'} onclick={() => (mode = 'manual')}>Manual</button></div>
	</div>
	<div class="ui-sr__grid" style:--d={days.length}>
		<div class="ui-sr__queue" role="list" aria-label="To schedule" ondragover={(e) => e.preventDefault()} ondrop={drop()}>
			<div class="ui-ag-row"><small class="ui-ag-grow">To schedule</small><span class="ui-ag-pill" data-tone="gray">{queue.length}</span></div>
			{#each queue as r (r.id)}<div animate:flip={{ duration: 200 }}>{@render card(r)}</div>{/each}
			{#if !queue.length}<small class="ui-ag-muted">All scheduled ✓</small>{/if}
		</div>
		<div class="ui-sr__times"><span></span>{#each slots as s (s)}<small>{s}</small>{/each}</div>
		{#each days as d, di (d)}
			<div class="ui-sr__day">
				<small class="ui-sr__dh">{d}</small>
				{#each slots as s, si (s)}
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions (click drops the picked card here; keyboard users can schedule with Auto) -->
					<div class="ui-sr__slot" role="listitem" data-target={picked !== null || undefined} ondragover={(e) => e.preventDefault()} ondrop={drop(di, si)} onclick={(e) => picked !== null && e.target === e.currentTarget && place(picked, di, si)} onkeydown={() => {}}>
						{#each at(di, si) as r (r.id)}<div animate:flip={{ duration: 200 }}>{@render card(r)}</div>{/each}
						<span class="ui-sr__load"><i style:width="{load(di, si)}%" data-full={load(di, si) >= 90 || undefined}></i></span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.ui-sr {
		width: 100%;
		max-width: 620px;
		display: grid;
		gap: 10px;
		font-size: 10.5px;
	}
	.ui-sr b {
		font-weight: 500;
	}
	.ui-sr > .ui-ag-row > b {
		font-size: 13px;
	}
	.ui-sr__grid {
		display: grid;
		grid-template-columns: 150px 34px repeat(var(--d), 1fr);
		gap: 6px;
	}
	.ui-sr__queue,
	.ui-sr__day {
		background: var(--ag-fill);
		border-radius: 10px;
		padding: 6px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-sr__day {
		grid-template-rows: auto repeat(3, minmax(110px, auto));
		padding: 0;
		background: none;
	}
	.ui-sr__times {
		display: grid;
		grid-template-rows: 18px repeat(3, minmax(110px, auto));
		gap: 6px;
		color: var(--ag-subtle);
	}
	.ui-sr__dh {
		padding: 3px 6px;
		background: var(--ag-fill);
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 9px;
	}
	.ui-sr__slot {
		position: relative;
		background: var(--ag-fill);
		border-radius: 8px;
		padding: 5px 5px 10px;
		display: grid;
		gap: 4px;
		align-content: start;
	}
	.ui-sr__slot[data-target] {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 40%, transparent);
		cursor: copy;
	}
	.ui-sr__card {
		display: grid;
		gap: 2px;
		padding: 6px 7px;
		border-radius: 7px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		cursor: grab;
	}
	.ui-sr__card[aria-pressed='true'] {
		box-shadow: 0 0 0 1.5px var(--ag-blue);
	}
	.ui-sr__card b,
	.ui-sr__card > small {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-sr__load {
		position: absolute;
		left: 6px;
		right: 6px;
		bottom: 4px;
		height: 2px;
		border-radius: 2px;
		background: var(--ag-line);
	}
	.ui-sr__load i {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: var(--ag-subtle);
		transition: width 0.3s;
	}
	.ui-sr__load i[data-full] {
		background: var(--ag-amber);
	}
</style>
