<!-- AI Chat / Double Sidebar – a plain assistant chat with web search in a double sidebar (an icon rail plus projects and chats), and the files it made open as tabs on the right. -->
<script lang="ts">
	import ChatComposer from '../agents/ChatComposer.svelte';
	import '../agents/agents.css';
	import './shell/screen.css';
	let { onsend }: { onsend?: (t: string) => void } = $props();
	let rail = $state('chat');
	let active = $state('fabric');
	let file = $state(0);
	let cell = $state('A2');
	const files = ['fabric-comparison.csv', 'sources.md'];
	const rows = [['Fabric', 'Weight (gsm)', 'Breathes', 'Creases'], ['Linen', '150–190', 'Best', 'A lot'], ['Linen-cotton 55/45', '160–180', 'Very well', 'Some'], ['Cotton poplin', '110–130', 'Well', 'Little'], ['Cotton seersucker', '140–160', 'Very well', 'Hardly']];
	const projects = [{ id: 'summer', label: 'Summer collection', items: [['fabric', 'Best fabric for a summer overshirt'], ['colour', 'Colour names for the linen line'], ['size', 'Size chart for relaxed fits']] }, { id: 'brand', label: 'Brand' }, { id: 'hiring', label: 'Hiring' }, { id: 'research', label: 'Research' }];
</script>

