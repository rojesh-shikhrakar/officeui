<!-- Decision Card – an agent's question in its own card just above the chat composer: numbered options with one Recommended, visual choices, Approve / Decline for an action, "Something else", keys 1–5, paging and Later. The agent answers "– on it." and the next question slides in. -->
<script lang="ts" module>
	export type Option = { label: string; hint?: string; recommended?: boolean; preview?: 'illustration' | 'checklist' | 'sample' };
	export type DecisionQuestion = { task: string; question: string; kind?: 'options' | 'visual' | 'approval'; detail?: string; options: Option[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import ChatComposer from './ChatComposer.svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		intro = 'Three tasks wait on you – everything else keeps running.',
		questions = [
			{ task: 'Ingest pipeline', question: 'Which queue should the ingest service use?', options: [{ label: 'Kafka', hint: 'A durable log – a day of events to replay after a bad deploy', recommended: true }, { label: 'SQS', hint: 'Managed, nothing to run – but no replay' }, { label: 'Postgres queue', hint: "The database you already have – won't keep up with the bursts" }, { label: 'NATS JetStream', hint: 'Light, with replay – a smaller community' }] },
			{ task: 'Client dashboard', question: 'Which empty state for the dashboard?', kind: 'visual', options: [{ label: 'Illustration', preview: 'illustration' }, { label: 'Setup checklist', preview: 'checklist', recommended: true }, { label: 'Sample data', preview: 'sample' }] },
			{ task: 'Weekly update', question: 'Send the weekly update to Northwind?', kind: 'approval', detail: 'priya@northwind.com · 3 shipped items, 1 risk', options: [{ label: 'Approve' }, { label: 'Decline' }] }
		] as DecisionQuestion[],
		autoplay = true,
		onanswer
	}: { intro?: string; questions?: DecisionQuestion[]; autoplay?: boolean; onanswer?: (task: string, answer: string) => void } = $props();
	let i = $state(0);
	let answered = $state<Record<number, string>>({});
	let said = $state<string | null>(null);
	let other = $state('');
	let hot = $state(0);
	const q = $derived(questions[i]);
	const left = $derived(questions.filter((_, k) => !answered[k]).length);
	function answer(label: string) {
		if (answered[i]) return;
		answered[i] = label;
		onanswer?.(q.task, label);
		said = q.kind === 'approval' ? (label === 'Approve' ? 'Approved – on it.' : 'Declined – I won’t send it.') : `${label} – on it.`;
		other = '';
		hot = 0;
		const next = questions.findIndex((_, k) => !answered[k]);
		if (next >= 0) i = next;
	}
	function key(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (!left || t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') return;
		if (/^[1-9]$/.test(e.key) && q.options[+e.key - 1]) answer(q.options[+e.key - 1].label);
		else if (e.key === 'ArrowDown') (e.preventDefault(), (hot = Math.min(q.options.length - 1, hot + 1)));
		else if (e.key === 'ArrowUp') (e.preventDefault(), (hot = Math.max(0, hot - 1)));
	}
	onMount(() => play([[2600, () => answer('Kafka')], [2800, () => answer('Setup checklist')], [2800, () => answer('Approve')]], { autoplay, still: 0 }));
</script>

<svelte:window onkeydown={key} />

{#snippet preview(kind: Option['preview'])}
	<span class="ui-dcd__prev" data-kind={kind} aria-hidden="true">
		{#if kind === 'illustration'}<i class="ui-dcd__blob"></i><i class="ui-dcd__ln"></i>
		{:else if kind === 'checklist'}{#each [0, 1, 2] as k (k)}<span class="ui-dcd__ck"><i></i><i class="ui-dcd__ln"></i></span>{/each}
		{:else}<i class="ui-dcd__pill"></i><span class="ui-dcd__bars">{#each [5, 8, 6, 10, 7, 12] as h, k (k)}<i style:height="{h * 3}px"></i>{/each}</span>{/if}
	</span>
{/snippet}

<div class="ui-ag ui-dcd">
	{#key said}<p class="ui-dcd__say ui-ag-rise"><span style:color="#7c5cff">⁘</span> {said ?? intro}{#if !left && said} All answered – the agents carry on.{/if}</p>{/key}
	{#if left}
		{#key i}
			<div class="ui-ag-card ui-dcd__card ui-dcd__in">
				<div class="ui-ag-row ui-dcd__top"><span class="ui-ag-pill" data-tone="amber">Needs you</span><span class="ui-ag-muted ui-ag-grow">{q.task}</span><button class="ui-ag-btn" data-variant="ghost" aria-label="Previous decision" onclick={() => (i = (i - 1 + questions.length) % questions.length)}>‹</button><small class="ui-ag-muted">{questions.filter((_, k) => !answered[k]).indexOf(q) + 1} of {left}</small><button class="ui-ag-btn" data-variant="ghost" aria-label="Next decision" onclick={() => (i = (i + 1) % questions.length)}>›</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => (i = (i + 1) % questions.length)}>Later <span class="ui-ag-kbd">L</span></button></div>
				<b class="ui-dcd__q">{q.question}</b>
				{#if q.kind === 'approval'}
					<p class="ui-ag-muted ui-dcd__detail">{q.detail}</p>
					<div class="ui-ag-row"><span class="ui-ag-grow"></span><button class="ui-ag-btn" data-variant="ghost" onclick={() => answer('Decline')}>Decline <span class="ui-ag-kbd">2</span></button><button class="ui-ag-btn" data-variant="primary" onclick={() => answer('Approve')}>Approve <span class="ui-ag-kbd">1</span></button></div>
				{:else if q.kind === 'visual'}
					<div class="ui-dcd__grid" role="listbox" aria-label={q.question}>
						{#each q.options as o, k (o.label)}<button role="option" aria-selected={hot === k} class="ui-dcd__vis" onclick={() => answer(o.label)} onpointerenter={() => (hot = k)}>{@render preview(o.preview)}{#if o.recommended}<span class="ui-ag-pill ui-dcd__rec" data-tone="gray">Recommended</span>{/if}<span><span class="ui-ag-kbd">{k + 1}</span> {o.label}</span></button>{/each}
					</div>
				{:else}
					<div role="listbox" aria-label={q.question}>
						{#each q.options as o, k (o.label)}<button role="option" aria-selected={hot === k} class="ui-dcd__opt" onclick={() => answer(o.label)} onpointerenter={() => (hot = k)}><span class="ui-ag-kbd">{k + 1}</span><span class="ui-ag-grow"><b>{o.label}</b><small>{o.hint}</small></span>{#if o.recommended}<span class="ui-ag-pill" data-tone="gray">Recommended</span>{/if}</button>{/each}
					</div>
				{/if}
				{#if q.kind !== 'approval'}<form class="ui-dcd__other" onsubmit={(e) => (e.preventDefault(), other.trim() && answer(other.trim()))}><span class="ui-ag-kbd">{q.options.length + 1}</span><input placeholder="Something else…" aria-label="Something else: {q.question}" bind:value={other} />{#if other.trim()}<button class="ui-ag-btn" data-variant="primary">Send</button>{/if}</form>{/if}
			</div>
		{/key}
	{/if}
	<ChatComposer placeholder="Ask for anything…" placement="top" />
</div>

<style>
	.ui-dcd {
		width: 100%;
		max-width: 470px;
		display: grid;
		gap: 10px;
		font-size: 12px;
	}
	.ui-dcd__say {
		margin: 0;
		color: var(--ag-muted);
	}
	.ui-dcd__card {
		padding: 10px 12px;
		display: grid;
		gap: 8px;
	}
	.ui-dcd__in {
		animation: ui-dcd-clip 0.45s var(--ag-ease) both;
	}
	@keyframes ui-dcd-clip {
		from {
			clip-path: inset(0 0 100% 0 round 12px);
			opacity: 0;
		}
	}
	.ui-dcd__top small {
		white-space: nowrap;
	}
	.ui-dcd__q {
		font-weight: 500;
		font-size: 13px;
	}
	.ui-dcd__detail {
		margin: -4px 0 0;
	}
	.ui-dcd__opt {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 6px;
		border: 0;
		border-radius: 8px;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-dcd__opt[aria-selected='true'] {
		background: var(--ag-fill);
	}
	.ui-dcd__opt .ui-ag-grow {
		display: grid;
	}
	.ui-dcd__opt b {
		font-weight: 400;
	}
	.ui-dcd__opt small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-dcd__grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.ui-dcd__vis {
		position: relative;
		display: grid;
		gap: 6px;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-dcd__prev {
		height: 76px;
		border-radius: 8px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 6px;
		transition: box-shadow 0.15s;
	}
	.ui-dcd__vis[aria-selected='true'] .ui-dcd__prev {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 50%, transparent);
	}
	.ui-dcd__prev i {
		display: block;
		background: color-mix(in srgb, var(--ag-ink) 12%, transparent);
		border-radius: 3px;
	}
	.ui-dcd__blob {
		width: 24px;
		height: 20px;
		border-radius: 6px !important;
	}
	.ui-dcd__ln {
		width: 40px;
		height: 4px;
	}
	.ui-dcd__ck {
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.ui-dcd__ck i:first-child {
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}
	.ui-dcd__pill {
		width: 30px;
		height: 7px;
		border-radius: 4px !important;
	}
	.ui-dcd__bars {
		display: flex;
		align-items: end;
		gap: 3px;
	}
	.ui-dcd__bars i {
		width: 6px;
		background: color-mix(in srgb, var(--ag-ink) 15%, transparent);
	}
	.ui-dcd__rec {
		position: absolute;
		right: 4px;
		top: 4px;
	}
	.ui-dcd__other {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px 6px;
	}
	.ui-dcd__other input {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
</style>
