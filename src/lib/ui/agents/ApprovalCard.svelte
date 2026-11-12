<!-- Approval Card – an agent asks before it acts: risk badge, preview, Approve and Deny with shortcuts, a pausing countdown and a morph to the result. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from './script';
	import './agents.css';
	let {
		message = 'I drafted the October newsletter. Ready to send?',
		action = 'Send campaign email',
		target = 'October product update · Newsletter',
		risk = 'medium',
		recipients = ['Mia', 'Jonas', 'Sara', 'Alex'],
		more = 38,
		fields = [
			['Subject', "What's new in October"],
			['Send', 'Today, 9:00 AM']
		] as [string, string][],
		countdown = 5,
		/** Starts over a moment after it resolves, like the original's demo */
		autoplay = true,
		ondecide
	}: { message?: string; action?: string; target?: string; risk?: 'low' | 'medium' | 'high'; recipients?: string[]; more?: number; fields?: [string, string][]; countdown?: number; autoplay?: boolean; ondecide?: (approved: boolean, always: boolean) => void } = $props();
	let result = $state<null | 'approved' | 'denied'>(null);
	let always = $state(false);
	// svelte-ignore state_referenced_locally
	let left = $state(countdown);
	let hovering = $state(false);
	function decide(ok: boolean) {
		if (result) return;
		result = ok ? 'approved' : 'denied';
		ondecide?.(ok, always);
	}
	let since = 0;
	onMount(() =>
		tick(1000, () => {
			if (result) {
				if (autoplay && ++since >= 3) ((result = null), (left = countdown), (since = 0));
				return;
			}
			if (hovering) return;
			left -= 1;
			if (left <= 0) decide(true);
		})
	);
	const tone = { low: 'green', medium: 'amber', high: 'red' } as const;
</script>

<svelte:window onkeydown={(e) => !result && (e.key === 'Escape' ? decide(false) : e.key === 'Enter' && (e.metaKey || e.ctrlKey) && decide(true))} />

<div class="ui-ag ui-apc">
	<div class="ui-apc__msg"><span class="ui-ag-avatar" style:background="#171717">✦</span><p>{message}</p></div>
	<div class="ui-ag-panel ui-apc__card" role="group" aria-label={action} onpointerenter={() => (hovering = true)} onpointerleave={() => (hovering = false)}>
		{#if result}
			<div class="ui-apc__done ui-ag-in" role="status"><span class="ui-ag-check" data-state={result === 'denied' ? 'fail' : undefined}>{result === 'denied' ? '×' : '✓'}</span>{result === 'approved' ? `${action} – approved` : 'Denied – nothing was sent'}<button class="ui-ag-btn" data-variant="ghost" onclick={() => ((result = null), (left = countdown))}>Undo</button></div>
		{:else}
			<div class="ui-apc__top"><span class="ui-apc__ico">✉</span><span class="ui-ag-grow"><b>{action}</b><small>{target}</small></span><span class="ui-ag-pill" data-tone={tone[risk]}>{risk[0].toUpperCase() + risk.slice(1)} risk</span></div>
			<div class="ui-apc__who"><span class="ui-apc__faces">{#each recipients as r (r)}<span class="ui-ag-avatar" style:background="#e5e7eb" style:color="#444">{r[0]}</span>{/each}</span>{recipients.join(', ')} <span class="ui-ag-muted">+{more} more</span></div>
			{#each fields as [k, v] (k)}<div class="ui-apc__f"><small>{k}</small>{v}</div>{/each}
			<div class="ui-apc__foot">
				<label class="ui-ag-muted"><input type="checkbox" bind:checked={always} /> Always allow this action</label>
				<button class="ui-ag-btn" data-variant="ghost" onclick={() => decide(false)}>Deny <span class="ui-ag-kbd">Esc</span></button>
				<button class="ui-ag-btn" data-variant="primary" onclick={() => decide(true)}>Approve <span class="ui-apc__ring" style:--p={left / countdown}>{left}</span></button>
			</div>
		{/if}
	</div>
</div>

<style>
	.ui-apc {
		width: 100%;
		max-width: 330px;
		display: grid;
		gap: 10px;
		font-size: 12px;
	}
	.ui-apc__msg {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.ui-apc__msg p {
		margin: 0;
		background: var(--ag-fill);
		border-radius: 14px;
		padding: 6px 12px;
	}
	.ui-apc__card {
		padding: 12px;
		display: grid;
		gap: 8px;
	}
	.ui-apc__top {
		display: flex;
		gap: 10px;
		align-items: center;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-apc__ico {
		width: 26px;
		height: 26px;
		border-radius: 7px;
		display: grid;
		place-items: center;
		box-shadow: var(--ag-shadow);
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
		font-size: 13px;
	}
	.ui-ag-grow small,
	.ui-apc__f small {
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	.ui-apc__who {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-apc__faces {
		display: flex;
	}
	.ui-apc__faces .ui-ag-avatar {
		width: 18px;
		height: 18px;
		margin-left: -4px;
		box-shadow: 0 0 0 2px var(--ag-surface);
	}
	.ui-apc__f {
		display: grid;
		grid-template-columns: 52px 1fr;
	}
	.ui-apc__foot {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-top: 8px;
		border-top: 1px solid var(--ag-line);
	}
	.ui-apc__foot label {
		flex: 1;
		display: flex;
		gap: 5px;
		align-items: center;
		font-size: 11px;
	}
	.ui-apc__ring {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		font-size: 9px;
		display: grid;
		place-items: center;
		background: conic-gradient(currentColor calc(var(--p) * 360deg), color-mix(in srgb, currentColor 25%, transparent) 0);
		-webkit-mask: radial-gradient(circle, transparent 5px, #000 5.5px);
		mask: radial-gradient(circle, transparent 5px, #000 5.5px);
		font-size: 0;
	}
	.ui-apc__done {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 500;
	}
	.ui-apc__done .ui-ag-btn {
		margin-left: auto;
	}
</style>
