<!-- Settings / Billing – the plan with the upcoming bill and its breakdown, and usage of seats, credits, storage and agent runs. (The plan comparison is left out on purpose.) -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let {
		plan = { name: 'Pro plan', detail: 'per member / month, billed monthly' },
		bill = { total: 294, renews: 'Dec 6, 2026', lines: [['6 seats', 294], ['Extra credits', 0]] as [string, number][] },
		usage = [['⚇', 'Seats', 6, 10, ''], ['✦', 'Credits', 34000, 50000, ''], ['▤', 'Storage', 42.6, 100, ' GB'], ['◷', 'Agent runs', 2310, 2500, '']] as [string, string, number, number, string][],
		onmanage
	}: { plan?: { name: string; detail: string }; bill?: { total: number; renews: string; lines: [string, number][] }; usage?: [string, string, number, number, string][]; onmanage?: () => void } = $props();
	let details = $state(false);
</script>

{#snippet docs()}<a class="ui-sb__docs" href="#docs" onclick={(e) => e.preventDefault()}>Open docs ↗</a>{/snippet}

<SettingsShell page="billing" title="Billing" subtitle="See your plan, what you pay and what you've used." actions={docs}>
	<div class="ui-ag-card ui-sb">
		<div class="ui-sb__top">
			<div class="ui-sb__plan"><span class="ui-sb__ic">✦</span><span><b>{plan.name}</b><small>{plan.detail}</small></span><button class="ui-ag-btn" data-variant="primary" onclick={() => onmanage?.()}>Manage plan</button></div>
			<div class="ui-sb__bill"><b>Upcoming bill ⓘ</b><small>Renews on {bill.renews}</small><div class="ui-ag-row"><button class="ui-ag-btn" data-variant="ghost" aria-expanded={details} onclick={() => (details = !details)}>{details ? 'Hide details ⌃' : 'Show details ⌄'}</button><span class="ui-ag-grow"></span><b class="ui-sb__total">${bill.total}</b></div>{#if details}<div class="ui-ag-in">{#each bill.lines as [k, v] (k)}<div class="ui-ag-row"><small class="ui-ag-grow">{k}</small><small>${v}</small></div>{/each}</div>{/if}</div>
		</div>
		<div class="ui-sb__usage">{#each usage as [ic, k, v, max, unit] (k)}{@const pct = (v / max) * 100}<div><b>{ic} {k}</b><small><b>{v.toLocaleString('en-US')}</b>{unit} / {max.toLocaleString('en-US')}{unit}</small><span class="ui-ag-bar"><i style:width="{pct}%" style:background={pct > 90 ? 'var(--ag-amber)' : undefined}></i></span></div>{/each}</div>
	</div>
	<h2>Invoices</h2>
	<div class="ui-scr__rows">{#each [['Nov 6, 2026', 294], ['Oct 6, 2026', 245], ['Sep 6, 2026', 245]] as [d, v] (d)}<div class="ui-scr__row"><span><b>{d}</b><small>Paid · card ending 4821</small></span><span>${v}</span><button class="ui-ag-btn" data-variant="ghost">⤓ PDF</button></div>{/each}</div>
</SettingsShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-sb__docs {
		color: var(--ag-muted);
		text-decoration: none;
	}
	.ui-sb {
		overflow: hidden;
	}
	.ui-sb__top {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.ui-sb__plan,
	.ui-sb__bill {
		padding: 14px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-sb__plan {
		grid-template-columns: auto 1fr;
		border-right: 1px solid var(--ag-line);
	}
	.ui-sb__plan > span:nth-child(2) {
		display: grid;
	}
	.ui-sb__plan button {
		grid-column: 1 / -1;
		justify-self: start;
		margin-top: 14px;
	}
	.ui-sb__ic {
		width: 26px;
		height: 26px;
		border-radius: 7px;
		background: color-mix(in srgb, var(--ag-blue) 10%, transparent);
		color: var(--ag-blue);
		display: grid;
		place-items: center;
	}
	.ui-sb__total {
		font-size: 17px;
	}
	.ui-sb__usage {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		padding: 12px 14px;
		background: var(--ag-fill);
	}
	.ui-sb__usage div {
		display: grid;
		gap: 4px;
	}
</style>
