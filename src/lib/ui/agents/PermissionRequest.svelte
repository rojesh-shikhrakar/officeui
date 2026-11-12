<!-- Permission Request – an agent asks for one specific right: who, why and exactly what will happen, and you allow it once, for an hour or always (Esc denies, Enter allows); then it folds into one line with what you chose and a live countdown you can revoke. Destructive asks can't be allowed for always. -->
<script lang="ts" module>
	export type Effect = { icon: string; label: string; add?: number; del?: number; amount?: string };
	export type Ask = { agent: string; mark: string; color: string; action: string; where: string; tool: number; risk: 'Risky' | 'Destructive'; reason: string; effects: Effect[]; effectsLabel: string };
	export type Grant = 'ask' | 'once' | 'hour' | 'always' | 'denied';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play, tick } from './script';
	import './agents.css';
	let {
		asks = [
			{ agent: 'Coder', mark: '◎', color: '#171717', action: 'push to main', where: 'acme/web', tool: 11, risk: 'Risky', reason: 'The fix for the flaky checkout test passed review and all 214 checks.', effectsLabel: 'What will happen', effects: [{ icon: '▤', label: 'src/checkout/cart.ts', add: 12, del: 4 }, { icon: '▤', label: 'tests/checkout.spec.ts', add: 31, del: 2 }, { icon: '⚘', label: 'Deploys to production after the merge' }] },
			{ agent: 'Ops agent', mark: '✦', color: '#3b82f6', action: 'refund $240', where: 'Payments · live mode', tool: 8, risk: 'Destructive', reason: 'Two orders were charged twice after the checkout outage this morning.', effectsLabel: 'Refunds', effects: [{ icon: '▤', label: 'Order #4821 · Lena Fischer', amount: '$120.00' }, { icon: '▤', label: 'Order #4822 · Tom Okafor', amount: '$120.00' }] }
		] as Ask[],
		autoplay = true,
		ondecide
	}: { asks?: Ask[]; autoplay?: boolean; ondecide?: (a: Ask, g: Grant) => void } = $props();
	let at = $state(0);
	let choice = $state<'once' | 'hour' | 'always'>('once');
	let decided = $state<{ ask: Ask; grant: Grant; until: number }[]>([]);
	let now = $state(Date.now());
	const cur = $derived(asks[at] as Ask | undefined);
	const label = { once: 'Allow once', hour: 'Allow for 1 hour', always: 'Always allow' } as const;
	function decide(g: Grant) {
		if (!cur) return;
		decided = [{ ask: cur, grant: g, until: Date.now() + 45 * 60_000 }, ...decided];
		ondecide?.(cur, g);
		at++;
		choice = 'once';
	}
	const allow = () => decide(choice);
	function revoke(k: number) {
		decided = decided.map((d, i) => (i === k ? { ...d, grant: 'ask' } : d));
	}
	onMount(() => {
		const p = play([[1800, () => (choice = 'hour')], [1400, () => allow()], [3200, () => decide('denied')]], { autoplay, still: 0 });
		const t = tick(1000, () => (now = Date.now()));
		return () => (p(), t());
	});
	const left = (u: number) => Math.max(0, Math.ceil((u - now) / 60_000));
	const until = (u: number) => new Date(u).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<svelte:window onkeydown={(e) => { if (!cur || (e.target as HTMLElement).matches('input, textarea')) return; if (e.key === 'Escape') decide('denied'); else if (e.key === 'Enter') allow(); }} />

