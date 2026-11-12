<!-- Agent Monitor – one agent at work, as a card: its current step with a clock and the bill so far, a time strip and the finished steps with the logo of each tool (click one for the details); the exact command when it needs your OK; folds into a small bar with the tools it has used. -->
<script lang="ts" module>
	export type MStep = { doing: string; done: string; tool: number; secs: number; detail?: string; command?: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play, tick } from './script';
	import './agents.css';
	let {
		model = 'Atlas Max',
		agent = 'Release agent · web-app v3.2',
		steps = [
			{ doing: 'Comparing v3.1…main', done: 'Compared 38 commits', tool: 11, secs: 2.3, detail: '38 commits, 112 files changed, 3 contributors' },
			{ doing: 'Collecting the v3.2 issues', done: 'Collected 14 issues', tool: 8, secs: 1.7, detail: '14 closed issues: 9 bugs, 5 features' },
			{ doing: 'Drafting the release notes', done: 'Drafted the release notes', tool: 3, secs: 2.8, detail: 'Notes with New, Improved and Fixed – 412 words' },
			{ doing: 'Building the preview', done: 'Built the preview in 41s', tool: 4, secs: 2.6, detail: 'Preview at a temporary address, all checks green' },
			{ doing: 'Ready to ship', done: 'Released v3.2', tool: 11, secs: 1.2, command: 'gh release create v3.2 --notes-file notes.md' },
			{ doing: 'Posting the changelog', done: 'Posted the changelog', tool: 3, secs: 1.1 }
		] as MStep[],
		autoplay = true,
		onallow,
		ondecline
	}: { model?: string; agent?: string; steps?: MStep[]; autoplay?: boolean; onallow?: () => void; ondecline?: () => void } = $props();
	let at = $state(1);
	let clock = $state(1);
	let cost = $state(0.01);
	let state_ = $state<'running' | 'paused' | 'needs' | 'declined' | 'cancelled' | 'done'>('running');
	let folded = $state(false);
	let open = $state<number | null>(null);
	let swap = $state(0);
	const cur = $derived(steps[Math.min(at, steps.length - 1)]);
	const finished = $derived(steps.slice(0, at).map((s, i) => ({ ...s, i })).reverse());
	const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
	function advance() {
		if (at >= steps.length - 1) return void (state_ = 'done');
		at++;
		swap++;
		clock = 0;
		if (steps[at].command) state_ = 'needs';
	}
	const allow = () => { if (state_ !== 'needs') return; state_ = 'running'; onallow?.(); advance(); };
	const decline = () => { if (state_ !== 'needs') return; state_ = 'declined'; ondecline?.(); };
	onMount(() => {
		const p = play([[2600, advance], [2800, advance], [2800, advance]], { autoplay, still: 3 });
		const t = tick(250, () => { if (state_ === 'running' || state_ === 'needs') { clock += 0.25; if (state_ === 'running') cost += 0.0016; } });
		return () => (p(), t());
	});
	const pill = $derived(({ running: ['blue', 'Running'], paused: ['gray', 'Paused'], needs: ['amber', 'Needs you'], declined: ['red', 'Declined'], cancelled: ['gray', 'Cancelled'], done: ['green', 'Done'] } as const)[state_]);
</script>

<svelte:window onkeydown={(e) => { if (state_ !== 'needs') return; if (e.key === 'Escape') decline(); else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) allow(); }} />