<div class="ui-ag ui-acr">
	<nav class="ui-acr__rail" aria-label="Apps">
		<span class="ui-acr__logo">F</span>
		{#each [['chat', '◎', 'Chats'], ['tasks', '☰', 'Tasks'], ['explore', '◔', 'Explore'], ['files', '▭', 'Files'], ['tools', '⚲', 'Tools']] as [id, ic, label] (id)}<button aria-label={label} aria-current={rail === id || undefined} onclick={() => (rail = id)}>{ic}</button>{/each}
		<span class="ui-ag-grow"></span><button aria-label="Notifications">◔</button><button aria-label="Settings">⚙</button><span class="ui-ag-avatar">AM</span>
	</nav>
	<aside class="ui-acr__list" aria-label="Projects and chats">
		<div class="ui-ag-row"><b class="ui-ag-grow">All projects ⌄</b><button class="ui-ag-btn" data-variant="ghost" aria-label="Search chats">⌕</button></div>
		<button class="ui-acr__it">✎ New chat</button>
		<small>Pinned</small><button class="ui-acr__it">Tone of voice, in five rules</button>
		<small>Projects</small>
		{#each projects as p (p.id)}<button class="ui-acr__it">▭ {p.label}</button>{#each p.items ?? [] as [id, t] (id)}<button class="ui-acr__it ui-acr__sub" aria-current={active === id || undefined} onclick={() => (active = id)}>{t}</button>{/each}{/each}
		<small>Chats</small><button class="ui-acr__it">Packing list for Lisbon</button><button class="ui-acr__it">Reply to the agency</button>
	</aside>
	<main>
		<div class="ui-scr__chat">
			<div class="ui-scr__msg">What's the best fabric for a summer overshirt – linen, cotton or a blend?</div>
			<div class="ui-scr__ai"><b>⁘ Assistant <small>10:22 AM</small></b><small>✓ Ran 3 tools · 3.1s</small><p>Linen breathes best – it pulls moisture off the skin and dries fast, which is why it feels cool on a hot day. The trade-off is creasing: a pure linen overshirt looks lived-in after an hour.</p><p>For an overshirt I'd take a linen-cotton blend around 55/45 at 160–180 gsm: it keeps most of the coolness, creases far less and is soft from the first wear.</p><span class="ui-ag-row">{#each files as f, i (f)}<button class="ui-ag-chip" onclick={() => (file = i)}>▤ {f}</button>{/each}</span></div>
			<div class="ui-scr__msg">Which weight for a shirt you can wear open over a T-shirt?</div>
			<div class="ui-scr__ai"><b>⁘ Assistant <small>10:26 AM</small></b><small>✓ Ran 1 tool · 1.2s</small><p>Go a little heavier than a shirt: 180–200 gsm. It hangs straight when it's open and doesn't cling to the T-shirt underneath.</p></div>
		</div>
		<div class="ui-scr__compose"><ChatComposer placeholder="Ask anything – it searches the web" {onsend} placement="top" /></div>
	</main>
	<section class="ui-acr__file" aria-label="Open files">
		<div class="ui-scr__tabs" role="tablist">{#each files as f, i (f)}<button class="ui-scr__tab" role="tab" aria-selected={file === i} onclick={() => (file = i)}>▤ {f}</button>{/each}</div>
		<div class="ui-scr__panel">
			<div class="ui-ag-row"><span class="ui-acr__ic">▦</span><span><b>{files[file]}</b><small>Just now</small></span></div>
			{#if file === 0}
				<div class="ui-ag-row ui-acr__fx"><span class="ui-ag-kbd">{cell}</span><span>fx</span><span>{rows[+cell.slice(1) - 1]?.[cell.charCodeAt(0) - 65] ?? ''}</span></div>
				<table><thead><tr><th></th>{#each ['A', 'B', 'C', 'D'] as c (c)}<th>{c}</th>{/each}</tr></thead><tbody>{#each Array(8) as _, r (r)}<tr><th>{r + 1}</th>{#each [0, 1, 2, 3] as c (c)}<td aria-selected={cell === `${String.fromCharCode(65 + c)}${r + 1}`} onclick={() => (cell = `${String.fromCharCode(65 + c)}${r + 1}`)}>{rows[r]?.[c] ?? ''}</td>{/each}</tr>{/each}</tbody></table>
			{:else}
				<p class="ui-ag-muted">1. Fabric weight guide – textile handbook<br />2. Linen care and creasing – mill notes<br />3. Seersucker for summer – fabric shop</p>
			{/if}
		</div>
	</section>
</div>

<style>
	.ui-acr {
		display: grid;
		grid-template-columns: 40px 170px 1fr 270px;
		width: 100%;
		max-width: 1100px;
		height: 600px;
		background: var(--ag-fill);
		border-radius: 10px;
		box-shadow: 0 0 0 1px var(--ag-line);
		overflow: hidden;
		font-size: 11px;
		padding: 6px 6px 6px 0;
		gap: 6px;
		box-sizing: border-box;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-subtle);
		font-size: 9.5px;
	}
	.ui-acr__rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding-top: 4px;
	}
	.ui-acr__rail button {
		width: 26px;
		height: 26px;
		border: 0;
		border-radius: 7px;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
	}
	.ui-acr__rail button[aria-current] {
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		color: var(--ag-ink);
	}
	.ui-acr__logo {
		width: 20px;
		height: 20px;
		border-radius: 5px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		display: grid;
		place-items: center;
		font-size: 10px;
		margin-bottom: 6px;
	}
	.ui-acr__list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 4px;
		overflow-y: auto;
	}
	.ui-acr__list small {
		margin: 10px 6px 2px;
	}
	.ui-acr__it {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		text-align: left;
		padding: 4px 6px;
		border-radius: 6px;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-acr__sub {
		padding-left: 18px;
		color: var(--ag-muted);
	}
	.ui-acr__it[aria-current] {
		background: color-mix(in srgb, var(--ag-ink) 6%, transparent);
		color: var(--ag-ink);
	}
	main,
	.ui-acr__file {
		background: var(--ag-surface);
		border-radius: 8px;
		box-shadow: var(--ag-shadow);
		overflow: auto;
		position: relative;
	}
	.ui-acr__ic {
		color: var(--ag-green);
	}
	.ui-acr__fx {
		color: var(--ag-muted);
	}
	table {
		border-collapse: collapse;
		font-size: 10px;
	}
	th {
		background: var(--ag-fill);
		color: var(--ag-subtle);
		font-weight: 400;
		padding: 3px 5px;
	}
	td {
		border: 1px solid var(--ag-line);
		padding: 4px 5px;
		white-space: nowrap;
		cursor: cell;
		min-width: 40px;
	}
	td[aria-selected='true'] {
		outline: 1.5px solid var(--ag-green);
		outline-offset: -1px;
	}
	tbody tr:first-child td {
		font-weight: 500;
	}
	p {
		line-height: 1.8;
	}
	.ui-scr__tab {
		border: 0;
		font: inherit;
		color: var(--ag-muted);
		background: none;
		cursor: pointer;
	}
	.ui-scr__tab[aria-selected='true'] {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
</style>
