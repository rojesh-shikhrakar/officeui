<!-- AI Chat / Agents – chat with an orchestrating agent: it works for a while, names the agents at work, and asks you to fill in a brief (selling angle, audience, channels, palette) before it generates. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import ChatComposer from '../agents/ChatComposer.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { product = { name: 'Linen Overshirt', meta: '$89 · 412 sold this month' }, ongenerate }: { product?: { name: string; meta: string }; ongenerate?: (brief: Record<string, unknown>) => void } = $props();
	let active = $state('gen');
	let tab = $state('Brief');
	let angle = $state('Desire-driven');
	let audience = $state(['Women 25–34', 'Urban', 'Warm climates', 'Linen & natural fabrics']);
	let channels = $state({ Social: true, 'Short video': true, Feed: false });
	let palette = $state('Olive');
	let sent = $state(false);
	const nav = [{ items: CHAT_NAV[0].items }, CHAT_NAV[1], CHAT_NAV[2], { label: 'Chats', items: [{ id: 'gen', label: 'Generate on-brand creative' }, ...CHAT_NAV[3].items] }];
	const agents = ['Campaign manager', 'Brand research', 'Creative pipeline', 'Audience research', 'Creative direction'];
	const angles = [['Desire-driven', 'The first warm evening'], ['Problem–solution', 'Heat, itchy fabrics'], ['Social proof', '412 sold, top reviews']];
	const swatches = [['Sand', '#e8dcc0'], ['Olive', '#d6a51a'], ['Off-white', '#f3efe6'], ['Ink', '#1f1f1f']];
</script>

{#snippet brief()}
	<div class="ui-scr__tabs"><span class="ui-scr__tab">☰ Summer launch</span></div>
	<div class="ui-scr__panel">
		<div class="ui-ag-tabs" role="tablist">{#each ['Brief', 'Assets', 'Activity'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{t}</button>{/each}</div>
		<div class="ui-ag-card ui-ach__prod"><span class="ui-ach__thumb">👕</span><span class="ui-ag-grow"><b>{product.name}</b><small>{product.meta}</small></span><span class="ui-ag-pill" data-tone="green">Bestseller</span></div>
		<small class="ui-scr__k">Selling angle</small>
		<div class="ui-scr__rows" role="radiogroup" aria-label="Selling angle">{#each angles as [a, d] (a)}<label class="ui-scr__row"><input type="radio" name="angle" value={a} bind:group={angle} /><span><b>{a}</b><small>{d}</small></span></label>{/each}</div>
		<small class="ui-scr__k">Audience</small>
		<div class="ui-ach__chips">{#each audience as a (a)}<button class="ui-ag-chip" aria-label="Remove {a}" onclick={() => (audience = audience.filter((x) => x !== a))}>{a}</button>{/each}</div>
		<small class="ui-scr__k">Channels</small>
		<div class="ui-scr__rows">{#each Object.keys(channels) as c (c)}<label class="ui-scr__row"><span><b>{c}</b></span><input type="checkbox" role="switch" bind:checked={channels[c as keyof typeof channels]} /></label>{/each}</div>
		<small class="ui-scr__k">Palette</small>
		<div class="ui-ach__pal" role="radiogroup" aria-label="Palette">{#each swatches as [n, c] (n)}<button role="radio" aria-checked={palette === n} aria-label={n} onclick={() => (palette = n)}><i style:background={c}></i><small>{n}</small></button>{/each}</div>
		<div class="ui-ag-row"><small class="ui-ag-grow">{Object.values(channels).filter(Boolean).length * 3} ads · ~2 min</small><button class="ui-ag-btn" data-variant="primary" onclick={() => ((sent = true), ongenerate?.({ angle, audience, channels, palette }))}>{sent ? '✓ Generating' : 'Generate ads'}</button></div>
	</div>
{/snippet}

<AppShell {nav} bind:active aside={brief} asideWidth={250}>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">⌂ Home / <b>Generate on-brand creative</b></span></div>
	<div class="ui-scr__chat">
		<div class="ui-scr__msg">{angle}</div>
		<div class="ui-scr__ai">
			<p>I'll pull your bestseller first, then line up the creative generation.</p>
			<small>⁙ Worked for 3m 38s</small>
			<p>Your bestseller is the {product.name} (the only product synced so far – the store is still importing, so treat that ranking as provisional).</p>
			<p>Before I brief and generate the ads, I need one thing I can't infer, because it drives the whole copy structure: how should we sell this shirt?</p>
			<small>Agents working</small>
			<div class="ui-ach__chips">{#each agents as a, i (a)}<span class="ui-ag-chip" data-on={i === 0}>◌ {a}</span>{/each}</div>
			{#if sent}<p class="ui-ag-in"><b>On it.</b> Generating {Object.values(channels).filter(Boolean).length * 3} ads with the {angle.toLowerCase()} angle in the {palette.toLowerCase()} palette.</p>{/if}
		</div>
	</div>
	<div class="ui-scr__compose"><small>◉ Orchestrator · Routes each request</small><ChatComposer placeholder="Ask anything or @ to add context" placement="top" /></div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-ach__prod {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
	}
	.ui-ach__prod .ui-ag-grow small {
		display: block;
	}
	.ui-ach__thumb {
		width: 26px;
		height: 26px;
		border-radius: 6px;
		background: #fdf3dc;
		display: grid;
		place-items: center;
	}
	.ui-ach__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.ui-ach__pal {
		display: flex;
		gap: 12px;
	}
	.ui-ach__pal button {
		border: 0;
		background: none;
		display: grid;
		justify-items: center;
		gap: 3px;
		cursor: pointer;
		padding: 0;
	}
	.ui-ach__pal i {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px var(--ag-line);
	}
	.ui-ach__pal button[aria-checked='true'] i {
		box-shadow: 0 0 0 2px var(--ag-surface), 0 0 0 3.5px var(--ag-ink);
	}
</style>
