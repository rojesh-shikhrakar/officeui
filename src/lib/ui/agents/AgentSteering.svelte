<script lang="ts">
	import './agents.css';
	let {
		agent = 'Coder',
		task = 'Build the pricing page and wire up checkout',
		steps = ['Read the design spec', 'Created PricingTable.svelte', 'Wiring up the checkout button'],
		queued = $bindable<string[]>([]),
		onsteer
	}: { agent?: string; task?: string; steps?: string[]; queued?: string[]; onsteer?: (note: string, mode: 'queue' | 'interrupt') => void } = $props();

	let note = $state('');
	let paused = $state(false);
	function send(mode: 'queue' | 'interrupt') {
		const v = note.trim();
		if (!v) return;
		queued = [...queued, v];
		if (mode === 'interrupt') paused = true;
		onsteer?.(v, mode);
		note = '';
	}
</script>

<div class="ui-ag ui-ags ui-ag-card">
	<div class="ui-ags__head">
		<span class="ui-ag-avatar" style:background="linear-gradient(135deg,#7c9cff,#3d5afe)">{agent[0]}</span>
		<div><b>{agent}</b><small>{task}</small></div>
		<span class="ui-ag-pill" data-tone={paused ? 'amber' : 'blue'}>{#if !paused}<i class="ui-ag-spin"></i>{/if}{paused ? 'Paused' : 'Working'}</span>
	</div>
	<ol class="ui-ags__steps">
		{#each steps as s, i (s)}<li data-now={i === steps.length - 1 || undefined}>{s}</li>{/each}
		{#each queued as q, i (i)}<li class="ui-ags__q">Queued: “{q}”</li>{/each}
	</ol>
	<form class="ui-ags__box" onsubmit={(e) => (e.preventDefault(), send('queue'))}>
		<input bind:value={note} placeholder="Steer the agent – e.g. use the annual price first" aria-label="Note for the agent" />
		<button type="button" class="ui-ags__int" onclick={() => send('interrupt')} disabled={!note.trim()}>Interrupt</button>
		<button type="submit" class="ui-ags__send" disabled={!note.trim()}>Queue</button>
	</form>
</div>

<style>
	.ui-ags {
		width: 100%;
		max-width: 420px;
		padding: 12px;
		display: grid;
		gap: 10px;
	}
	.ui-ags__head {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.ui-ags__head div {
		display: grid;
		flex: 1;
		min-width: 0;
		line-height: 1.25;
	}
	.ui-ags__head b {
		font-weight: 500;
	}
	.ui-ags__head small {
		color: var(--ag-muted);
		font-size: 11.5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-ags__steps {
		margin: 0;
		padding: 0 0 0 18px;
		display: grid;
		gap: 4px;
		font-size: 12px;
		color: var(--ag-muted);
	}
	.ui-ags__steps li[data-now] {
		color: var(--ag-ink);
	}
	.ui-ags__q {
		color: var(--ag-blue);
		animation: ui-ag-in 0.35s var(--ag-ease) both;
	}
	.ui-ags__box {
		display: flex;
		gap: 6px;
		padding: 4px;
		border-radius: 10px;
		background: var(--ag-fill);
		transition: box-shadow 0.2s var(--ag-ease);
	}
	.ui-ags__box:focus-within {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--ag-blue) 18%, transparent);
	}
	.ui-ags__box input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		font-size: 12.5px;
		padding: 0 6px;
		color: var(--ag-ink);
	}
	.ui-ags__box button {
		border: 0;
		font: inherit;
		font-size: 12px;
		font-weight: 500;
		border-radius: 7px;
		padding: 5px 10px;
		cursor: pointer;
		transition: transform 0.15s var(--ag-ease), opacity 0.15s;
	}
	.ui-ags__box button:active:not(:disabled) {
		transform: scale(0.97);
	}
	.ui-ags__box button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.ui-ags__int {
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
	}
	.ui-ags__send {
		background: var(--aui-primary, #171717);
		color: var(--aui-on-primary, #fafafa);
	}
</style>