<div class="ui-ag ui-pr">
	{#each decided as d, k (d.ask.action + k)}
		<div class="ui-ag-card ui-pr__line ui-pr__swap" data-grant={d.grant}>
			<span class="ui-pr__ok">{d.grant === 'denied' ? '×' : d.grant === 'ask' ? '↶' : '✓'}</span>
			<span class="ui-ag-grow"><span><b>{d.grant === 'denied' ? 'Denied' : d.grant === 'ask' ? 'Revoked' : d.grant === 'hour' ? 'Allowed for 1 hour' : d.grant === 'always' ? 'Always allowed' : 'Allowed once'}</b> <span class="ui-ag-muted">· {d.ask.action}</span></span><small>{d.grant === 'hour' ? `${left(d.until)} min left · until ${until(d.until)}` : d.grant === 'denied' ? `${d.ask.agent} was told and won't do it` : d.grant === 'ask' ? 'It will ask again next time' : d.grant === 'always' ? 'It won’t ask about this again' : 'It will ask again next time'}</small></span>
			{#if d.grant === 'hour' || d.grant === 'always'}<button class="ui-ag-btn" data-variant="ghost" onclick={() => revoke(k)}>Revoke</button>{:else if d.grant === 'denied'}<button class="ui-ag-btn" data-variant="ghost" onclick={() => ((at = asks.indexOf(d.ask)), (decided = decided.filter((_, i) => i !== k)))}>Change</button>{/if}
			{#if d.grant === 'hour'}<span class="ui-pr__time" style:width="{(left(d.until) / 60) * 100}%"></span>{/if}
		</div>
	{/each}
	{#if cur}
		{#key at}
			<div class="ui-ag-card ui-pr__card ui-pr__in">
				<div class="ui-ag-row"><span class="ui-pr__mk" style:color={cur.color}>{cur.mark}</span><span class="ui-ag-grow"><span><b>{cur.agent}</b> <span class="ui-ag-muted">wants to</span> <b>{cur.action}</b></span><small><Mark i={cur.tool} size={11} /> {cur.where}</small></span><span class="ui-ag-pill" data-tone={cur.risk === 'Risky' ? 'amber' : 'red'}>{cur.risk === 'Risky' ? '⚠' : '⊘'} {cur.risk}</span></div>
				<p class="ui-pr__why">{cur.reason}</p>
				<small class="ui-pr__h">{cur.effectsLabel} <span class="ui-ag-pill" data-tone="gray">{cur.effects.length}</span></small>
				<ul>{#each cur.effects as e (e.label)}<li><span class="ui-pr__ic">{e.icon}</span><span class="ui-ag-grow">{e.label}</span>{#if e.add !== undefined}<small style:color="var(--ag-green)">+{e.add}</small> <small style:color="var(--ag-red)">−{e.del}</small>{/if}{#if e.amount}<small>{e.amount}</small>{/if}</li>{/each}</ul>
				<div class="ui-pr__seg" role="radiogroup" aria-label="How long">
					<button role="radio" aria-checked={choice === 'once'} onclick={() => (choice = 'once')}>Just once</button>
					<button role="radio" aria-checked={choice === 'hour'} onclick={() => (choice = 'hour')}>1 hour</button>
					{#if cur.risk !== 'Destructive'}<button role="radio" aria-checked={choice === 'always'} onclick={() => (choice = 'always')}>Always</button>{/if}
				</div>
				{#if cur.risk === 'Destructive'}<small class="ui-ag-muted">Destructive actions can't be allowed for always</small>{/if}
				<div class="ui-ag-row"><span class="ui-ag-grow"></span><button class="ui-ag-btn" data-variant="ghost" onclick={() => decide('denied')}>Deny <span class="ui-ag-kbd">Esc</span></button><button class="ui-ag-btn" data-variant="primary" data-danger={cur.risk === 'Destructive' || undefined} onclick={allow}>{label[choice]} <span class="ui-ag-kbd">↵</span></button></div>
			</div>
		{/key}
	{/if}
</div>

<style>
	.ui-pr {
		width: 100%;
		max-width: 380px;
		display: grid;
		gap: 8px;
		font-size: 12px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-pr__in {
		animation: ui-ag-rise 0.45s var(--ag-ease) both;
	}
	.ui-pr__swap {
		animation: ui-pr-swap 0.45s var(--ag-ease) both;
	}
	@keyframes ui-pr-swap {
		from {
			opacity: 0;
			transform: scaleY(1.6);
			transform-origin: top;
		}
	}
	.ui-pr__card {
		padding: 12px;
		display: grid;
		gap: 8px;
	}
	.ui-pr__card .ui-ag-grow {
		display: grid;
	}
	.ui-pr__card .ui-ag-grow small {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-pr__mk {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		align-self: start;
	}
	.ui-pr__why {
		margin: 0 0 0 32px;
		padding-left: 10px;
		border-left: 2px solid var(--ag-line);
		color: var(--ag-muted);
		line-height: 1.5;
	}
	.ui-pr__h {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 6px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-pr__ic {
		color: var(--ag-subtle);
	}
	.ui-pr__seg {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 4px;
		padding: 3px;
		border-radius: 9px;
		background: var(--ag-fill);
	}
	.ui-pr__seg button {
		border: 0;
		border-radius: 7px;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		padding: 5px;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.ui-pr__seg button[aria-checked='true'] {
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
	}
	.ui-ag-btn[data-danger] {
		background: var(--ag-red);
	}
	.ui-pr__line {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		overflow: hidden;
	}
	.ui-pr__line .ui-ag-grow {
		display: grid;
	}
	.ui-pr__ok {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.4px var(--ag-green);
		color: var(--ag-green);
		display: grid;
		place-items: center;
		font-size: 9px;
		flex: none;
	}
	[data-grant='denied'] .ui-pr__ok {
		box-shadow: inset 0 0 0 1.4px var(--ag-red);
		color: var(--ag-red);
	}
	[data-grant='ask'] .ui-pr__ok {
		box-shadow: inset 0 0 0 1.4px var(--ag-subtle);
		color: var(--ag-subtle);
	}
	.ui-pr__time {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		background: var(--ag-green);
		transition: width 1s linear;
	}
</style>
