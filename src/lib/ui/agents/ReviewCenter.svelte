<!-- Review Center – a queue of agent work waiting for a person: filter by risk, read the why and the diff with the agent's note, then Approve (A), Edit (E), Reject (R) or Skip (S). -->
<script lang="ts" module>
	export type Review = { id: number; title: string; kind: string; age: string; agent: string; model: string; risk?: 'high' | 'unsure'; why: string; files?: { path: string; add: number; del: number; lines?: { n: number; t: string; op?: '+' | '-' }[]; note?: string }[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		items = $bindable([
			{ id: 1, title: 'Merge #511 – retries for webhook delivery', kind: 'Code change', age: '28m', agent: 'Coder', model: 'Orbit Pro', risk: 'high', why: 'Deliveries time out under load – I added retries with backoff. Tests pass.', files: [{ path: 'src/webhooks/deliver.ts', add: 3, del: 2, note: 'Removed the null check – paused accounts have no endpoint, so this now throws for them.', lines: [{ n: 38, t: 'const endpoint = await getEndpoint(event.accountId);' }, { n: 39, t: 'if (!endpoint) return;', op: '-' }, { n: 39, t: '// endpoints exist for all active accounts', op: '+' }, { n: 40, t: 'await send(endpoint.url, event.payload);' }] }, { path: 'src/webhooks/deliver.test.ts', add: 14, del: 0 }, { path: 'src/queue/config.ts', add: 1, del: 1 }] },
			{ id: 2, title: 'Redline §7.2 Limitation of liability', kind: 'Contract clause', age: '18m', agent: 'Legal', model: 'Atlas Max', risk: 'unsure', why: 'The cap is 1× fees; your playbook says 2×. I proposed 2× with a carve-out.' },
			{ id: 3, title: 'Split customers.name into first/last', kind: 'Migration', age: '14m', agent: 'Data', model: 'Atlas Pro', risk: 'high', why: 'Needed for the new invoice template. Backfills 48k rows.' },
			{ id: 4, title: 'Rotate the payment API keys', kind: 'Plan', age: '11m', agent: 'Ops', model: 'Atlas Pro', why: 'Keys are 92 days old; policy is 90.' },
			{ id: 5, title: 'Refund order #4821 for $240', kind: 'Refund', age: '9m', agent: 'Support', model: 'Atlas Mini', risk: 'unsure', why: 'Package lost in transit, carrier confirmed.' },
			{ id: 6, title: 'Tag 14 tickets as Billing', kind: 'Triage', age: '6m', agent: 'Support', model: 'Atlas Mini', why: 'All mention invoices or charges.' },
			{ id: 7, title: 'Bump the payments SDK to 5.2', kind: 'Code change', age: '4m', agent: 'Coder', model: 'Orbit Pro', why: 'Security fix in 5.2.0.' },
			{ id: 8, title: 'Post release notes to #announcements', kind: 'Chat message', age: '2m', agent: 'Writer', model: 'Atlas Pro', risk: 'unsure', why: 'Drafted from the merged pull requests this week.' }
		] as Review[]),
		total = 32,
		ondecide
	}: { items?: Review[]; total?: number; ondecide?: (item: Review, decision: 'approve' | 'edit' | 'reject' | 'skip') => void } = $props();
	let filter = $state<'all' | 'high' | 'unsure'>('all');
	let sel = $state(1);
	let reviewed = $state(24);
	let noteOpen = $state(true);
	let last = $state<{ item: Review; at: number; label: string } | null>(null);
	const shown = $derived(items.filter((i) => filter === 'all' || i.risk === filter));
	const cur = $derived(shown.find((i) => i.id === sel) ?? shown[0]);
	function decide(d: 'approve' | 'edit' | 'reject' | 'skip') {
		if (!cur) return;
		ondecide?.(cur, d);
		const idx = shown.indexOf(cur);
		if (d === 'skip') return void (sel = shown[(idx + 1) % shown.length].id);
		if (d === 'edit') return;
		reviewed++;
		last = { item: cur, at: items.indexOf(cur), label: d === 'approve' ? 'Approved' : 'Rejected' };
		const rest = shown.filter((i) => i.id !== cur.id);
		items = items.filter((i) => i.id !== cur.id);
		sel = rest[Math.min(idx, rest.length - 1)]?.id ?? -1;
	}
	function undo() {
		if (!last) return;
		const next = [...items];
		next.splice(last.at, 0, last.item);
		items = next;
		sel = last.item.id;
		reviewed--;
		last = null;
	}
	onMount(() => play([[3400, () => decide('approve')], [3000, () => decide('skip')]], { still: 0 }));
	function keydown(e: KeyboardEvent) {
		if ((e.target as HTMLElement).matches('input,textarea')) return;
		const map: Record<string, 'approve' | 'edit' | 'reject' | 'skip'> = { a: 'approve', e: 'edit', r: 'reject', s: 'skip' };
		if (map[e.key]) decide(map[e.key]);
	}
</script>

<svelte:window onkeydown={keydown} />

<div class="ui-ag ui-ag-panel ui-rc">
	<div class="ui-ag-head"><span style:color="var(--ag-blue)">✓</span><b>Review center</b><span class="ui-ag-bar ui-rc__bar"><i style:width="{(reviewed / total) * 100}%"></i></span>{#if last}<small class="ui-ag-in" style:margin-left="auto">✓ {last.label} · <button class="ui-rc__undo" onclick={undo}>↶ Undo</button></small>{/if}<small><b>{reviewed}</b> of {total} reviewed · <span class="ui-ag-muted">oldest</span> <span style:color="var(--ag-amber)">{items[0]?.age ?? '–'}</span></small></div>
	<div class="ui-rc__cols">
		<aside>
			<div class="ui-ag-tabs" role="tablist">
				<button class="ui-ag-tab" role="tab" aria-selected={filter === 'all'} onclick={() => (filter = 'all')}>All <span class="ui-ag-muted">{items.length}</span></button>
				<button class="ui-ag-tab" role="tab" aria-selected={filter === 'high'} onclick={() => (filter = 'high')}>High risk <span class="ui-ag-muted">{items.filter((i) => i.risk === 'high').length}</span></button>
				<button class="ui-ag-tab" role="tab" aria-selected={filter === 'unsure'} onclick={() => (filter = 'unsure')}>Unsure <span class="ui-ag-muted">{items.filter((i) => i.risk === 'unsure').length}</span></button>
			</div>
			<div class="ui-rc__list" role="listbox" aria-label="Waiting for review">
				{#each shown as i (i.id)}
					<div role="option" tabindex="-1" aria-selected={cur?.id === i.id} class="ui-rc__item" onclick={() => (sel = i.id)} onkeydown={() => {}}>
						<span class="ui-ag-avatar">{i.agent[0]}</span><span class="ui-rc__t"><b>{i.title}</b><small>{i.kind}</small></span><small style:color={i.age.startsWith('2') && i.age.length === 3 ? 'var(--ag-amber)' : ''}>{i.age}</small>
					</div>
				{:else}<p class="ui-ag-muted ui-rc__empty">Nothing waiting 🎉</p>{/each}
			</div>
		</aside>
		{#if cur}
			{#key cur.id}
				<section class="ui-ag-in">
					<div class="ui-ag-row"><span class="ui-ag-avatar">{cur.agent[0]}</span><span><b>{cur.agent}</b> {#if cur.risk === 'high'}<span class="ui-ag-pill" data-tone="red">High risk</span>{:else if cur.risk === 'unsure'}<span class="ui-ag-pill" data-tone="amber">Unsure</span>{/if}<small>{cur.model}</small></span></div>
					<h4>{cur.title}</h4>
					<p><span class="ui-ag-muted">Why</span> {cur.why}</p>
					{#each cur.files ?? [] as f (f.path)}
						<div class="ui-rc__file">
							<div class="ui-ag-row"><span class="ui-ag-grow ui-ag-mono"><span class="ui-ag-muted">{f.path.slice(0, f.path.lastIndexOf('/') + 1)}</span>{f.path.slice(f.path.lastIndexOf('/') + 1)}</span><small style:color="var(--ag-green)">+{f.add}</small><small style:color="var(--ag-red)">−{f.del}</small></div>
							{#if f.lines}
								<div class="ui-rc__code ui-ag-mono">{#each f.lines as l, k (k)}<div data-op={l.op}><span>{l.op ?? ' '} {l.n}</span>{l.t}</div>{/each}</div>
								{#if f.note && noteOpen}<div class="ui-rc__note"><small style:color="var(--ag-amber)">⚠ AGENT'S NOTE</small><p>{f.note}</p><button class="ui-ag-btn" data-variant="ghost" onclick={() => (noteOpen = false)}>Got it</button></div>{/if}
							{/if}
						</div>
					{/each}
				</section>
			{/key}
		{/if}
	</div>
	<div class="ui-ag-foot">
		<button class="ui-ag-btn" data-variant="primary" disabled={!cur} onclick={() => decide('approve')}>✓ Approve <span class="ui-ag-kbd">A</span></button>
		<button class="ui-ag-btn" data-variant="ghost" disabled={!cur} onclick={() => decide('edit')}>✎ Edit <span class="ui-ag-kbd">E</span></button>
		<button class="ui-ag-btn" data-variant="ghost" disabled={!cur} onclick={() => decide('reject')}>× Reject <span class="ui-ag-kbd">R</span></button>
		<button class="ui-ag-btn" data-variant="ghost" disabled={!cur} onclick={() => decide('skip')}>› Skip <span class="ui-ag-kbd">S</span></button>
	</div>
</div>

<style>
	.ui-rc__undo {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		cursor: pointer;
		padding: 0;
	}
	.ui-rc {
		max-width: 560px;
		font-size: 11.5px;
	}
	.ui-rc b {
		font-weight: 500;
	}
	.ui-rc__bar {
		width: 56px;
	}
	.ui-rc__cols {
		display: grid;
		grid-template-columns: 190px 1fr;
		min-height: 340px;
	}
	aside {
		border-right: 1px solid var(--ag-line);
		padding: 8px 6px;
	}
	.ui-rc__list {
		margin-top: 6px;
		max-height: 330px;
		overflow-y: auto;
	}
	.ui-rc__item {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		gap: 7px;
		align-items: center;
		padding: 7px 6px;
		border-radius: 8px;
		cursor: pointer;
	}
	.ui-rc__item[aria-selected='true'] {
		background: var(--ag-fill);
	}
	.ui-rc__t {
		display: grid;
		min-width: 0;
	}
	.ui-rc__t b {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 400;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-ag-row small {
		display: block;
	}
	section {
		padding: 12px;
		display: grid;
		gap: 8px;
		align-content: start;
		min-width: 0;
	}
	h4 {
		margin: 4px 0 0;
		font-size: 13px;
		font-weight: 500;
	}
	p {
		margin: 0;
		line-height: 1.5;
	}
	.ui-rc__file {
		position: relative;
		border: 1px solid var(--ag-line);
		border-radius: 8px;
		padding: 7px 9px;
		display: grid;
		gap: 6px;
	}
	.ui-rc__code {
		font-size: 10.5px;
		overflow-x: auto;
	}
	.ui-rc__code div {
		white-space: pre;
		padding: 1px 0;
	}
	.ui-rc__code span {
		display: inline-block;
		width: 36px;
		color: var(--ag-subtle);
	}
	.ui-rc__code [data-op='-'] {
		background: color-mix(in srgb, var(--ag-red) 10%, transparent);
	}
	.ui-rc__code [data-op='+'] {
		background: color-mix(in srgb, var(--ag-green) 10%, transparent);
	}
	.ui-rc__note {
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 8px 20px -10px rgba(0, 0, 0, 0.25);
		border-radius: 9px;
		padding: 8px 10px;
		display: grid;
		gap: 4px;
		justify-items: start;
	}
	.ui-rc__empty {
		padding: 12px;
	}
</style>
