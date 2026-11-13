<!-- Cited Answer – an AI answer wired to its sources: point at a citation to light up its sentence and source, click to unfold the quoted passage. -->
<script lang="ts" module>
	export type CitedSource = { name: string; title: string; quote: string; site?: string; date?: string; match?: string[] };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import '../agents/agents.css';
	let {
		sources = [
			{ name: 'Tokenwise', site: 'tokenwise.dev', date: 'Jul 14, 2026', title: 'Prompt caching, explained: what gets cached', quote: 'A cached prefix skips recomputation entirely, so time to first token drops by up to 80% on long prompts.', match: ['time to first token', 'up to 80%'] },
			{ name: 'Latency Notes', site: 'latencynotes.io', date: 'Aug 2, 2026', title: 'Designing cache-friendly prompts', quote: 'Keep the stable part – system prompt, tool definitions, long documents – at the very start, and put anything that changes per request after it. A single changed character early on invalidates everything behind it.', match: ['at the very start', 'anything that changes per request after it', 'invalidates'] },
			{ name: 'Inference Weekly', site: 'inferenceweekly.com', date: 'Jun 30, 2026', title: 'Semantic caching for LLM apps in production', quote: 'Close matches returned a stored answer in roughly 40 ms, which covered about a third of FAQ-style traffic.', match: ['40 ms', 'a third of FAQ-style traffic'] }
		],
		sentences = [
			['The biggest win is prompt caching: the provider reuses the processed start of your prompt, so a long system prompt isn’t recomputed on every call.', 0],
			['On prompts over 10K tokens that can cut time to first token by up to 80%.', 0],
			['For repeated questions, add a semantic cache in front of the model: close matches get a stored answer in about 40 ms, which covered nearly a third of FAQ-style traffic in one production setup.', 1],
			['Stream the rest, so people see the first words while the answer is still being written.', 2]
		] as [string, number][],
		onfollowup
	}: { sources?: CitedSource[]; sentences?: [string, number][]; onfollowup?: () => void } = $props();
	let lit = $state<number | null>(null);
	let open = $state<number | null>(null);
	let copied = $state(false);
	// The quoted passage with its matching words marked
	const marked = (q: CitedSource) => {
		let parts: { t: string; m: boolean }[] = [{ t: q.quote, m: false }];
		for (const w of q.match ?? []) parts = parts.flatMap((p) => (p.m || !p.t.includes(w) ? [p] : p.t.split(w).flatMap((x, k, arr) => (k < arr.length - 1 ? [{ t: x, m: false }, { t: w, m: true }] : [{ t: x, m: false }]))));
		return parts;
	};
	onMount(() => play([[1600, () => (lit = 1)], [1400, () => (open = 1)], [4200, () => ((open = null), (lit = null))]], { still: 0 }));
	const src = $derived(open ?? lit ?? 0);
</script>

<div class="ui-ag ui-ag-panel ui-cta">
	<div class="ui-ag-body">
		<small class="ui-ag-muted ui-cta__head"><span class="ui-cta__favs">{#each sources as s (s.name)}<i>{s.name[0]}</i>{/each}</span>{sources.length} sources · 12 pages read</small>
		<p>
			{#each sentences as [s, ci], i (i)}
				<span class="ui-cta__s" data-lit={lit === ci || open === ci || undefined}>{s}</span>
				<button class="ui-cta__n" aria-expanded={open === ci} onpointerenter={() => (lit = ci)} onpointerleave={() => (lit = null)} onclick={() => (open = open === ci ? null : ci)}>{ci + 1}</button>{' '}
			{/each}
		</p>
		{#if open !== null}
			{@const q = sources[open]}
			<div class="ui-cta__quote ui-ag-in">
				<div class="ui-ag-row"><i class="ui-cta__fav">{q.name[0]}</i><small class="ui-ag-grow">{q.site} · {q.date}</small><span class="ui-ag-pill" data-tone="gray">{open + 1}</span><button class="ui-ag-btn" data-variant="ghost" aria-label="Close quote" onclick={() => (open = null)}>×</button></div>
				<b>{q.title}</b>
				<p class="ui-cta__pass">{#each marked(q) as part, k (k)}{#if part.m}<mark>{part.t}</mark>{:else}{part.t}{/if}{/each}</p>
				<div class="ui-ag-row"><button class="ui-ag-btn" data-variant="ghost">↗ Open source</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => (navigator.clipboard?.writeText(q.quote).catch(() => {}), (copied = true), setTimeout(() => (copied = false), 1200))}>{copied ? '✓ Copied' : '⧉ Copy quote'}</button></div>
			</div>
		{/if}
		<div class="ui-cta__chips">{#each sources as s, i (s.name)}<button class="ui-ag-chip" aria-pressed={lit === i || open === i} onpointerenter={() => (lit = i)} onpointerleave={() => (lit = null)} onclick={() => (open = open === i ? null : i)}>{s.name} <em>{i + 1}</em></button>{/each}</div>
	</div>
	<div class="ui-ag-foot"><span class="ui-ag-grow ui-ag-muted">{#if open !== null}Quote from <b>{sources[open].name}</b>{:else}<b>{sources[src].name}</b> · {lit !== null ? `cited in ${sentences.filter(([, c]) => c === lit).length} sentence${sentences.filter(([, c]) => c === lit).length > 1 ? 's' : ''}` : sources[src].title}{/if}</span><button class="ui-ag-btn" onclick={onfollowup}>Follow up →</button></div>
</div>

<style>
	.ui-cta__head {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-cta__favs {
		display: flex;
	}
	.ui-cta__favs i,
	.ui-cta__fav {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		margin-right: -3px;
		background: var(--ag-surface);
		box-shadow: 0 0 0 1px var(--ag-line);
		font-style: normal;
		font-size: 8px;
		display: grid;
		place-items: center;
		color: var(--ag-ink);
	}
	.ui-cta__quote {
		display: grid;
		gap: 6px;
		padding: 10px;
		border-radius: 10px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		margin-bottom: 8px;
	}
	.ui-cta__pass {
		margin: 0;
		padding-left: 8px;
		border-left: 2px solid var(--ag-line);
		color: var(--ag-muted);
		line-height: 1.55;
	}
	.ui-cta__pass mark {
		background: color-mix(in srgb, var(--ag-blue) 14%, transparent);
		color: var(--ag-ink);
		border-radius: 2px;
	}
	.ui-cta {
		max-width: 360px;
		font-size: 11.5px;
		line-height: 1.6;
	}
	p {
		margin: 0;
	}
	.ui-cta__s {
		border-radius: 3px;
		transition: background-color 0.2s;
	}
	.ui-cta__s[data-lit] {
		background: color-mix(in srgb, var(--ag-blue) 14%, transparent);
	}
	.ui-cta__n {
		border: 0;
		font: inherit;
		font-size: 9.5px;
		padding: 0 4px;
		border-radius: 3px;
		background: var(--ag-fill);
		color: var(--ag-muted);
		cursor: pointer;
	}
	.ui-cta__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.ui-cta__chips em {
		font-style: normal;
		opacity: 0.6;
	}
	.ui-ag-grow {
		font-size: 10.5px;
	}
	.ui-ag-grow b {
		color: var(--ag-ink);
		font-weight: 500;
	}
</style>
