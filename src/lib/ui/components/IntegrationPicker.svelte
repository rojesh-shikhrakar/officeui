<!-- Integration Picker – the integrations page of a command menu: search, a list of services and the picked one with its connection on two tiles. -->
<script lang="ts" module>
	export type Service = { id: string; name: string; kind: string; color: string; connected?: boolean; blurb?: string; features?: string[] };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		product = 'OfficeUI',
		services = $bindable([
			{ id: 'tracker', name: 'Tracker', kind: 'Project management', color: '#5e6ad2', connected: true, blurb: 'Turn requests from chat into issues and keep their status in sync both ways.', features: ['Create issues from any message', 'Two-way status sync', 'Link issues to customers'] },
			{ id: 'notes', name: 'Notes', kind: 'Docs & wiki', color: '#171717', connected: true },
			{ id: 'pay', name: 'Payments', kind: 'Payments', color: '#635bff', connected: true },
			{ id: 'canvas', name: 'Canvas', kind: 'Design', color: '#f24e1e' },
			{ id: 'crm', name: 'CRM', kind: 'CRM', color: '#ff7a59' },
			{ id: 'store', name: 'Store', kind: 'Commerce', color: '#7ab55c' },
			{ id: 'tables', name: 'Tables', kind: 'Databases', color: '#18bfff' }
		])
	}: { product?: string; services?: Service[] } = $props();
	let query = $state('');
	let active = $state(0);
	const shown = $derived(services.filter((s) => (s.name + s.kind).toLowerCase().includes(query.toLowerCase())));
	const pick = $derived(shown[Math.min(active, shown.length - 1)]);
	const toggle = (s: Service) => (services = services.map((x) => (x.id === s.id ? { ...x, connected: !x.connected } : x)));
	function keydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') (e.preventDefault(), (active = Math.min(shown.length - 1, active + 1)));
		else if (e.key === 'ArrowUp') (e.preventDefault(), (active = Math.max(0, active - 1)));
		else if (e.key === 'Enter' && pick) toggle(pick);
	}
</script>

<div class="ui-ag ui-ag-panel ui-ipk">
	<div class="ui-ag-head"><span class="ui-ag-pill" data-tone="gray">Integrations</span><input class="ui-ipk__q" bind:value={query} placeholder="Search integrations" aria-label="Search integrations" oninput={() => (active = 0)} onkeydown={keydown} /><span class="ui-ag-kbd">⌘/</span></div>
	<div class="ui-ipk__cols">
		<div class="ui-ipk__list" role="listbox" aria-label="Services">
			{#each [['Connected', true], ['Available', false]] as [label, on] (label)}
				{#if shown.some((s) => !!s.connected === on)}<small class="ui-ipk__g">{label}</small>{/if}
				{#each shown.filter((s) => !!s.connected === on) as s (s.id)}
					<div class="ui-ipk__item" role="option" tabindex="-1" aria-selected={pick?.id === s.id} onclick={() => (active = shown.indexOf(s))} onkeydown={() => {}}><i style:background={s.color}>{s.name[0]}</i><span><b>{s.name}</b><small>{s.kind}</small></span></div>
				{/each}
			{/each}
		</div>
		{#if pick}
			{#key pick.id}
				<div class="ui-ipk__detail ui-ag-in">
					<div class="ui-ipk__hero"><i style:background="#171717">◧</i><span>⇄</span><i style:background={pick.color}>{pick.name[0]}</i></div>
					<div class="ui-ag-row"><span class="ui-ag-grow"><b>{product} + {pick.name}</b><small>{pick.name.toLowerCase()}.app {#if pick.connected}<span class="ui-ag-pill" data-tone="green">Connected</span>{/if}</small></span><input type="checkbox" role="switch" aria-label="Connect {pick.name}" checked={!!pick.connected} onchange={() => toggle(pick)} /></div>
					<p class="ui-ag-muted">{pick.blurb ?? `Bring your ${pick.kind.toLowerCase()} into ${product} and let agents read and update it.`}</p>
					{#each pick.features ?? ['Read data in chat', 'Let agents make changes', 'Get notified about updates'] as f (f)}<span class="ui-ipk__f">✓ {f}</span>{/each}
				</div>
			{/key}
		{/if}
	</div>
	<div class="ui-ag-foot" style:justify-content="space-between"><small class="ui-ag-muted"><span style:color="var(--ag-green)">●</span> {services.filter((s) => s.connected).length} of {services.length} connected</small><small class="ui-ag-muted"><span class="ui-ag-kbd">↑</span><span class="ui-ag-kbd">↓</span> to move <span class="ui-ag-kbd">↵</span> to switch</small></div>
</div>

<style>
	.ui-ipk {
		max-width: 520px;
		font-size: 12px;
	}
	.ui-ipk__q {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-ipk__cols {
		display: grid;
		grid-template-columns: 200px 1fr;
		min-height: 260px;
	}
	.ui-ipk__list {
		border-right: 1px solid var(--ag-line);
		padding: 4px;
		max-height: 280px;
		overflow-y: auto;
	}
	.ui-ipk__g {
		display: block;
		padding: 8px 8px 3px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-ipk__item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 7px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-ipk__item[aria-selected='true'] {
		background: var(--ag-fill);
	}
	i {
		width: 22px;
		height: 22px;
		border-radius: 6px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 11px;
		font-weight: 600;
		flex: none;
	}
	.ui-ipk__item b,
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ipk__item small,
	.ui-ag-grow small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-ipk__detail {
		padding: 8px 12px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-ipk__hero {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 80px;
		border-radius: 10px;
		background: radial-gradient(circle, transparent 30px, var(--ag-line) 31px, transparent 32px), var(--ag-fill);
		color: var(--ag-blue);
	}
	.ui-ipk__hero i {
		width: 34px;
		height: 34px;
		border-radius: 9px;
		font-size: 16px;
	}
	p {
		margin: 0;
		font-size: 11.5px;
	}
	.ui-ipk__f {
		font-size: 11.5px;
	}
</style>
