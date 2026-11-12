<!-- Agent Cursors – agents working in a document like teammates in a multiplayer editor: live pointers with names, suggestions typed letter by letter, an image they resize, code they fix and a comment beside the page. -->
<script lang="ts" module>
	export type Agent = { name: string; mark: string; color: string; ring: string };
	type Sugg = { del: string; add: string; typed: number; accepted?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		path = 'Product / Launches',
		title = 'Pulse 2.0 – launch',
		agents = [
			{ name: 'Researcher', mark: '✳', color: '#d97757', ring: '#fde2d6' },
			{ name: 'Designer', mark: '✦', color: '#3b82f6', ring: '#dbeafe' },
			{ name: 'Coder', mark: 'M', color: '#f59e0b', ring: '#fef3c7' },
			{ name: 'Writer', mark: '◎', color: '#525252', ring: '#e5e5e5' }
		] as Agent[],
		autoplay = true,
		onaccept
	}: { path?: string; title?: string; agents?: Agent[]; autoplay?: boolean; onaccept?: () => void } = $props();
	let view = $state<'Doc' | 'Table'>('Doc');
	let s = $state<Record<string, Sugg>>({ title: { del: 'brief', add: 'plan', typed: 0 }, num: { del: 'about 40%', add: '38%', typed: 0 }, date: { del: 'second week of November', add: 'Nov 10', typed: 0 } });
	let cur = $state<Record<string, { x: number; y: number; task: string; cost: number }>>({
		Researcher: { x: 16, y: 21, task: 'Checking the numbers', cost: 0.11 },
		Designer: { x: 26, y: 40, task: 'Waiting for the render', cost: 0.06 },
		Coder: { x: 17, y: 68, task: 'Reading the config', cost: 0.12 },
		Writer: { x: 36, y: 9, task: 'Reading the brief', cost: 0.11 }
	});
	let img = $state(100);
	let resizing = $state(false);
	let comment = $state<'none' | 'shown' | 'open' | 'resolved'>('none');
	let reply = $state('');
	let replies = $state<string[]>([]);
	let follow = $state<string | null>(null);
	const pending = $derived(Object.values(s).filter((x) => x.typed >= x.add.length && !x.accepted).length);
	const typing = $derived(Object.entries(s).find(([, x]) => x.typed > 0 && x.typed < x.add.length)?.[0]);
	const cost = $derived(Object.values(cur).reduce((a, c) => a + c.cost, 0));
	const set = (n: string, p: Partial<(typeof cur)[string]>) => (cur[n] = { ...cur[n], ...p });
	const type = (k: string, n: number) => Array.from({ length: n }, (_, i) => [110, () => (s[k].typed = i + 1)] as [number, () => void]);
	function acceptAll() {
		for (const k in s) if (s[k].typed >= s[k].add.length) s[k].accepted = true;
		onaccept?.();
	}
	onMount(() =>
		play(
			[
				[900, () => set('Researcher', { task: 'Fixing the number', x: 22, y: 21 })],
				...type('num', 3),
				[300, () => set('Researcher', { cost: 0.19 })],
				[400, () => set('Writer', { task: 'Renaming', x: 43, y: 8 })],
				...type('title', 4),
				[300, () => set('Writer', { cost: 0.18 })],
				[400, () => set('Coder', { task: 'Fixing the date', x: 37, y: 66 })],
				...type('date', 6),
				[300, () => set('Coder', { cost: 0.21 })],
				[400, () => ((resizing = true), set('Designer', { task: 'Resizing the hero', x: 34, y: 44 }))],
				[500, () => (img = 88)],
				[500, () => (img = 80)],
				[500, () => ((resizing = false), set('Designer', { task: 'Looks right', cost: 0.22 }))],
				[600, () => (comment = 'shown')]
			],
			{ autoplay }
		)
	);
	const date = $derived(s.date);
</script>

