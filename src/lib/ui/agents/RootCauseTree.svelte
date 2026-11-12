<!-- Root Cause Tree – an agent investigates a failure as a tree of hypotheses (OR / AND), checking each against evidence until it confirms or rules them out. -->
<script lang="ts" module>
	export type Hyp = { id: string; title: string; file: string; extra?: number; parent?: string; join?: 'OR' | 'AND'; verdict?: 'confirmed' | 'ruled-out'; finding?: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let {
		symptom = 'Checkout tests failing',
		symptomFile = 'checkout.test.ts',
		failed = '4 of 12',
		hyps = [
			{ id: 'coupon', title: 'Coupon ignored', file: 'coupon.ts', extra: 1, verdict: 'ruled-out', finding: 'Coupons apply correctly in every failing case.' },
			{ id: 'pay', title: 'Payment errors', file: 'payment.log', extra: 0, verdict: 'confirmed', finding: 'The provider rejects amounts sent as floats: "amount must be an integer".' },
			{ id: 'fix', title: 'Stale fixtures', file: 'prices.json', extra: 1, verdict: 'ruled-out', finding: 'Fixtures match production prices.' },
			{ id: 'amount', title: 'Sent as amount', file: 'coupon.ts', parent: 'coupon', join: 'AND', verdict: 'ruled-out', finding: 'Amount is computed after the discount.' },
			{ id: 'cart', title: 'Cart drops it', file: 'total.ts', extra: 1, parent: 'coupon', join: 'AND', verdict: 'ruled-out', finding: 'Cart keeps the coupon through checkout.' }
		] as Hyp[],
		autoplay = true
	}: { symptom?: string; symptomFile?: string; failed?: string; hyps?: Hyp[]; autoplay?: boolean } = $props();
	// order of checks: 0 = nothing checked yet
	let checked = $state(0);
	const order = $derived(['pay', 'coupon', 'amount', 'cart', 'fix']);
	const status = (id: string) => {
		const i = order.indexOf(id);
		if (i < checked) return hyps.find((h) => h.id === id)!.verdict!;
		if (i === checked) return 'checking';
		return 'todo';
	};
	const checking = $derived(hyps.find((h) => h.id === order[checked]));
	const root = $derived(order.slice(0, checked).map((id) => hyps.find((h) => h.id === id)!).find((h) => h.verdict === 'confirmed'));
	const top = $derived(hyps.filter((h) => !h.parent));
	const kids = (id: string) => hyps.filter((h) => h.parent === id);
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = setInterval(() => (checked >= order.length ? clearInterval(t) : checked++), 1500);
		return () => clearInterval(t);
	});
	const label: Record<string, string> = { checking: 'Checking', todo: 'Not checked', confirmed: 'Root cause', 'ruled-out': 'Ruled out' };
</script>

{#snippet node(h: Hyp)}
	{@const s = status(h.id)}
	<button class="ui-rct__node" data-s={s} onclick={() => (checked = Math.max(checked, order.indexOf(h.id)))}>
		<b>{h.title}</b>
		<span class="ui-ag-row"><span class="ui-ag-pill" data-tone="gray">▤ {h.file}</span>{#if h.extra}<small>+{h.extra}</small>{/if}</span>
		<small class="ui-rct__s">{#if s === 'checking'}<span class="ui-ag-spin"></span>{:else if s === 'confirmed'}●{:else if s === 'ruled-out'}×{:else}○{/if} {label[s]}</small>
	</button>
{/snippet}

<div class="ui-ag ui-rct">
	<div class="ui-ag-row"><b class="ui-ag-grow">⛬ Root cause</b>{#if root}<span class="ui-ag-pill" data-tone="green">✓ Found</span>{:else}<span class="ui-ag-pill" data-tone="blue"><span class="ui-ag-spin"></span> Investigating</span>{/if}<small class="ui-ag-muted">{hyps.length} hypotheses · {order.slice(0, checked).filter((id) => status(id) === 'ruled-out').length} ruled out</small></div>
	<div class="ui-rct__sym ui-ag-card"><b>⊗ {symptom}</b><span class="ui-ag-pill" data-tone="gray">▤ {symptomFile}</span><small><span class="ui-ag-pill" data-tone="red">⚠ Failed</span> {failed} · {root ? 'Explained' : 'Investigating'}</small></div>
	<small class="ui-rct__join">OR</small>
	<div class="ui-rct__row">
		{#each top as h (h.id)}
			<div class="ui-rct__col">
				{@render node(h)}
				{#if kids(h.id).length}<small class="ui-rct__join">AND</small><div class="ui-rct__row">{#each kids(h.id) as k (k.id)}{@render node(k)}{/each}</div>{/if}
			</div>
		{/each}
	</div>
	{#if checking || root}
		{@const h = root ?? checking!}
		<div class="ui-ag-card ui-rct__log ui-ag-in">
			<div class="ui-ag-row"><b class="ui-ag-grow">{h.title}</b><small class="ui-ag-muted">{root ? 'Root cause' : 'Checking'}</small></div>
			<p class="ui-ag-muted">{root ? root.finding : 'Checking this now…'}</p>
			<span class="ui-ag-pill" data-tone="gray">▤ logs/{h.file}</span>
		</div>
	{/if}
</div>

<style>
	.ui-rct {
		width: 100%;
		max-width: 420px;
		display: grid;
		gap: 6px;
		font-size: 10.5px;
		justify-items: center;
	}
	.ui-rct > .ui-ag-row {
		width: 100%;
	}
	b {
		font-weight: 500;
	}
	small {
		font-size: 9.5px;
		color: var(--ag-muted);
	}
	.ui-rct__sym {
		display: grid;
		gap: 4px;
		padding: 8px 10px;
		justify-items: start;
	}
	.ui-rct__join {
		font-size: 8.5px;
		color: var(--ag-subtle);
		padding: 1px 6px;
		border-radius: 5px;
		background: var(--ag-fill);
	}
	.ui-rct__row {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: start;
		width: 100%;
	}
	.ui-rct__col {
		display: grid;
		gap: 6px;
		justify-items: center;
	}
	.ui-rct__node {
		all: unset;
		box-sizing: border-box;
		width: 96px;
		display: grid;
		gap: 4px;
		padding: 7px 8px;
		border-radius: 9px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		cursor: pointer;
		transition:
			opacity 0.25s,
			box-shadow 0.25s;
	}
	.ui-rct__node:focus-visible {
		outline: 2px solid var(--ag-blue);
	}
	.ui-rct__node[data-s='ruled-out'] {
		opacity: 0.5;
	}
	.ui-rct__node[data-s='ruled-out'] b {
		text-decoration: line-through;
	}
	.ui-rct__node[data-s='checking'] {
		box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 45%, transparent);
	}
	.ui-rct__node[data-s='confirmed'] {
		box-shadow: 0 0 0 1.5px var(--ag-green);
	}
	.ui-rct__node[data-s='confirmed'] .ui-rct__s {
		color: var(--ag-green);
	}
	.ui-rct__s {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-rct__log {
		width: 100%;
		padding: 8px 10px;
		display: grid;
		gap: 4px;
		justify-items: start;
	}
	.ui-rct__log p {
		margin: 0;
	}
</style>
