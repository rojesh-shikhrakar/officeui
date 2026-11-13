<!-- Away Summary – the "While you were away" card for a chat thread: how long you were gone, what needs you, what failed and what got done. -->
<script lang="ts" module>
	export type AwayItem = { title: string; detail: string; state: 'needs' | 'failed' | 'done'; action: string; options?: [string, string]; fixed?: string; busy?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		you = 'Get ingest onto staging today – ping me if you need anything.',
		reply = "On it. I'll split it into tasks and keep going while you're out.",
		away = '2h 14m',
		items = $bindable([
			{ title: 'Ingest pipeline', detail: 'Waiting on: Which queue – Kafka or SQS?', state: 'needs', action: 'Decide', options: ['Kafka', 'SQS'], fixed: 'deploying to staging' },
			{ title: 'Weekly report', detail: 'Waiting on: Send it to Dana or the whole team?', state: 'needs', action: 'Decide', options: ['Dana', 'The whole team'], fixed: 'sent' },
			{ title: 'Billing sync', detail: 'Failed: rate limit after 1,284 invoices', state: 'failed', action: 'Retry', fixed: 'Retried · synced all 3,900 invoices' },
			{ title: 'Auth refactor', detail: 'Opened PR #482 · on staging', state: 'done', action: 'Open' },
			{ title: 'Usage page', detail: 'Shipped to Northwind', state: 'done', action: 'Open' },
			{ title: 'Docs update', detail: 'Merged', state: 'done', action: 'Open' },
			{ title: 'Changelog', detail: 'Posted', state: 'done', action: 'Open' },
			{ title: 'Load test', detail: '20k events a minute · p95 under 100 ms', state: 'done', action: 'Open' }
		] as AwayItem[]),
		autoplay = true,
		ondismiss,
		onopen
	}: { you?: string; reply?: string; away?: string; items?: AwayItem[]; autoplay?: boolean; ondismiss?: () => void; onopen?: (it: AwayItem) => void } = $props();
	let asking = $state<string | null>(null);
	const upd = (t: string, p: Partial<AwayItem>) => (items = items.map((i) => (i.title === t ? { ...i, ...p } : i)));
	function answer(it: AwayItem, choice: string) {
		upd(it.title, { state: 'done', action: 'Open', detail: `Answered: ${choice} · ${it.fixed}`, options: undefined });
		asking = null;
	}
	function retry(it: AwayItem) {
		upd(it.title, { busy: true });
		setTimeout(() => upd(it.title, { busy: false, state: 'done', action: 'Open', detail: it.fixed ?? 'Done' }), 1100);
	}
	function act(it: AwayItem) {
		if (it.action === 'Decide') asking = asking === it.title ? null : it.title;
		else if (it.action === 'Retry') retry(it);
		else onopen?.(it);
	}
	onMount(() => play([[2400, () => answer(items[0], 'Kafka')], [2400, () => answer(items[1], 'The whole team')], [2000, () => retry(items[2])]], { autoplay, still: 0 }));
	let all = $state(false);
	let gone = $state(false);
	const count = (s: string) => items.filter((i) => i.state === s).length;
	const color = { needs: 'var(--ag-amber)', failed: 'var(--ag-red)', done: 'var(--ag-blue)' } as const;
</script>

<div class="ui-ag ui-aws">
	<p class="ui-aws__you">{you}</p>
	<p class="ui-aws__ai"><span style:color="#7c5cff">✦</span>{reply}</p>
	{#if !gone}
		<div class="ui-ag-panel ui-aws__card ui-ag-in">
			<div class="ui-ag-head"><b>While you were away <span class="ui-ag-muted">· {away}</span></b>{#if count('needs')}<small style:color={color.needs}>● {count('needs')} need{count('needs') === 1 ? 's' : ''} you</small>{/if}{#if count('failed')}<small style:color={color.failed}>● {count('failed')} failed</small>{/if}<small style:color={color.done}>● {count('done')} done</small></div>
			<ul class="ui-ag-list ui-aws__list">
				{#each all ? items : items.slice(0, 5) as it (it.title)}
					<li class="ui-ag-item ui-aws__it"><i class="ui-aws__dot" data-s={it.state} style:background={color[it.state]}>{#if it.state === 'done'}✓{:else if it.state === 'failed'}!{/if}</i><span class="ui-ag-grow"><b>{it.title}</b><small>{it.detail}</small>{#if asking === it.title && it.options}<span class="ui-aws__opts ui-ag-in">{#each it.options as o (o)}<button class="ui-ag-chip" onclick={() => answer(it, o)}>{o}</button>{/each}</span>{/if}</span><button class="ui-ag-btn" data-variant={it.state === 'done' ? 'ghost' : undefined} aria-label="{it.action}: {it.title}" disabled={it.busy} onclick={() => act(it)}>{#if it.busy}<i class="ui-ag-spin"></i>{/if}{it.action}</button></li>
				{/each}
			</ul>
			<div class="ui-ag-foot"><button class="ui-ag-btn" data-variant="ghost" style:margin-right="auto" onclick={() => (all = !all)}>{all ? 'Show less' : `Show ${items.length - 5} more`}</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => ((gone = true), ondismiss?.())}>✓ Got it</button></div>
		</div>
	{/if}
	<input class="ui-ag-input" placeholder="Reply to the agent…" aria-label="Reply to the agent" />
</div>

<style>
	.ui-aws__dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #fff;
		font-size: 7px;
		font-style: normal;
		font-weight: 700;
		flex: none;
		align-self: start;
		margin-top: 3px;
		animation: ui-ag-pop 0.35s var(--ag-ease);
	}
	.ui-aws__dot[data-s='needs'] {
		background: none !important;
		box-shadow: inset 0 0 0 2px var(--ag-amber);
		animation: ui-ag-breathe 1.8s ease-in-out infinite;
	}
	.ui-aws__opts {
		display: flex;
		gap: 4px;
		margin-top: 4px;
	}
	.ui-aws__it .ui-ag-grow {
		display: grid;
	}
	.ui-aws {
		width: 100%;
		max-width: 390px;
		display: grid;
		gap: 10px;
		font-size: 12px;
	}
	.ui-aws__you {
		margin: 0;
		justify-self: end;
		background: var(--ag-fill);
		border-radius: 14px;
		padding: 6px 12px;
	}
	.ui-aws__ai {
		margin: 0;
		display: flex;
		gap: 6px;
	}
	.ui-aws__card {
		max-width: none;
	}
	.ui-aws__list {
		padding: 4px 6px;
	}
	.ui-aws__list i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		flex: none;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		color: var(--ag-muted);
		font-size: 11px;
	}
</style>
