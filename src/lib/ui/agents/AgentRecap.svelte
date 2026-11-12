<!-- Agent Recap – what the agents did while you were away: the night as a small chart with a peak per event, then a board of what needs you, what failed and what's done, acted on right there (approve, merge, retry, undo). -->
<script lang="ts" module>
	export type RecapItem = { id: string; title: string; detail: string; time: string; hour: number; tool: number; count?: number; action?: string; status: 'needs' | 'failed' | 'done'; note?: string; undone?: boolean; busy?: boolean };
</script>

<script lang="ts">
	import Mark from './Mark.svelte';
	import './agents.css';
	let {
		since = '6:40 PM',
		until = '8:10 AM',
		away = '13h 30m',
		items = $bindable([
			{ id: '1', title: 'Refund $240 to Acme Corp', detail: 'Support agent · over the $200 auto-approve limit', time: '2:14 AM', hour: 7.57, tool: 8, action: 'Approve', status: 'needs' },
			{ id: '2', title: 'Merge the checkout fix', detail: 'All 212 tests green · needs a code owner', time: '4:37 AM', hour: 9.95, tool: 11, action: 'Merge', status: 'needs' },
			{ id: '3', title: 'Contact sync to the CRM', detail: 'Token expired after 1,284 of 3,900 contacts', time: '3:02 AM', hour: 8.37, tool: 6, action: 'Retry', status: 'failed' },
			{ id: '4', title: 'Answered support tickets', detail: 'first reply in 2 min', count: 38, time: '7:05 PM', hour: 0.42, tool: 3, status: 'done' },
			{ id: '5', title: 'Closed stale pull requests', detail: '', count: 6, time: '8:10 PM', hour: 1.5, tool: 11, status: 'done' },
			{ id: '6', title: 'Triaged new issues', detail: '4 marked urgent', count: 17, time: '10:30 PM', hour: 3.83, tool: 1, status: 'done' }
		] as RecapItem[]),
		onact
	}: { since?: string; until?: string; away?: string; items?: RecapItem[]; onact?: (it: RecapItem, action: string) => void } = $props();
	const span = 13.5;
	const cols = [
		{ id: 'needs', label: 'Needs you', icon: '⚇' },
		{ id: 'failed', label: 'Failed', icon: '△' },
		{ id: 'done', label: 'Done', icon: '◷' }
	] as const;
	let open = $state<string | null>(null);
	const count = (s: string) => items.filter((i) => i.status === s && !i.undone).length;
	const upd = (id: string, p: Partial<RecapItem>) => (items = items.map((x) => (x.id === id ? { ...x, ...p } : x)));
	function act(it: RecapItem) {
		onact?.(it, it.action ?? '');
		if (it.action === 'Retry') {
			upd(it.id, { busy: true });
			setTimeout(() => upd(it.id, { busy: false, status: 'done', note: 'Synced 3,900 contacts just now' }), 1200);
		} else upd(it.id, { status: 'done', note: `${it.action === 'Merge' ? 'Merged' : 'Approved'} just now` });
	}
	// The night as a curve: a bump per event, plus a few small ones for the background work
	const W = 400, H = 70;
	const bumps = $derived([...items.map((i) => ({ x: i.hour, h: i.status === 'done' ? 0.85 : 0.6 })), { x: 0.9, h: 0.55 }, { x: 2.6, h: 0.35 }, { x: 9.2, h: 0.4 }]);
	const curve = $derived.by(() => {
		const pts = Array.from({ length: 120 }, (_, k) => {
			const t = (k / 119) * span;
			const y = bumps.reduce((m, b) => Math.max(m, b.h * Math.exp(-((t - b.x) ** 2) / 0.12)), 0);
			return [(t / span) * W, H - 4 - y * (H - 12)] as const;
		});
		return pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
	});
</script>