{#if folded}
	<button class="ui-ag ui-ag-card ui-amo__bar ui-ag-in" aria-label="Open the agent monitor" onclick={() => (folded = false)}>
		<span class="ui-amo__mk">✳</span><b>{model}</b><span class="ui-ag-pill" data-tone={pill[0]}>{#if state_ === 'running'}<i class="ui-ag-spin"></i>{/if} {pill[1]}</span>
		<span class="ui-amo__tools">{#each [...new Set(steps.slice(0, at + 1).map((s) => s.tool))] as t (t)}<Mark i={t} size={12} />{/each}</span><small>${cost.toFixed(3)}</small>
	</button>
{:else}
	<div class="ui-ag ui-ag-card ui-amo" data-state={state_}>
		<div class="ui-amo__head"><span class="ui-amo__mk">✳</span><span class="ui-ag-grow"><b>{model}</b><small>{agent}</small></span><small class="ui-amo__cost">${cost.toFixed(3)}</small><span class="ui-ag-pill" data-tone={pill[0]}>{#if state_ === 'running'}<i class="ui-ag-spin"></i>{:else}●{/if} {pill[1]}</span><button class="ui-ag-btn" data-variant="ghost" aria-label="Fold away" onclick={() => (folded = true)}>⌃</button></div>
		{#key swap}
			<div class="ui-amo__now ui-ag-rise" data-needs={state_ === 'needs' || undefined}>
				<Mark i={cur.tool} size={14} />
				<span class="ui-amo__doing" class:ui-amo__shine={state_ === 'running'}>{state_ === 'done' ? 'All steps done' : cur.doing}</span>
				{#if cur.command && state_ !== 'done'}<code>{cur.command}</code>{/if}
				<span class="ui-ag-grow"></span><small>{fmt(clock)}</small>
			</div>
		{/key}
		<div class="ui-amo__strip" aria-hidden="true">{#each steps.slice(0, at) as s, i (i)}<i style:flex-grow={s.secs}></i>{/each}<i class="ui-amo__live" data-needs={state_ === 'needs' || undefined} style:flex-grow={Math.max(0.3, clock / 2)}></i>{#each steps.slice(at + 1) as _, i (i)}<i class="ui-amo__todo" style:flex-grow="0.4"></i>{/each}</div>
		<ul>
			{#each finished as s (s.i)}
				<li class="ui-ag-rise">
					<button class="ui-amo__step" aria-expanded={open === s.i} aria-label="{s.done} – details" onclick={() => (open = open === s.i ? null : s.i)}><Mark i={s.tool} size={12} /><span class="ui-ag-grow">{s.done}</span><small>{s.secs}s</small></button>
					{#if open === s.i}<p class="ui-amo__detail ui-ag-in">{s.detail ?? 'No details recorded.'}</p>{/if}
				</li>
			{/each}
		</ul>
		<div class="ui-amo__foot">
			{#if state_ === 'needs'}
				<button class="ui-ag-btn" data-variant="ghost" onclick={decline}>Decline <span class="ui-ag-kbd">Esc</span></button>
				<button class="ui-ag-btn" data-variant="primary" onclick={allow}>Allow <span class="ui-ag-kbd">⌘↵</span></button>
			{:else}
				<button class="ui-ag-btn" data-variant="ghost" disabled={state_ === 'done' || state_ === 'cancelled'} onclick={() => (state_ = state_ === 'paused' ? 'running' : 'paused')}>{state_ === 'paused' ? '▷ Resume' : 'Ⅱ Pause'}</button>
				<button class="ui-ag-btn" data-variant="ghost" disabled={state_ === 'done' || state_ === 'cancelled'} onclick={() => (state_ = 'cancelled')}>× Cancel</button>
			{/if}
			<span class="ui-ag-grow"></span><small>{Math.min(at + 1, steps.length)}/{steps.length}</small><button class="ui-ag-btn" data-variant="ghost">Log ↗</button>
		</div>
	</div>
{/if}

<style>
	.ui-amo {
		width: 100%;
		max-width: 340px;
		padding: 12px;
		display: grid;
		gap: 10px;
		font-size: 12.5px;
	}
	.ui-amo__head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-amo__head .ui-ag-grow {
		display: grid;
		min-width: 0;
		line-height: 1.25;
	}
	.ui-amo__head small {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-amo__cost {
		color: var(--ag-ink);
		font-variant-numeric: tabular-nums;
	}
	.ui-amo__mk {
		width: 24px;
		height: 24px;
		border-radius: 7px;
		box-shadow: 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		color: #d97757;
		flex: none;
	}
	.ui-amo__now {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 10px;
		border-radius: 9px;
		background: var(--ag-fill);
		transition: background-color 0.3s;
	}
	.ui-amo__now[data-needs] {
		background: color-mix(in srgb, var(--ag-amber) 14%, transparent);
	}
	.ui-amo__now code {
		max-width: 130px;
		padding: 2px 6px;
		border-radius: 5px;
		background: var(--ag-surface);
		font-size: 10.5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-amo__shine {
		background: linear-gradient(90deg, var(--ag-muted) 30%, var(--ag-ink) 50%, var(--ag-muted) 70%) 0 0 / 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: ui-ag-sheen 2s linear infinite;
	}
	.ui-amo__strip {
		display: flex;
		gap: 3px;
		height: 4px;
	}
	.ui-amo__strip i {
		flex-basis: 0;
		border-radius: 2px;
		background: color-mix(in srgb, var(--ag-ink) 9%, transparent);
		transition: flex-grow 0.4s var(--ag-ease);
	}
	.ui-amo__live {
		background: color-mix(in srgb, var(--ag-blue) 50%, transparent) !important;
		animation: ui-ag-breathe 1.6s ease-in-out infinite;
	}
	.ui-amo__live[data-needs] {
		background: var(--ag-amber) !important;
	}
	.ui-amo__todo {
		background: color-mix(in srgb, var(--ag-ink) 4%, transparent) !important;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.ui-amo__step {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 6px;
		border: 0;
		border-radius: 6px;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		text-align: left;
		cursor: pointer;
	}
	.ui-amo__step:hover {
		background: var(--ag-fill);
	}
	.ui-amo__detail {
		margin: 0 6px 4px 26px;
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	.ui-amo__foot {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-amo__bar {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border: 0;
		font: inherit;
		font-size: 12.5px;
		color: inherit;
		cursor: pointer;
	}
	.ui-amo__bar .ui-amo__mk {
		width: 20px;
		height: 20px;
	}
	.ui-amo__tools {
		display: flex;
		gap: 3px;
	}
</style>
