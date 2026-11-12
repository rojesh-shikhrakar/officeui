<!-- Invoice & Credit Note – an invoice and its credit note stacked like paper; switch between them, download, or turn the invoice into a credit note. -->
<script lang="ts" module>
	export type Line = { name: string; qty: number; rate: number; tax: number; group?: string };
	export type Party = { name: string; lines: string[] };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		from = { name: 'Lumen Labs, Inc.', lines: ['48 Harbour Street', 'Bristol', 'BS1 4RN', 'United Kingdom'] } as Party,
		to = { name: 'Northwind Logistics GmbH', lines: ['Speicherstraße 12', 'Hamburg', '20457', 'Germany'] } as Party,
		number = 'INV-2041',
		date = '1 Oct 2026',
		due = '31 Oct 2026',
		period = '1 Sep – 30 Sep 2026',
		lines = [
			{ name: 'Growth plan', qty: 1, rate: 1250, tax: 0.2 },
			{ name: 'Extra seats', qty: 12, rate: 40, tax: 0.2 },
			{ name: 'API calls (per 1k)', qty: 18420, rate: 0.42, tax: 0.2, group: 'Metered usage' }
		] as Line[],
		view = $bindable<'invoice' | 'credit'>('invoice'),
		ondownload
	}: { from?: Party; to?: Party; number?: string; date?: string; due?: string; period?: string; lines?: Line[]; view?: 'invoice' | 'credit'; ondownload?: (v: string) => void } = $props();
	const money = (n: number) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	const sign = $derived(view === 'credit' ? -1 : 1);
	const subtotal = $derived(lines.reduce((s, l) => s + l.qty * l.rate, 0) * sign);
	const tax = $derived(lines.reduce((s, l) => s + l.qty * l.rate * l.tax, 0) * sign);
</script>

<div class="ui-ag ui-inv">
	<div class="ui-ag-row">
		<div class="ui-ag-tabs ui-ag-grow" role="tablist"><button class="ui-ag-tab" role="tab" aria-selected={view === 'invoice'} onclick={() => (view = 'invoice')}>Invoice</button><button class="ui-ag-tab" role="tab" aria-selected={view === 'credit'} onclick={() => (view = 'credit')}>Credit note</button></div>
		<button class="ui-ag-btn" onclick={() => ondownload?.(view)}>⤓ PDF</button>
		{#if view === 'invoice'}<button class="ui-ag-btn" onclick={() => (view = 'credit')}>↶ Credit invoice</button>{/if}
	</div>
	<div class="ui-inv__stack" data-view={view}>
		<span class="ui-inv__under" aria-hidden="true"></span>
		{#key view}
			<article class="ui-inv__paper ui-ag-in" aria-label={view === 'invoice' ? 'Invoice' : 'Credit note'}>
				<div class="ui-ag-row"><span class="ui-ag-grow"><b class="ui-inv__total">{money(subtotal + tax)}</b><small>{view === 'invoice' ? `Due ${due}` : `Credits ${number}`} {#if view === 'invoice'}<a href="#pay" onclick={(e) => e.preventDefault()}>Pay online</a>{:else}<span class="ui-ag-pill" data-tone="green">Credited</span>{/if}</small></span><span class="ui-inv__brand"><i></i>{from.name}</span></div>
				<div class="ui-inv__parties">{#each [['From', from], ['To', to]] as [k, p] (k)}<div><small class="ui-inv__k">{k}</small><b>{(p as Party).name}</b>{#each (p as Party).lines as l (l)}<span>{l}</span>{/each}</div>{/each}</div>
				<small class="ui-inv__k">Terms</small>
				<dl><dt>{view === 'invoice' ? 'Invoice no' : 'Credit note no'}</dt><dd><a href="#n" onclick={(e) => e.preventDefault()}>{view === 'invoice' ? number : number.replace('INV', 'CN')}</a></dd><dt>{view === 'invoice' ? 'Invoice date' : 'Issued'}</dt><dd>{date}</dd>{#if view === 'invoice'}<dt>Due date</dt><dd>{due}</dd>{/if}<dt>Billing period</dt><dd>{period}</dd></dl>
				<table>
					<thead><tr><th>Name</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Price</th></tr></thead>
					<tbody>
						{#each lines as l, i (l.name)}
							{#if l.group && l.group !== lines[i - 1]?.group}<tr><td colspan="5" class="ui-inv__grp">{l.group}</td></tr>{/if}
							<tr class:ui-inv__ind={!!l.group}><td>{l.name}</td><td>{l.qty.toLocaleString('en-US')}</td><td>{money(l.rate)}</td><td>{Math.round(l.tax * 100)}%</td><td>{money(l.qty * l.rate * sign)}</td></tr>
						{/each}
					</tbody>
					<tfoot><tr><td colspan="4">Subtotal</td><td>{money(subtotal)}</td></tr><tr><td colspan="4">Tax</td><td>{money(tax)}</td></tr><tr class="ui-inv__sum"><td colspan="4">Total</td><td>{money(subtotal + tax)}</td></tr></tfoot>
				</table>
			</article>
		{/key}
	</div>
</div>

<style>
	.ui-inv {
		width: 100%;
		max-width: 620px;
		display: grid;
		gap: 10px;
		font-size: 11.5px;
	}
	.ui-inv__stack {
		position: relative;
		padding-top: 8px;
	}
	.ui-inv__under {
		position: absolute;
		left: 10px;
		right: 10px;
		top: 0;
		height: 30px;
		border-radius: 10px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		opacity: 0.6;
	}
	.ui-inv__paper {
		position: relative;
		background: var(--ag-surface);
		border-radius: 12px;
		box-shadow:
			var(--ag-shadow),
			0 10px 30px -18px rgba(0, 0, 0, 0.2);
		padding: 26px 28px;
		display: grid;
		gap: 16px;
	}
	.ui-inv__total {
		display: block;
		font-size: 21px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	a {
		color: var(--ag-blue);
		text-decoration: none;
		font-weight: 500;
	}
	.ui-inv__brand {
		display: flex;
		align-items: center;
		gap: 6px;
		align-self: start;
	}
	.ui-inv__brand i {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 3px solid var(--ag-blue);
		box-sizing: border-box;
	}
	.ui-inv__parties {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.ui-inv__parties div {
		display: grid;
		gap: 2px;
		color: var(--ag-muted);
	}
	.ui-inv__parties b {
		color: var(--ag-ink);
		font-weight: 400;
	}
	.ui-inv__k {
		display: block;
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
		margin-bottom: 6px;
	}
	dl {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 5px;
		margin: -10px 0 0;
	}
	dt {
		color: var(--ag-muted);
	}
	dd {
		margin: 0;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th {
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
		font-weight: 400;
		text-align: right;
		padding: 6px 0;
		border-bottom: 1px solid var(--ag-line);
	}
	td {
		text-align: right;
		padding: 9px 0;
	}
	th:first-child,
	td:first-child {
		text-align: left;
	}
	th:nth-child(2),
	td:nth-child(2) {
		text-align: left;
		padding-left: 20px;
	}
	.ui-inv__grp {
		font-weight: 500;
		text-align: left;
	}
	.ui-inv__ind td:first-child {
		padding-left: 12px;
	}
	tfoot td {
		color: var(--ag-muted);
		padding: 5px 0;
	}
	tfoot td:first-child {
		text-align: right;
		padding-right: 40px;
	}
	tfoot tr:first-child td {
		padding-top: 16px;
	}
	.ui-inv__sum td {
		color: var(--ag-ink);
		font-weight: 500;
		padding-top: 12px;
	}
</style>
