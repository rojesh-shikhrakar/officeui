<!-- Model Picker – the model menu under a composer: speed, quality and cost meters per model, toggles for extended thinking and web search, and live latency/price. -->
<script lang="ts" module>
	export type ModelOpt = { id: string; name: string; note: string; speed: number; quality: number; cost: number; first: number; price: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		models = [
			{ id: 'max', name: 'Atlas Max', note: 'Hardest problems', speed: 2, quality: 5, cost: 5, first: 2.1, price: 25 },
			{ id: 'pro', name: 'Atlas Pro', note: 'Everyday work', speed: 4, quality: 4, cost: 3, first: 0.9, price: 15 },
			{ id: 'mini', name: 'Atlas Mini', note: 'Quick and light', speed: 5, quality: 3, cost: 1, first: 0.4, price: 4 },
			{ id: 'auto', name: 'Auto', note: 'Picks per message', speed: 0, quality: 0, cost: 0, first: 0, price: 0 }
		] as ModelOpt[],
		value = $bindable('pro'),
		thinking = $bindable(false),
		search = $bindable(false),
		open = $bindable(true),
		onsend
	}: { models?: ModelOpt[]; value?: string; thinking?: boolean; search?: boolean; open?: boolean; onsend?: (text: string, model: string) => void } = $props();
	let text = $state('');
	let effort = $state<'Low' | 'Medium' | 'High'>('Medium');
	onMount(() => play([[1600, () => (active = 0)], [1600, () => (thinking = true)], [1200, () => (effort = 'High')]], { still: 0 }));
	// svelte-ignore state_referenced_locally
	let active = $state(Math.max(0, models.findIndex((m) => m.id === value)));
	const cur = $derived(models.find((m) => m.id === value) ?? models[0]);
	const hov = $derived(models[active]);
	function keydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowDown') (e.preventDefault(), (active = (active + 1) % models.length));
		else if (e.key === 'ArrowUp') (e.preventDefault(), (active = (active - 1 + models.length) % models.length));
		else if (e.key === 'Enter') (e.preventDefault(), (value = models[active].id), (open = false));
		else if (e.key === 'Escape') open = false;
	}
	const meter = (n: number) => Array.from({ length: 5 }, (_, i) => i < n);
</script>

