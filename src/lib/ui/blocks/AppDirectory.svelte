<!-- App Directory – browse, search and connect integrations: categories with counts, a filter, app cards with Connect / Connected, and a "discover more" card. -->
<script lang="ts" module>
	export type App = { name: string; cat: string; blurb: string; color: string; letter?: string; connected?: boolean; essential?: boolean };
</script>

<script lang="ts">
	import '../agents/agents.css';
	const A = (name: string, cat: string, color: string, blurb: string, o: Partial<App> = {}): App => ({ name, cat, color, blurb, ...o });
	let {
		apps = $bindable([
			A('Chat', 'Communication', '#4a154b', 'Get alerts in your channels and act on them without leaving the conversation.', { connected: true, essential: true }),
			A('Notes', 'Docs', '#171717', 'Turn records into pages and keep project docs in sync both ways.', { essential: true }),
			A('Tracker', 'Product', '#5e6ad2', 'Create issues from customer feedback and track them to release.', { essential: true }),
			A('Canvas', 'Design', '#f24e1e', 'Preview designs inline and link frames to the work they belong to.', { essential: true }),
			A('Repo', 'Development', '#24292f', 'Link pull requests and see deploy status next to every task.', { essential: true }),
			A('Payments', 'Billing', '#635bff', 'Sync customers, invoices and subscriptions in real time.', { essential: true }),
			A('Flows', 'Automation', '#ff4a00', 'Connect thousands of apps with no-code workflows and triggers.', { essential: true }),
			A('CRM', 'CRM', '#ff7a59', 'Keep contacts, companies and deals matched across both tools.', { essential: true }),
			A('Metrics', 'Analytics', '#1f77b4', 'Send product events and read funnels next to your work.'),
			A('Calendar', 'Scheduling', '#0b8043', 'See meetings beside tasks and let agents find a free slot.'),
			A('Drive', 'Storage', '#0f9d58', 'Attach files from your drive and keep them in sync.'),
			A('Mail', 'Communication', '#ea4335', 'Draft replies and turn emails into tasks.')
		] as App[])
	}: { apps?: App[] } = $props();
	let cat = $state('Essentials');
	let q = $state('');
	let onlyConnected = $state(false);
	const cats = $derived(['Essentials', 'All apps', ...[...new Set(apps.map((a) => a.cat))].sort()]);
	const count = (c: string) => (c === 'Essentials' ? apps.filter((a) => a.essential).length : c === 'All apps' ? apps.length : apps.filter((a) => a.cat === c).length);
	const shown = $derived(apps.filter((a) => (cat === 'Essentials' ? a.essential : cat === 'All apps' || a.cat === cat) && (!onlyConnected || a.connected) && (a.name + a.blurb + a.cat).toLowerCase().includes(q.toLowerCase())));
	const toggle = (n: string) => (apps = apps.map((a) => (a.name === n ? { ...a, connected: !a.connected } : a)));
</script>

<div class="ui-ag ui-adir">
	<div class="ui-ag-row"><span class="ui-ag-grow"><h3>Integrations</h3><small>Connect the tools your team already works in. <a href="#learn" onclick={(e) => e.preventDefault()}>Learn more ↗</a></small></span><small>{apps.filter((a) => a.connected).length} connected</small></div>
	<div class="ui-ag-row"><input class="ui-ag-input ui-ag-grow" placeholder="⌕  Search apps" aria-label="Search apps" bind:value={q} /><button class="ui-ag-btn" aria-pressed={onlyConnected} onclick={() => (onlyConnected = !onlyConnected)}>☰ {onlyConnected ? 'Connected' : 'Filter'}</button></div>
	<div class="ui-adir__cols">
		<nav aria-label="Categories">{#each cats as c (c)}<button aria-current={cat === c || undefined} onclick={() => (cat = c)}><span>{c}</span><small>{count(c)}</small></button>{/each}</nav>
		<section>
			<b class="ui-adir__h">{cat} <small>{shown.length}</small></b>
			<div class="ui-adir__grid">
				{#each shown as a (a.name)}
					<article class="ui-ag-card">
						<div class="ui-ag-row"><i style:background={a.color}>{a.letter ?? a.name[0]}</i><span><b>{a.name} <span class="ui-adir__ok">✓</span></b><small>By {a.name}</small></span></div>
						<p>{a.blurb}</p>
						<button class="ui-ag-btn" data-variant={a.connected ? 'ghost' : undefined} class:ui-adir__on={a.connected} onclick={() => toggle(a.name)}>{a.connected ? '⛓ Connected' : 'Connect'}</button>
					</article>
				{/each}
				{#if cat === 'Essentials' && !q}
					<article class="ui-ag-card"><div class="ui-ag-row"><span class="ui-ag-grow"><b>Discover more</b><small>+{apps.length - count('Essentials')} apps</small></span></div><span class="ui-ag-grow"></span><button class="ui-ag-btn" onclick={() => (cat = 'All apps')}>View all ›</button></article>
				{/if}
			</div>
			{#if !shown.length}<p class="ui-ag-muted">No apps match “{q}”.</p>{/if}
		</section>
	</div>
</div>

<style>
	.ui-adir {
		width: 100%;
		max-width: 760px;
		display: grid;
		gap: 12px;
		font-size: 11.5px;
	}
	h3 {
		margin: 0;
		font-size: 17px;
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	a {
		color: var(--ag-blue);
		text-decoration: none;
	}
	.ui-adir__cols {
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 20px;
	}
	nav {
		display: grid;
		align-content: start;
		gap: 1px;
	}
	nav button {
		display: flex;
		justify-content: space-between;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		padding: 5px 7px;
		border-radius: 6px;
		cursor: pointer;
	}
	nav button[aria-current] {
		background: var(--ag-fill);
	}
	.ui-adir__h {
		display: block;
		font-weight: 500;
		margin-bottom: 8px;
	}
	.ui-adir__grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	article {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
		min-height: 110px;
	}
	article i {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-weight: 600;
		flex: none;
	}
	article b {
		display: block;
		font-weight: 500;
	}
	.ui-adir__ok {
		color: var(--ag-blue);
		font-size: 9px;
	}
	p {
		margin: 0;
		color: var(--ag-muted);
		line-height: 1.5;
		flex: 1;
	}
	.ui-adir__on {
		color: var(--ag-green);
		background: color-mix(in srgb, var(--ag-green) 10%, transparent);
	}
</style>