<div class="ui-ag ui-ag-card ui-arc">
	<div class="ui-ag-title"><span><b>While you were away</b><small class="ui-arc__since">Since {since} <em>{away}</em></small></span><span class="ui-ag-meta">◷ <b>{count('done')}</b> done &nbsp; ⚇ <b>{count('needs')}</b> need you &nbsp; △ <b>{count('failed')}</b> failed</span></div>
	<svg class="ui-arc__chart" viewBox="0 0 {W} {H}" preserveAspectRatio="none" role="img" aria-label="Agent activity from {since} to {until}">
		<defs><linearGradient id="ui-arc-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--ag-ink)" stop-opacity="0.07" /><stop offset="1" stop-color="var(--ag-ink)" stop-opacity="0" /></linearGradient></defs>
		<path d="{curve}L{W},{H}L0,{H}Z" fill="url(#ui-arc-g)" />
		<path d={curve} fill="none" stroke="var(--ag-muted)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
	</svg>
	<div class="ui-arc__dots" aria-hidden="true">{#each items as i (i.id)}<i data-s={i.status} style:left="{(i.hour / span) * 100}%" style:top="{((H - 4 - (i.status === 'done' ? 0.85 : 0.6) * (H - 12)) / H) * 100}%"></i>{/each}</div>
	<div class="ui-ag-row ui-arc__x"><small class="ui-ag-grow">{since}</small><small>{until}</small></div>
	<div class="ui-arc__board">
		{#each cols as c (c.id)}
			<section>
				<header><span>{c.icon}</span>{c.label}<em>{count(c.id)}</em></header>
				{#each items.filter((i) => i.status === c.id) as it (it.id)}
					<article class="ui-ag-card ui-ag-rise" data-undone={it.undone || undefined}>
						<div class="ui-arc__t"><Mark i={it.tool} size={12} /><b>{it.title}</b></div>
						<div class="ui-arc__sub"><small data-fail={c.id === 'failed' || undefined}>{it.note ?? it.detail}</small>{#if it.count}<span class="ui-arc__n">{it.count}</span>{/if}<small>{it.time}</small></div>
						{#if open === it.id}<p class="ui-arc__more ui-ag-in">{it.detail || it.title}. Opened from the {c.label.toLowerCase()} column at {it.time}.</p>{/if}
						<footer>
							{#if c.id === 'done'}
								<span class="ui-ag-pill" data-tone={it.undone ? 'gray' : 'green'}>{it.undone ? 'Undone' : 'Done'}</span><span class="ui-ag-grow"></span>
								<button class="ui-ag-btn" data-variant="ghost" aria-label="{it.undone ? 'Redo' : 'Undo'}: {it.title}" onclick={() => (upd(it.id, { undone: !it.undone }), onact?.(it, it.undone ? 'Redo' : 'Undo'))}>{it.undone ? 'Redo' : 'Undo'}</button>
							{:else}
								<span class="ui-ag-grow"></span>
								<button class="ui-ag-btn" data-variant="ghost" aria-label="Review: {it.title}" aria-expanded={open === it.id} onclick={() => (open = open === it.id ? null : it.id)}>Review</button>
								<button class="ui-ag-btn" aria-label="{it.action}: {it.title}" disabled={it.busy} onclick={() => act(it)}>{#if it.busy}<i class="ui-ag-spin"></i>{/if}{it.busy ? 'Retrying' : it.action}</button>
							{/if}
						</footer>
					</article>
				{/each}
			</section>
		{/each}
	</div>
</div>

<style>
	.ui-arc {
		position: relative;
		width: 100%;
		max-width: 680px;
		padding: 12px;
		font-size: 12px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-arc__since {
		display: block;
	}
	.ui-arc__since em {
		font-style: normal;
		background: var(--ag-fill);
		padding: 0 5px;
		border-radius: 4px;
		margin-left: 4px;
	}
	.ui-arc__chart {
		display: block;
		width: 100%;
		height: 70px;
		margin-top: 8px;
	}
	.ui-arc__dots {
		position: absolute;
		left: 12px;
		right: 12px;
		top: 58px;
		height: 70px;
		pointer-events: none;
	}
	.ui-arc__dots i {
		position: absolute;
		width: 5px;
		height: 5px;
		margin: -2.5px;
		border-radius: 50%;
		background: var(--ag-ink);
		animation: ui-ag-pop 0.4s var(--ag-ease) both;
	}
	.ui-arc__dots i[data-s='needs'] {
		background: var(--ag-amber);
	}
	.ui-arc__dots i[data-s='failed'] {
		background: var(--ag-red);
	}
	.ui-arc__x {
		margin-bottom: 8px;
	}
	.ui-arc__board {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	section {
		display: grid;
		gap: 6px;
		align-content: start;
		padding: 6px;
		border-radius: 10px;
		background: var(--ag-fill);
		min-height: 150px;
	}
	header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 2px 4px;
		color: var(--ag-muted);
		font-size: 11px;
	}
	header em {
		margin-left: auto;
		font-style: normal;
		font-size: 10px;
		padding: 0 5px;
		border-radius: 4px;
		background: var(--ag-surface);
	}
	article {
		padding: 8px 9px;
		display: grid;
		gap: 4px;
	}
	article[data-undone] b {
		text-decoration: line-through;
		color: var(--ag-muted);
	}
	.ui-arc__t {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-arc__t b {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-arc__sub {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-left: 18px;
	}
	.ui-arc__sub small:first-child {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	small[data-fail] {
		color: var(--ag-red);
	}
	.ui-arc__n {
		font-size: 10px;
		padding: 0 5px;
		border-radius: 4px;
		background: var(--ag-fill);
	}
	.ui-arc__more {
		margin: 0;
		padding-left: 18px;
		color: var(--ag-muted);
		font-size: 11px;
	}
	footer {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-left: 18px;
	}
	footer .ui-ag-btn {
		padding: 2px 8px;
		font-size: 11px;
	}
</style>