<div class="ui-ag ui-mp">
	<div class="ui-ag-panel ui-mp__box">
		<input class="ui-mp__in" bind:value={text} placeholder="Ask anything…" aria-label="Message" onkeydown={(e) => (open ? keydown(e) : e.key === 'Enter' && text && (onsend?.(text, value), (text = '')))} />
		<div class="ui-ag-row">
			<button class="ui-ag-chip" aria-expanded={open} aria-haspopup="listbox" onclick={() => (open = !open)}><span class="ui-mp__ic">{cur.name.split(' ').pop()![0]}</span>{cur.name} {open ? '⌃' : '⌄'}</button>
			{#if thinking}<span class="ui-ag-pill" data-tone="blue">Thinking</span>{/if}{#if search}<span class="ui-ag-pill" data-tone="gray">Web</span>{/if}
			<span class="ui-ag-grow"></span>
			<button class="ui-ag-btn ui-mp__send" data-variant="primary" aria-label="Send" disabled={!text} onclick={() => (onsend?.(text, value), (text = ''))}>↑</button>
		</div>
	</div>
	{#if open}
		<div class="ui-ag-panel ui-mp__menu ui-ag-in">
			<div class="ui-mp__hdr"><span>Model</span><span>Speed</span><span>Quality</span><span>Cost</span></div>
			<div role="listbox" aria-label="Model" tabindex="0" onkeydown={keydown}>
				{#each models as m, i (m.id)}
					<div class="ui-mp__row" role="option" tabindex="-1" aria-selected={m.id === value} data-active={i === active || undefined} onpointerenter={() => (active = i)} onclick={() => ((value = m.id), (open = false))} onkeydown={() => {}}>
						<span class="ui-mp__ic">{m.id === 'auto' ? '✦' : m.name.split(' ').pop()![0]}</span>
						<span class="ui-mp__nm"><b>{m.name} {#if m.id === value}<span style:color="var(--ag-blue)">✓</span>{/if}</b><small>{m.note}</small></span>
						{#if m.id === 'auto'}<span class="ui-mp__var">Varies</span>{:else}
							{#each [m.speed, m.quality, m.cost] as v, k (k)}<span class="ui-mp__meter" data-on={i === active || undefined}>{#each meter(v) as on, j (j)}<i data-on={on || undefined}></i>{/each}</span>{/each}
						{/if}
					</div>
				{/each}
			</div>
			<label class="ui-mp__opt">💡 Extended thinking <input type="checkbox" role="switch" bind:checked={thinking} /></label>
			{#if thinking}<div class="ui-mp__effort ui-ag-in"><small>Effort</small><div class="ui-ag-tabs" role="radiogroup" aria-label="Effort">{#each ['Low', 'Medium', 'High'] as const as e (e)}<button class="ui-ag-tab" role="radio" aria-checked={effort === e} onclick={() => (effort = e)}>{e}</button>{/each}</div></div>{/if}
			<label class="ui-mp__opt">🌐 Web search <input type="checkbox" role="switch" bind:checked={search} /></label>
			<div class="ui-ag-foot ui-ag-muted">{#if hov.id === 'auto'}Picks the best model for each message{:else}~<b>{(hov.first * (thinking ? { Low: 1.4, Medium: 2, High: 4 }[effort] : 1)).toFixed(1)}s</b>&nbsp;first token · <b>${hov.price}</b>&nbsp;/ M tokens{/if}<span class="ui-ag-grow"></span><span class="ui-ag-kbd">↑↓</span><span class="ui-ag-kbd">↵</span></div>
		</div>
	{/if}
</div>

<style>
	.ui-mp__effort {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px 6px 30px;
	}
	.ui-mp__effort small {
		color: var(--ag-muted);
	}
	.ui-mp {
		width: 100%;
		max-width: 300px;
		display: grid;
		gap: 6px;
		font-size: 12px;
	}
	.ui-mp__box {
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-mp__in {
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-mp__send {
		width: 26px;
		height: 26px;
		padding: 0;
		justify-content: center;
	}
	.ui-mp__ic {
		width: 18px;
		height: 18px;
		display: inline-grid;
		place-items: center;
		border-radius: 5px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		font-size: 9.5px;
		font-weight: 600;
		flex: none;
	}
	.ui-mp__menu {
		padding: 4px;
		margin: 0 8px;
	}
	.ui-mp__hdr,
	.ui-mp__row {
		display: grid;
		grid-template-columns: 22px 1fr 40px 40px 40px;
		gap: 6px;
		align-items: center;
	}
	.ui-mp__hdr {
		padding: 6px 8px 4px;
		font-size: 9px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-mp__hdr span:first-child {
		grid-column: 1 / 3;
	}
	.ui-mp__row {
		padding: 5px 8px;
		border-radius: 8px;
		cursor: pointer;
	}
	.ui-mp__row[data-active] {
		background: var(--ag-fill);
	}
	.ui-mp__nm b {
		display: block;
		font-weight: 500;
	}
	.ui-mp__nm small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-mp__meter {
		display: flex;
		gap: 2px;
	}
	.ui-mp__meter i {
		flex: 1;
		height: 3px;
		border-radius: 2px;
		background: var(--ag-line);
	}
	.ui-mp__meter i[data-on] {
		background: var(--ag-subtle);
	}
	.ui-mp__meter[data-on] i[data-on] {
		background: var(--ag-blue);
	}
	.ui-mp__var {
		grid-column: 3 / 6;
		text-align: center;
		color: var(--ag-subtle);
		font-size: 10.5px;
	}
	.ui-mp__opt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		border-top: 1px solid var(--ag-line);
	}
	.ui-mp__opt + .ui-mp__opt {
		border-top: 0;
	}
	.ui-mp .ui-ag-foot {
		font-size: 11px;
	}
	.ui-mp .ui-ag-foot b {
		color: var(--ag-ink);
		font-weight: 500;
	}
</style>
