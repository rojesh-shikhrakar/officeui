<!-- Agent Ledger – everything an agent changed in your systems, each change with an undo: before and after per row, and pointing at Undo shows what builds on it – what would be undone too, and what can't be taken back. -->
<script lang="ts" module>
	export type Change = { id: string; verb: string; object: string; before?: string; after: string; tool: number; app: string; at: number; dependsOn?: string[]; final?: boolean; undone?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play, tick } from './script';
	import './agents.css';
	const X = (id: string, verb: string, object: string, after: string, tool: number, app: string, at: number, extra: Partial<Change> = {}): Change => ({ id, verb, object, after, tool, app, at, ...extra });
	let {
		agent = 'Launch agent',
		changes = $bindable([X('pr', 'Merged PR #482', 'Pricing page v2', 'main', 11, 'Git', -42, { before: 'pricing-v2' }), X('dep', 'Deployed', 'acme.com', '#483 in production', 11, 'Hosting', 0, { before: '#481', dependsOn: ['pr'] })] as Change[]),
		autoplay = true,
		onundo
	}: { agent?: string; changes?: Change[]; autoplay?: boolean; onundo?: (c: Change[]) => void } = $props();
	let now = $state(0);
	let hover = $state<string | null>(null);
	let fresh = $state<string | null>(null);
	const shown = $derived([...changes].sort((a, b) => b.at - a.at));
	// Everything that builds on a change, directly or not
	function affected(id: string): Set<string> {
		const out = new Set<string>();
		const walk = (x: string) => changes.forEach((c) => c.dependsOn?.includes(x) && !out.has(c.id) && (out.add(c.id), walk(c.id)));
		walk(id);
		return out;
	}
	const hot = $derived(hover ? affected(hover) : new Set<string>());
	const ago = (at: number) => { const s = Math.round(now - at); return s < 5 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`; };
	function add(c: Change) {
		changes = [...changes, { ...c, at: now }];
		fresh = c.id;
	}
	function undo(id: string) {
		const ids = new Set([id, ...affected(id)]);
		const gone = changes.filter((c) => ids.has(c.id) && !c.final);
		changes = changes.map((c) => (ids.has(c.id) && !c.final ? { ...c, undone: true } : c));
		hover = null;
		onundo?.(gone);
	}
	onMount(() => {
		const p = play(
			[
				[1400, () => add(X('price', 'Changed price', 'Pro plan', '$34 / month', 8, 'Payments', 0, { before: '$29 / month' }))],
				[1400, () => add(X('coupon', 'Created coupon', 'LAUNCH20', '20% off the first year · ends in 7 days', 8, 'Payments', 0))],
				[1400, () => add(X('faq', 'Updated page', 'Pricing FAQ', '3 answers rewritten', 11, 'Notes', 0, { before: '3 answers', dependsOn: ['price'] }))],
				[1400, () => add(X('crm', 'Updated 212 deals', 'Renewals in Q4', '$34 per seat', 6, 'CRM', 0, { before: '$29 per seat', dependsOn: ['price'] }))],
				[1400, () => add(X('post', 'Posted in #launch', 'New pricing is live', 'With a link to the pricing page', 3, 'Chat', 0, { dependsOn: ['dep'] }))],
				[1400, () => add(X('mail', 'Sent email', '3,812 customers', 'New price and the code LAUNCH20', 9, 'Mail', 0, { dependsOn: ['price', 'coupon'], final: true }))]
			],
			{ autoplay, still: 6 }
		);
		const t = tick(1000, () => (now += 1));
		return () => (p(), t());
	});
</script>

<div class="ui-ag ui-ag-card ui-ldg">
	<div class="ui-ag-title ui-ldg__head"><span style:color="var(--ag-blue)">▤</span><b>Ledger</b><span class="ui-ag-muted">{agent}</span><span class="ui-ag-meta">{changes.filter((c) => !c.undone).length} changes</span></div>
	<ol>
		{#each shown as c (c.id)}
			{@const dep = hover && hot.has(c.id)}
			<li class="ui-ldg__row" class:ui-ag-rise={fresh === c.id} data-also={dep && !c.final ? '' : undefined} data-final={dep && c.final ? '' : undefined} data-undone={c.undone || undefined}>
				<Mark i={c.tool} size={14} />
				<span class="ui-ldg__body"><span><b>{c.verb}</b> <span class="ui-ag-muted">{c.object}</span></span><small>{#if c.before}<s>{c.before}</s> → {/if}{c.after}</small></span>
				{#if dep && c.final}<span class="ui-ag-pill" data-tone="amber">⊘ Can't undo</span>
				{:else if dep}<span class="ui-ag-pill" data-tone="blue">Also undone</span>
				{:else if c.undone}<span class="ui-ag-pill" data-tone="gray">Undone</span>
				{:else if !c.final}<button class="ui-ag-btn ui-ldg__undo" aria-label="Undo: {c.verb} {c.object}{affected(c.id).size ? ` – and ${affected(c.id).size} that build on it` : ''}" onpointerenter={() => (hover = c.id)} onpointerleave={() => (hover = null)} onfocus={() => (hover = c.id)} onblur={() => (hover = null)} onclick={() => undo(c.id)}>↶ Undo</button>{/if}
				<small class="ui-ldg__when">{ago(c.at)} · {c.app}</small>
			</li>
		{/each}
	</ol>
</div>

<style>
	.ui-ldg {
		width: 100%;
		max-width: 500px;
		padding: 0;
		font-size: 12.5px;
		overflow: hidden;
	}
	.ui-ldg__head {
		padding: 12px 14px 8px;
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0 4px 4px;
	}
	.ui-ldg__row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border-radius: 8px;
		transition: background-color 0.2s;
	}
	.ui-ldg__row:hover {
		background: var(--ag-fill);
	}
	.ui-ldg__row[data-also] {
		background: color-mix(in srgb, var(--ag-blue) 7%, transparent);
	}
	.ui-ldg__row[data-final] {
		background: color-mix(in srgb, var(--ag-amber) 9%, transparent);
	}
	.ui-ldg__row[data-undone] {
		opacity: 0.45;
	}
	.ui-ldg__row[data-undone] b {
		text-decoration: line-through;
	}
	.ui-ldg__body {
		flex: 1;
		min-width: 0;
		display: grid;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	s {
		color: var(--ag-subtle);
	}
	.ui-ldg__when {
		white-space: nowrap;
		min-width: 92px;
		text-align: right;
	}
	.ui-ldg__undo {
		padding: 2px 8px;
		font-size: 11px;
		opacity: 0;
	}
	.ui-ldg__row:hover .ui-ldg__undo,
	.ui-ldg__undo:focus-visible {
		opacity: 1;
	}
</style>
