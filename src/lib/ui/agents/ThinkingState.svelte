<!-- Thinking State – an assistant's live working steps: thinking timer, sources it searched as chips, and steps that light up in turn. -->
<script lang="ts" module>
	export type Source = { label: string; mark: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let {
		sources = [
			{ label: 'Chat – #team-offsite', mark: '#' },
			{ label: 'Social – @cityguide', mark: '@' },
			{ label: 'Notes – Offsite plan', mark: '▤' },
			{ label: 'Encyclopedia – Lisbon', mark: 'W' },
			{ label: 'Flights – LIS', mark: '✈' },
			{ label: 'Hotels – Alfama', mark: '⌂' },
			{ label: 'Weather – June', mark: '☀' }
		] as Source[],
		steps = ['Reading 7 sources about the trip', 'Comparing flights and hotels', 'Checking dates against the team calendar', 'Drafting the offsite agenda'],
		autoplay = true,
		visible = 4
	}: { sources?: Source[]; steps?: string[]; autoplay?: boolean; visible?: number } = $props();
	let secs = $state(3);
	let at = $state(0);
	let expanded = $state(false);
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		secs = 0;
		const a = setInterval(() => at <= steps.length && secs++, 1000);
		const b = setInterval(() => (at <= steps.length ? at++ : clearInterval(b)), 1500);
		return () => (clearInterval(a), clearInterval(b));
	});
	const chips = $derived(expanded ? sources : sources.slice(0, visible));
</script>

<div class="ui-ag ui-ts" aria-live="polite">
	{#if at > steps.length}<div class="ui-ts__row ui-ag-in"><span class="ui-ts__ic" style:color="var(--ag-blue)">⁙</span><b class="ui-ts__done">Worked for {secs}s</b></div>{:else}<button class="ui-ts__row ui-ts__btn" onclick={() => (expanded = !expanded)}><span class="ui-ts__ic ui-ts__pix">⁙</span><span class="ui-ts__shimmer">Thinking</span><small>{secs}s</small></button>{/if}
	<div class="ui-ts__row"><span class="ui-ts__ic">◎</span>{at === 0 ? 'Searching' : 'Searched'}</div>
	<div class="ui-ts__body">
		<div class="ui-ts__chips">
			{#each chips as s (s.label)}<span class="ui-ts__chip ui-ag-in"><i>{s.mark}</i>{s.label}</span>{/each}
			{#if sources.length > visible}<button class="ui-ts__chip" onclick={() => (expanded = !expanded)}>{expanded ? 'Less' : `+${sources.length - visible} more`}</button>{/if}
		</div>
		{#each steps as s, i (s)}{#if i <= at + 1}<div class="ui-ts__step ui-ag-rise" data-s={i < at ? 'done' : i === at ? 'now' : 'next'}><i></i>{s}</div>{/if}{/each}
		{#if at > steps.length - 1}<div class="ui-ts__step ui-ag-rise" data-s="end"><i>✓</i>Finished thinking</div>{/if}
	</div>
</div>

<style>
	.ui-ts__btn {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		padding: 0;
		cursor: pointer;
	}
	.ui-ts__done {
		font-weight: 500;
		color: var(--ag-ink);
	}
	.ui-ts__pix {
		animation: ui-ag-breathe 1s steps(2) infinite;
	}
	.ui-ts__step[data-s='end'] {
		color: var(--ag-ink);
	}
	.ui-ts__step[data-s='end'] i {
		width: 12px !important;
		height: 12px !important;
		border-radius: 50% !important;
		background: var(--ag-blue) !important;
		color: #fff;
		font-size: 7px;
		font-style: normal;
		display: grid;
		place-items: center;
	}
	.ui-ts {
		width: 100%;
		max-width: 330px;
		display: grid;
		gap: 8px;
		font-size: 11.5px;
		color: var(--ag-muted);
	}
	.ui-ts__row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-ts__ic {
		width: 14px;
		color: var(--ag-subtle);
		text-align: center;
	}
	.ui-ts__row small {
		color: var(--ag-subtle);
	}
	.ui-ts__shimmer {
		background: linear-gradient(90deg, var(--ag-muted) 30%, var(--ag-ink) 50%, var(--ag-muted) 70%) 0 0 / 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: ui-ts-sh 1.6s linear infinite;
	}
	@keyframes ui-ts-sh {
		to {
			background-position: -200% 0;
		}
	}
	.ui-ts__body {
		margin-left: 6px;
		padding-left: 14px;
		border-left: 1px solid var(--ag-line);
		display: grid;
		gap: 8px;
	}
	.ui-ts__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.ui-ts__chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 7px;
		border: 0;
		border-radius: 6px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		font: inherit;
		font-size: 10.5px;
		color: var(--ag-ink);
		cursor: default;
	}
	button.ui-ts__chip {
		cursor: pointer;
		color: var(--ag-muted);
	}
	.ui-ts__chip i {
		font-style: normal;
		font-size: 9px;
		color: var(--ag-muted);
	}
	.ui-ts__step {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: -18px;
		transition: opacity 0.3s;
	}
	.ui-ts__step i {
		width: 6px;
		height: 6px;
		border-radius: 2px;
		background: var(--ag-line);
		box-shadow: 0 0 0 2px var(--ag-surface);
	}
	.ui-ts__step[data-s='now'] i {
		background: var(--ag-blue);
	}
	.ui-ts__step[data-s='done'] i {
		background: var(--ag-subtle);
	}
	.ui-ts__step[data-s='next'] {
		opacity: 0.3;
	}
</style>
