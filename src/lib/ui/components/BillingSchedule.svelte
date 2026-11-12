<!-- Billing Schedule – build a billing phase: start date, duration, products with repeats and timing, discount, minimum and live totals. -->
<script lang="ts" module>
	export type BillingLine = { id: string; name: string; price: number; repeat: 'once' | 'monthly' | 'yearly'; timing: 'advance' | 'arrears' };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		phase = 'Build-out phase',
		start = $bindable('2026-01-01'),
		duration = $bindable('milestone'),
		lines = $bindable([{ id: '1', name: 'Set-up fee', price: 4999, repeat: 'once', timing: 'advance' }]),
		discount = $bindable(0),
		minimum = $bindable(0)
	}: { phase?: string; start?: string; duration?: 'milestone' | '3m' | '12m'; lines?: BillingLine[]; discount?: number; minimum?: number } = $props();
	const upd = (i: number, patch: Partial<BillingLine>) => (lines = lines.map((l, k) => (k === i ? { ...l, ...patch } : l)));
	const months = $derived(duration === '12m' ? 12 : duration === '3m' ? 3 : 1);
	const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	const lineTotal = (l: BillingLine) => (l.repeat === 'once' ? l.price : l.repeat === 'monthly' ? l.price * months : l.price * Math.ceil(months / 12));
	const subtotal = $derived(lines.reduce((s, l) => s + lineTotal(l), 0));
	const total = $derived(Math.max(minimum, subtotal * (1 - discount / 100)));
	const first = $derived(Math.max(0, lines.reduce((s, l) => s + (l.timing === 'advance' ? l.price : 0), 0) * (1 - discount / 100)));
	const label = $derived(new Date(start + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
	let showDiscount = $state(false);
	let showMin = $state(false);
</script>

<div class="ui-ag ui-ag-panel ui-bsc">
	<div class="ui-ag-body">
		<b class="ui-bsc__t">Create a billing schedule</b>
		<span class="ui-ag-muted"><b class="ui-bsc__p">{phase}</b> · {label} → {duration === 'milestone' ? 'Milestone' : `${months} months`}</span>
		<div class="ui-bsc__two">
			<label>Start date<input class="ui-ag-input" type="date" bind:value={start} /></label>
			<label>Duration<select class="ui-ag-input" bind:value={duration}><option value="milestone">Milestone</option><option value="3m">3 months</option><option value="12m">12 months</option></select></label>
		</div>
	</div>
	<table>
		<thead><tr><th>Name</th><th>Repeats</th><th>Price</th><th></th></tr></thead>
		<tbody>
			{#each lines as l, i (l.id)}
				<tr class="ui-ag-in">
					<td><input class="ui-bsc__name" value={l.name} oninput={(e) => upd(i, { name: e.currentTarget.value })} aria-label="Product name" /></td>
					<td><select value={l.repeat} onchange={(e) => upd(i, { repeat: e.currentTarget.value as BillingLine['repeat'] })} aria-label="Repeats"><option value="once">Once</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></td>
					<td class="ui-bsc__price">$<input type="number" value={l.price} oninput={(e) => upd(i, { price: +e.currentTarget.value })} aria-label="Price" /><small>/ {l.repeat === 'once' ? 'once' : l.repeat === 'monthly' ? 'month' : 'year'}</small>
						<select value={l.timing} onchange={(e) => upd(i, { timing: e.currentTarget.value as BillingLine['timing'] })} aria-label="Timing"><option value="advance">Billed in advance</option><option value="arrears">Billed in arrears</option></select></td>
					<td><button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {l.name}" onclick={() => (lines = lines.filter((x) => x.id !== l.id))}>×</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="ui-ag-foot ui-bsc__add">
		<button class="ui-ag-btn" style:margin-right="auto" onclick={() => (lines = [...lines, { id: String(Date.now()), name: 'Platform licence', price: 1200, repeat: 'monthly', timing: 'advance' }])}>+ Add product</button>
		{#if showDiscount}<label class="ui-bsc__inl">Discount<input type="number" bind:value={discount} aria-label="Discount percent" />%</label>{:else}<button class="ui-ag-btn" onclick={() => (showDiscount = true)}>⊘ Add discount</button>{/if}
		{#if showMin}<label class="ui-bsc__inl">Minimum $<input type="number" bind:value={minimum} aria-label="Minimum" /></label>{:else}<button class="ui-ag-btn" onclick={() => (showMin = true)}>⊥ Add minimum</button>{/if}
	</div>
	<div class="ui-ag-foot ui-bsc__tot"><span class="ui-ag-muted">First invoice</span><b>{money(first)}</b><span class="ui-ag-muted" style:margin-left="auto">Phase total</span><b>{money(total)}</b></div>
</div>

<style>
	.ui-bsc {
		max-width: 470px;
		font-size: 12.5px;
	}
	.ui-bsc__t {
		font-size: 14px;
		font-weight: 600;
	}
	.ui-bsc__p {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-bsc__two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: 4px;
	}
	label {
		display: grid;
		gap: 4px;
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		text-align: left;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
		padding: 6px 14px;
		border-top: 1px solid var(--ag-line);
		border-bottom: 1px solid var(--ag-line);
	}
	td {
		padding: 8px 14px;
		vertical-align: top;
	}
	td input,
	td select {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-bsc__name {
		font-weight: 500;
		width: 120px;
	}
	td select {
		color: var(--ag-muted);
	}
	.ui-bsc__price {
		text-align: right;
		font-weight: 500;
	}
	.ui-bsc__price input {
		width: 70px;
		text-align: right;
		font-weight: 500;
	}
	.ui-bsc__price small {
		color: var(--ag-muted);
		font-weight: 400;
	}
	.ui-bsc__price select {
		display: block;
		margin-left: auto;
		font-size: 11px;
	}
	.ui-bsc__add {
		justify-content: flex-start;
		flex-wrap: wrap;
	}
	.ui-bsc__inl {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-bsc__inl input {
		width: 50px;
		border: 0;
		background: var(--ag-fill);
		border-radius: 5px;
		padding: 3px 5px;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-bsc__tot {
		justify-content: flex-start;
	}
	.ui-bsc__tot b {
		font-size: 15px;
		font-weight: 600;
	}
</style>
