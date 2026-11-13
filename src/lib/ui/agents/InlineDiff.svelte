<!-- Inline Diff – AI edits to prose shown inline: struck and added words you accept or reject one by one (Y / N), with a popover, Accept all and Reject all. -->
<script lang="ts" module>
	export type DiffPart = string | { del: string; add: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		instruction = 'Make it shorter',
		parts = [
			'Hi everyone, ',
			{ del: 'we are very excited to announce that ', add: '' },
			'the new dashboard is now ',
			{ del: 'available', add: 'live' },
			' for all users. It loads ',
			{ del: 'a lot faster than before', add: 'twice as fast' },
			' and you can export any report to CSV ',
			{ del: 'with just a single', add: 'in one' },
			' click. Let us know what you think!'
		] as DiffPart[],
		autoplay = true
	}: { instruction?: string; parts?: DiffPart[]; autoplay?: boolean } = $props();
	let history = $state<number[][]>([]);
	const edits = $derived(parts.map((p, i) => (typeof p === 'string' ? -1 : i)).filter((i) => i >= 0));
	let decided = $state<Record<number, 'yes' | 'no'>>({});
	let focus = $state(0);
	const open = $derived(edits.filter((i) => !decided[i]));
	const current = $derived(edits[focus]);
	function decide(v: 'yes' | 'no', i = current) {
		decided[i] = v;
		history = [...history, [i]];
		const next = edits.findIndex((e) => !decided[e]);
		if (next >= 0) focus = next;
	}
	function all(v: 'yes' | 'no') {
		const ids = edits.filter((i) => !decided[i]);
		ids.forEach((i) => (decided[i] = v));
		history = [...history, ids];
	}
	function undo() {
		const last = history[history.length - 1];
		if (!last) return;
		last.forEach((i) => delete decided[i]);
		decided = { ...decided };
		history = history.slice(0, -1);
		focus = edits.indexOf(last[0]);
	}
	onMount(() => play([[2600, () => decide('yes')], [2200, () => decide('yes')], [2200, () => all('yes')]], { autoplay, still: 0 }));
</script>

<svelte:window onkeydown={(e) => current !== undefined && !decided[current] && (e.key === 'y' ? decide('yes') : e.key === 'n' && decide('no'))} />

<div class="ui-ag ui-ag-panel ui-idf">
	<div class="ui-ag-body">
		<small class="ui-ag-muted"><span style:color="var(--ag-blue)">✦</span> Suggested by AI · {instruction}</small>
		<p>
			{#each parts as p, i (i)}
				{#if typeof p === 'string'}{p}{:else if decided[i] === 'yes'}{#if p.add}<span class="ui-idf__ok">{p.add}</span>{:else}<span class="ui-idf__gone"></span>{/if}{:else if decided[i] === 'no'}{p.del}{:else}
					<span class="ui-idf__edit" data-focus={current === i || undefined}>
						<span class="ui-idf__chg" role="button" tabindex="0" aria-label="Suggestion {edits.indexOf(i) + 1} of {edits.length}: {p.add ? `replace “${p.del.trim()}” with “${p.add}”` : `remove “${p.del.trim()}”`}. Press Y to accept, N to reject." onclick={() => (focus = edits.indexOf(i))} onkeydown={(e) => e.key === 'Enter' && (focus = edits.indexOf(i))}><del>{p.del}</del>{#if p.add} <ins>{p.add}</ins>{/if}</span>
						{#if current === i}<span class="ui-idf__pop ui-ag-in"><button class="ui-ag-btn" data-variant="primary" aria-keyshortcuts="Y" onclick={() => decide('yes', i)}><span aria-hidden="true">✓</span> Accept <span class="ui-ag-kbd" aria-hidden="true">Y</span></button><button class="ui-ag-btn" aria-keyshortcuts="N" onclick={() => decide('no', i)}><span aria-hidden="true">×</span> Reject <span class="ui-ag-kbd" aria-hidden="true">N</span></button></span>{/if}
					</span>
				{/if}
			{/each}
		</p>
	</div>
	<div class="ui-ag-foot">
		{#if !open.length}
		<span class="ui-ag-grow ui-ag-muted">All changes reviewed</span><button class="ui-ag-btn" data-variant="ghost" disabled={!history.length} onclick={undo}>↶ Undo</button>
		{:else}
		<span class="ui-ag-grow ui-ag-muted"><span class="ui-ag-kbd">{open.length}</span> suggestion{open.length === 1 ? '' : 's'}</span>
		{#if history.length}<button class="ui-ag-btn" data-variant="ghost" aria-label="Undo" onclick={undo}>↶</button>{/if}
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Previous suggestion" onclick={() => (focus = (focus - 1 + edits.length) % edits.length)}>‹</button>
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Next suggestion" onclick={() => (focus = (focus + 1) % edits.length)}>›</button>
		<button class="ui-ag-btn" disabled={!open.length} onclick={() => all('no')}>Reject all</button>
		<button class="ui-ag-btn" data-variant="primary" disabled={!open.length} onclick={() => all('yes')}>Accept all</button>
		{/if}
	</div>
</div>

<style>
	.ui-idf__gone {
		display: inline-block;
		width: 0;
		animation: ui-idf-gone 0.4s var(--ag-ease);
	}
	@keyframes ui-idf-gone {
		from {
			width: 2em;
			border-bottom: 1px dashed var(--ag-red);
		}
	}
	.ui-idf {
		max-width: 400px;
		font-size: 13px;
		line-height: 1.8;
	}
	p {
		margin: 0;
	}
	.ui-idf__edit {
		position: relative;
	}
	.ui-idf__chg {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		padding: 0;
		cursor: pointer;
	}
	del {
		color: var(--ag-red);
		background: color-mix(in srgb, var(--ag-red) 10%, transparent);
		border-radius: 3px;
		padding: 0 2px;
	}
	ins {
		text-decoration: none;
		color: var(--ag-green);
		background: color-mix(in srgb, var(--ag-green) 12%, transparent);
		border-radius: 3px;
		padding: 0 2px;
	}
	.ui-idf__edit[data-focus] .ui-idf__chg {
		outline: 1.5px solid color-mix(in srgb, var(--ag-blue) 45%, transparent);
		outline-offset: 1px;
		border-radius: 3px;
	}
	.ui-idf__pop {
		position: absolute;
		left: 0;
		top: calc(100% + 2px);
		z-index: 4;
		display: flex;
		gap: 4px;
		padding: 4px;
		border-radius: 9px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 8px 20px -8px rgba(0, 0, 0, 0.25);
		white-space: nowrap;
		line-height: 1;
	}
	.ui-idf__ok {
		background: color-mix(in srgb, var(--ag-green) 8%, transparent);
		border-radius: 3px;
	}
</style>