{#snippet sugg(k: string)}
	{@const x = s[k]}
	{#if x.accepted}<span class="ui-acu__ok">{x.add}</span>{:else if x.typed}<button class="ui-acu__sg" title="Accept this suggestion" onclick={() => x.typed >= x.add.length && (s[k].accepted = true)}><del>{x.del}</del><ins>{x.add.slice(0, x.typed)}{#if typing === k}<i class="ui-acu__caret"></i>{/if}</ins></button>{:else}{x.del}{/if}
{/snippet}

<div class="ui-ag ui-acu">
	<div class="ui-ag-tabs ui-acu__tabs" role="tablist">{#each ['Doc', 'Table'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={view === t} onclick={() => (view = t as 'Doc' | 'Table')}>{t}</button>{/each}</div>
	<div class="ui-ag-card ui-acu__card">
		<div class="ui-acu__head">
			<span class="ui-ag-muted">▤ {path}</span>
			<span class="ui-ag-grow"></span>
			<span class="ui-acu__faces">{#each agents as a (a.name)}<button class="ui-acu__face" style:--r={a.ring} style:color={a.color} aria-label="Follow {a.name} – {cur[a.name].task}" aria-pressed={follow === a.name} onclick={() => (follow = follow === a.name ? null : a.name)}>{a.mark}</button>{/each}</span>
			<small class="ui-ag-muted">{pending ? `${pending} suggestion${pending > 1 ? 's' : ''}` : `${agents.length} here`}</small>
			<b class="ui-acu__cost">${cost.toFixed(2)}</b>
			<button class="ui-ag-btn" data-variant="primary" disabled={!pending} onclick={acceptAll}>Accept all</button>
		</div>
		{#if view === 'Doc'}
			<div class="ui-acu__doc ui-ag-in">
				<h3>{title} {@render sugg('title')}</h3>
				<p>Teams lose {@render sugg('num')} of their week to status updates. Pulse turns that work into a short daily brief, so nobody has to write one.</p>
				<div class="ui-acu__media">
					<div class="ui-acu__img" data-resizing={resizing || undefined} style:width="{img}%"><i></i><i></i><i></i><i></i>{#if resizing}<span class="ui-acu__size">{Math.round(612 * (img / 100))} × 176</span>{/if}</div>
					<p>The hero is the brief itself: one calm screen a team lead reads on Monday morning. Short, current and written from the work, so the week starts without a status meeting.</p>
				</div>
				<h4>{#if comment === 'shown' || comment === 'open'}<button class="ui-acu__cm ui-acu__pop" aria-label="Comment from Coder: Should waitlist and everyone share one date format?" aria-expanded={comment === 'open'} onclick={() => (comment = comment === 'open' ? 'shown' : 'open')}>M</button>{/if}Rollout</h4>
				{#if comment === 'open'}
					<div class="ui-ag-card ui-acu__thread ui-ag-in">
						<div class="ui-ag-row"><b style:color="#f59e0b">M</b><b class="ui-ag-grow">Coder</b><small class="ui-ag-muted">now</small></div>
						<p>Should waitlist and everyone share one date format? I'd use "Nov 3" and "Nov 10".</p>
						{#each replies as r, i (i)}<p class="ui-acu__reply"><b>You</b> {r}</p>{/each}
						<div class="ui-ag-row"><input class="ui-ag-input ui-ag-grow" placeholder="Reply" aria-label="Reply to Coder" bind:value={reply} onkeydown={(e) => e.key === 'Enter' && reply.trim() && ((replies = [...replies, reply.trim()]), (reply = ''))} /><button class="ui-ag-btn" onclick={() => (comment = 'resolved')}>✓ Resolve</button></div>
					</div>
				{/if}
				<pre class="ui-ag-mono">const rollout = &#123;
  waitlist: "Nov 3",
  everyone: "{#if date.accepted}{date.add}{:else if date.typed}<del>{date.del}</del><ins>{date.add.slice(0, date.typed)}</ins>{:else}{date.del}{/if}",
&#125;;</pre>
				<p class="ui-ag-muted">Launch week: one short post, a demo video and an email to the waitlist.</p>
				<h4 class="ui-acu__fade">What ships</h4>
				<ul class="ui-acu__fade"><li>Daily briefs for every project, written from the work itself</li><li>Nudges when a task has been quiet for too long</li></ul>
				{#each agents as a (a.name)}
					{@const c = cur[a.name]}
					<span class="ui-acu__cursor" data-follow={follow === a.name || undefined} style:left="{c.x}%" style:top="{c.y}%" style:--c={a.color}>
						<svg width="13" height="15" viewBox="0 0 13 15" aria-hidden="true"><path d="M1 1l11 6-5 1.4L4.6 14Z" fill="#1c1c1e" stroke="#fff" stroke-width="1" /></svg>
						<span class="ui-acu__tag"><span class="ui-ag-row"><b>{a.name}</b><em>${c.cost.toFixed(2)}</em></span><small class:ui-acu__think={c.task.endsWith('ing the brief') || c.task.startsWith('Waiting') || c.task.startsWith('Checking') || c.task.startsWith('Reading')}>{c.task}</small></span>
					</span>
				{/each}
			</div>
		{:else}
			<table class="ui-acu__table ui-ag-in"><thead><tr><th>Milestone</th><th>Date</th><th>Owner</th></tr></thead><tbody><tr><td>Waitlist</td><td>Nov 3</td><td>Writer</td></tr><tr><td>Everyone</td><td>{date.typed >= date.add.length ? date.add : date.del}</td><td>Coder</td></tr><tr><td>Demo video</td><td>Nov 7</td><td>Designer</td></tr></tbody></table>
		{/if}
	</div>
</div>

<style>
	.ui-acu {
		width: 100%;
		max-width: 600px;
		display: grid;
		gap: 6px;
		font-size: 12.5px;
	}
	.ui-acu__tabs {
		justify-self: start;
	}
	.ui-acu__card {
		overflow: hidden;
	}
	.ui-acu__head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px 8px 14px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-acu__faces {
		display: flex;
		gap: 3px;
	}
	.ui-acu__face {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 0;
		background: var(--ag-surface);
		box-shadow: 0 0 0 1.5px var(--r);
		font-size: 10px;
		font-weight: 700;
		cursor: pointer;
		padding: 0;
	}
	.ui-acu__face[aria-pressed='true'] {
		box-shadow: 0 0 0 2px currentColor;
	}
	.ui-acu__cost {
		font-weight: 500;
	}
	.ui-acu__doc {
		position: relative;
		padding: 18px 40px 14px;
		max-height: 380px;
		overflow: hidden;
	}
	h3 {
		margin: 0 0 10px;
		font-size: 19px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	h4 {
		position: relative;
		margin: 14px 0 6px;
		font-size: 13px;
		font-weight: 500;
	}
	p {
		margin: 0 0 10px;
		line-height: 1.6;
	}
	.ui-acu__media {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: 18px;
		align-items: start;
	}
	.ui-acu__img {
		position: relative;
		height: 80px;
		border-radius: 6px;
		background: var(--ag-fill);
		transition: width 0.45s var(--ag-ease);
	}
	.ui-acu__img[data-resizing] {
		outline: 1px solid var(--ag-subtle);
	}
	.ui-acu__img i {
		display: none;
		position: absolute;
		width: 6px;
		height: 6px;
		background: var(--ag-surface);
		border: 1px solid var(--ag-muted);
	}
	.ui-acu__img[data-resizing] i {
		display: block;
	}
	.ui-acu__img i:nth-child(1) {
		left: -3px;
		top: -3px;
	}
	.ui-acu__img i:nth-child(2) {
		right: -3px;
		top: -3px;
	}
	.ui-acu__img i:nth-child(3) {
		left: -3px;
		bottom: -3px;
	}
	.ui-acu__img i:nth-child(4) {
		right: -3px;
		bottom: -3px;
	}
	.ui-acu__size {
		position: absolute;
		left: 50%;
		bottom: 8px;
		transform: translateX(-50%);
		padding: 1px 5px;
		border-radius: 4px;
		background: #525252;
		color: #fff;
		font-size: 10px;
	}
	pre {
		margin: 0 0 10px;
		padding: 10px 14px;
		border-radius: 8px;
		background: var(--ag-fill);
		font-size: 11.5px;
		line-height: 1.6;
	}
	del {
		color: var(--ag-subtle);
	}
	ins {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.ui-acu__sg {
		all: unset;
		cursor: pointer;
		background: color-mix(in srgb, var(--ag-ink) 5%, transparent);
		border-radius: 3px;
	}
	.ui-acu__ok {
		animation: ui-ag-rise 0.3s var(--ag-ease);
	}
	.ui-acu__caret {
		display: inline-block;
		width: 1.5px;
		height: 1em;
		margin-left: 1px;
		vertical-align: -2px;
		background: var(--ag-ink);
		animation: ui-ag-breathe 0.9s steps(2) infinite;
	}
	.ui-acu__cm {
		position: absolute;
		left: -28px;
		top: -4px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 0;
		background: #1c1c1e;
		color: #f59e0b;
		font-weight: 700;
		font-size: 10px;
		cursor: pointer;
	}
	.ui-acu__pop {
		animation: ui-ag-pop 0.4s var(--ag-ease) both;
	}
	.ui-acu__thread {
		position: absolute;
		left: 26px;
		z-index: 3;
		width: 240px;
		padding: 10px;
		display: grid;
		gap: 6px;
		box-shadow:
			var(--ag-shadow),
			0 12px 28px -10px rgba(0, 0, 0, 0.3);
	}
	.ui-acu__thread p {
		margin: 0;
		font-size: 12px;
	}
	.ui-acu__reply {
		color: var(--ag-muted);
	}
	.ui-acu__fade {
		opacity: 0.35;
	}
	ul {
		margin: 0;
		padding-left: 18px;
		line-height: 1.8;
	}
	.ui-acu__cursor {
		position: absolute;
		z-index: 2;
		pointer-events: none;
		display: flex;
		align-items: flex-start;
		gap: 0;
		transition:
			left 0.9s var(--ag-ease),
			top 0.9s var(--ag-ease);
	}
	.ui-acu__tag {
		margin: 12px 0 0 2px;
		padding: 4px 7px 5px;
		border-radius: 6px;
		background: #1c1c1e;
		color: #fff;
		display: grid;
		gap: 1px;
		font-size: 10.5px;
		white-space: nowrap;
		box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--c) 70%, transparent);
	}
	.ui-acu__cursor[data-follow] .ui-acu__tag {
		box-shadow: 0 0 0 2px var(--c);
	}
	.ui-acu__tag b {
		font-weight: 500;
	}
	.ui-acu__tag em {
		font-style: normal;
		font-size: 9.5px;
		padding: 0 4px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.16);
	}
	.ui-acu__tag small {
		color: rgba(255, 255, 255, 0.7);
		font-size: 10px;
	}
	.ui-acu__think {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 30%, #fff 50%, rgba(255, 255, 255, 0.5) 70%) 0 0 / 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent !important;
		animation: ui-ag-sheen 2s linear infinite;
	}
	.ui-acu__table {
		width: 100%;
		border-collapse: collapse;
		margin: 10px 0;
	}
	.ui-acu__table th,
	.ui-acu__table td {
		text-align: left;
		padding: 8px 14px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-acu__table th {
		font-weight: 400;
		color: var(--ag-muted);
	}
</style>
