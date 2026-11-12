<!-- AI Answer – a streamed answer with source cards, citation chips that preview their source, copy, regenerate, feedback and follow-ups. -->
<script lang="ts" module>
	export type Source = { app: string; title: string; color: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let {
		question = 'Where should we hold the team offsite in Lisbon?',
		sources = [
			{ app: 'Notes', title: 'Offsite plan – shortlist and budget', color: '#171717' },
			{ app: 'Chat', title: '#team-offsite – who can make which dates', color: '#e01e5a' },
			{ app: 'Wiki', title: 'Alfama – the oldest district of Lisbon', color: '#6b7280' }
		],
		lead = 'Alfama is the best fit for the 12-person offsite: walkable, quiet in the mornings and inside the budget you set',
		points = [
			['Dates', '14–16 May works for everyone, Jonas joins on day two', 1],
			['Stay', 'two linked houses in Alfama come to €2,880 for three nights, about 20% less than the hotel', 0],
			['Flights', 'direct flights from Berlin and Munich land before 10:30', 2]
		] as [string, string, number][],
		related = ['Compare the houses with the hotel', 'Draft a three-day agenda'],
		onfollowup
	}: { question?: string; sources?: Source[]; lead?: string; points?: [string, string, number][]; related?: string[]; onfollowup?: (q: string) => void } = $props();
	let n = $state(0); // characters revealed so far across the lead and all points
	let peek = $state<number | null>(null);
	let copied = $state(false);
	let vote = $state<'up' | 'down' | null>(null);
	let reason = $state<string | null>(null);
	let stopped = $state(false);
	const reasons = ['Not accurate', 'Wrong source', 'Too long', 'Out of date'];
	let timer: ReturnType<typeof setInterval>;
	const lens = $derived(points.map(([k, v]) => k.length + v.length));
	const total = $derived(lead.length + lens.reduce((a, b) => a + b, 0));
	const done = $derived(n >= total || stopped);
	// characters of point i that are visible (-1 = not started)
	const typed = (i: number) => n - lead.length - lens.slice(0, i).reduce((a, b) => a + b, 0);
	function stream() {
		clearInterval(timer);
		n = 0;
		stopped = false;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return void (n = total);
		timer = setInterval(() => ((n += 3), n >= total && clearInterval(timer)), 20);
	}
	onMount(() => (stream(), () => clearInterval(timer)));
</script>

{#snippet cite(i: number)}
	<button class="ui-aia__cite" onpointerenter={() => (peek = i)} onpointerleave={() => (peek = null)} onfocus={() => (peek = i)} onblur={() => (peek = null)}>
		{sources[i].app}{#if i === 0}<em>+1</em>{/if}
		{#if peek === i}<span class="ui-aia__peek ui-ag-in" role="tooltip"><b>{sources[i].app}</b>{sources[i].title}</span>{/if}
	</button>
{/snippet}

<div class="ui-ag ui-ag-panel ui-aia">
	<div class="ui-ag-body">
		<b class="ui-aia__q">{question}</b>
		<div class="ui-aia__sources">{#each sources as s, i (i)}<div class="ui-aia__src" style:animation-delay="{i * 90}ms"><small><i style:background={s.color}></i>{s.app}<em>{i + 1}</em></small>{s.title}</div>{/each}<div class="ui-aia__src ui-aia__more" style:animation-delay="{sources.length * 90}ms"><b>+3</b><small>more</small></div></div>
		<small class="ui-aia__label" class:ui-aia__writing={!done}>✦ {done ? 'Answer' : 'Writing'}</small>
		<p>{lead.slice(0, n)}{#if n >= lead.length} {@render cite(0)}.{/if}</p>
		<ul>{#each points as [k, v, s], i (k)}{@const t = typed(i)}{#if t > 0}<li><b>{k.slice(0, t)}{#if t >= k.length}:{/if}</b> {v.slice(0, Math.max(0, t - k.length))}{#if t >= lens[i]} {@render cite(s)}{/if}</li>{/if}{/each}</ul>
		{#if done}
			<small class="ui-aia__label">Related</small>
			{#each related as r (r)}<button class="ui-aia__rel" onclick={() => onfollowup?.(r)}>{r}<span>›</span></button>{/each}
		{/if}
	</div>
	{#if !done}
		<div class="ui-ag-foot ui-aia__foot"><button class="ui-ag-btn" onclick={() => ((stopped = true), clearInterval(timer))}>◼ Stop</button></div>
	{:else}
	<div class="ui-ag-foot ui-aia__foot">
		<button class="ui-ag-btn" data-variant="ghost" aria-label={copied ? 'Copied' : 'Copy answer'} onclick={() => (copied = true)}>{copied ? '✓' : '⧉'}</button>
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Regenerate" onclick={stream}>↻</button>
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Good answer" aria-pressed={vote === 'up'} onclick={() => (vote = vote === 'up' ? null : 'up')}>▲</button>
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Bad answer" aria-pressed={vote === 'down'} onclick={() => ((vote = vote === 'down' ? null : 'down'), (reason = null))}>▼</button>
		<small class="ui-ag-muted" style:margin-left="auto">{stopped ? 'Stopped' : 'Answered in 3.4s'}</small>
	</div>
	{#if vote === 'down'}<div class="ui-aia__why ui-ag-in">{#if reason}<small>Thanks – noted “{reason}”.</small>{:else}{#each reasons as r (r)}<button class="ui-ag-chip" onclick={() => (reason = r)}>{r}</button>{/each}{/if}</div>{/if}
	{/if}
</div>

<style>
	.ui-aia__src {
		animation: ui-ag-rise 0.4s var(--ag-ease) both;
	}
	.ui-aia__more {
		display: grid !important;
		place-content: center;
		text-align: center;
	}
	.ui-aia__writing {
		animation: ui-ag-breathe 1.4s ease-in-out infinite;
	}
	.ui-aia__cite em {
		font-style: normal;
		margin-left: 3px;
		opacity: 0.6;
	}
	.ui-aia__why {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		padding: 0 12px 10px;
	}
	.ui-aia {
		max-width: 400px;
		font-size: 12px;
		line-height: 1.5;
	}
	.ui-aia__q {
		font-weight: 500;
		font-size: 12.5px;
	}
	.ui-aia__sources {
		display: grid;
		grid-template-columns: repeat(3, 1fr) 44px;
		gap: 6px;
	}
	.ui-aia__src {
		background: var(--ag-fill);
		border-radius: 8px;
		padding: 6px 8px;
		font-size: 11px;
		font-weight: 500;
		line-height: 1.35;
	}
	.ui-aia__src small {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--ag-muted);
		font-weight: 400;
		font-size: 10px;
	}
	.ui-aia__src i {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
	.ui-aia__src em {
		margin-left: auto;
		font-style: normal;
	}
	.ui-aia__label {
		color: var(--ag-subtle);
		font-size: 10.5px;
	}
	p,
	ul {
		margin: 0;
	}
	ul {
		padding-left: 16px;
		display: grid;
		gap: 4px;
	}
	li b {
		font-weight: 600;
	}
	.ui-aia__cite {
		position: relative;
		border: 0;
		font: inherit;
		font-size: 10px;
		padding: 0 5px;
		border-radius: 4px;
		background: var(--ag-fill);
		color: var(--ag-muted);
		cursor: pointer;
	}
	.ui-aia__peek {
		position: absolute;
		left: 0;
		bottom: calc(100% + 4px);
		z-index: 5;
		width: 180px;
		padding: 7px 9px;
		text-align: left;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 8px 20px -8px rgba(0, 0, 0, 0.2);
		color: var(--ag-ink);
		font-size: 11px;
		line-height: 1.35;
	}
	.ui-aia__peek b {
		display: block;
		color: var(--ag-muted);
		font-weight: 500;
		font-size: 10px;
	}
	.ui-aia__rel {
		display: flex;
		justify-content: space-between;
		border: 0;
		border-top: 1px solid var(--ag-line);
		background: none;
		font: inherit;
		color: var(--ag-ink);
		padding: 6px 0;
		cursor: pointer;
		text-align: left;
	}
	.ui-aia__foot {
		justify-content: flex-start;
		gap: 0;
	}
	.ui-aia__foot .ui-ag-btn {
		padding: 0 7px;
	}
</style>
