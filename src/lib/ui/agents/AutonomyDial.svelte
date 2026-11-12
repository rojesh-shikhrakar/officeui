<!-- Autonomy Dial – how much an agent may do on its own: a three-stop dial, and its actions gliding between "Runs on its own" and "Asks you first". -->
<script lang="ts" module>
	export type Capability = { name: string; risk?: 'risky' | 'destructive'; color: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from './script';
	import './agents.css';
	let {
		agent = 'Sales agent',
		level = $bindable('risky'),
		autoplay = true,
		capabilities = [
			{ name: 'Read files and docs', color: '#171717' },
			{ name: 'Draft emails', color: '#ea4335' },
			{ name: 'Update CRM records', risk: 'risky', color: '#ff7a59' },
			{ name: 'Send emails', risk: 'risky', color: '#ea4335' },
			{ name: 'Delete files', risk: 'destructive', color: '#0f9d58' },
			{ name: 'Spend money', risk: 'destructive', color: '#635bff' }
		]
	}: { agent?: string; level?: 'ask' | 'risky' | 'auto'; capabilities?: Capability[]; autoplay?: boolean } = $props();
	let locked = $state<Set<string>>(new Set(['Spend money']));
	let user = false;
	const toggleLock = (n: string) => { const s = new Set(locked); if (s.has(n)) s.delete(n); else s.add(n); locked = s; };
	onMount(() => play([[2600, () => !user && (level = 'auto')], [2600, () => !user && (level = 'ask')], [2600, () => !user && (level = 'risky')]], { autoplay, still: 0, loop: () => {} }));
	const stops = [
		{ id: 'ask', label: 'Always ask' },
		{ id: 'risky', label: 'If risky' },
		{ id: 'auto', label: 'Full auto' }
	] as const;
	// Spending money always asks first
	const own = (c: Capability) => !locked.has(c.name) && (level === 'auto' || (level === 'risky' && !c.risk));
	const ownList = $derived(capabilities.filter(own));
	const askList = $derived(capabilities.filter((c) => !own(c)));
</script>

{#snippet item(c: Capability)}
	<li class="ui-ag-item ui-ag-in"><i style:background={c.color}></i><span>{c.name}</span>{#if c.risk}<span class="ui-ag-pill" data-tone={c.risk === 'risky' ? 'amber' : 'red'}>{c.risk === 'risky' ? '⚠ Risky' : '◇ Destructive'}</span>{/if}<button class="ui-ag-btn ui-aad__lock" data-variant="ghost" data-on={locked.has(c.name) || undefined} aria-label={locked.has(c.name) ? `${c.name}: always asks – unlock` : `Always ask before: ${c.name}`} onclick={() => toggleLock(c.name)}>{locked.has(c.name) ? '🔒' : '🔓'}</button></li>
{/snippet}

<div class="ui-ag ui-ag-panel ui-aad">
	<div class="ui-ag-body">
		<div class="ui-ag-row"><span style:color="var(--ag-blue)">✦</span><span class="ui-ag-grow"><b>{agent}</b><small>What it may do without asking you</small></span></div>
		<div class="ui-aad__dial" role="radiogroup" aria-label="Autonomy">
			{#each stops as s (s.id)}<button role="radio" aria-checked={level === s.id} onclick={() => ((level = s.id), (user = true))}>{s.label}</button>{/each}
		</div>
	</div>
	<div class="ui-ag-body ui-aad__lists">
		<small class="ui-ag-muted">Runs on its own <em>{ownList.length}</em></small>
		<ul class="ui-ag-list">{#each ownList as c (c.name)}{@render item(c)}{/each}</ul>
		<small class="ui-ag-muted">Asks you first <em>{askList.length}</em></small>
		<ul class="ui-ag-list">{#each askList as c (c.name)}{@render item(c)}{/each}</ul>
	</div>
</div>

<style>
	.ui-aad__lock {
		margin-left: auto;
		padding: 0 4px;
		font-size: 10px;
		opacity: 0;
	}
	:global(.ui-ag-item:hover) .ui-aad__lock,
	.ui-aad__lock[data-on],
	.ui-aad__lock:focus-visible {
		opacity: 0.7;
	}
	.ui-aad {
		max-width: 280px;
		font-size: 12px;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-aad__dial {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
	}
	.ui-aad__dial button {
		border: 0;
		font: inherit;
		font-size: 11px;
		padding: 5px 0;
		border-radius: 6px;
		background: var(--ag-fill);
		color: var(--ag-muted);
		cursor: pointer;
		transition: all 0.2s var(--ag-ease);
	}
	.ui-aad__dial button[aria-checked='true'] {
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
		font-weight: 500;
	}
	.ui-aad__lists {
		border-top: 1px solid var(--ag-line);
	}
	em {
		font-style: normal;
		background: var(--ag-fill);
		padding: 0 5px;
		border-radius: 4px;
		margin-left: 4px;
	}
	.ui-ag-item {
		padding: 4px 2px;
	}
	.ui-ag-item i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		flex: none;
	}
</style>
