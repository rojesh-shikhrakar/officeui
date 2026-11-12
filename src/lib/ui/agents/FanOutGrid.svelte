<!-- Fan-out Grid – one agent hands a big job to many workers: every task a cell on a live grid that fills in as they get through it, with retries. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import './agents.css';
	let { job = 'Enrich 240 leads', total = 240, workers = 12, costPer = 0.017 }: { job?: string; total?: number; workers?: number; costPer?: number } = $props();
	// 0 todo · 1 running · 2 retrying · 3 done · 4 failed
	// svelte-ignore state_referenced_locally
	let cells = $state<number[]>(Array.from({ length: total }, (_, i) => (i < 30 ? 3 : i < 41 ? 1 : i < 45 ? 2 : 0)));
	let hover = $state<number | null>(null);
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = setInterval(() => {
			const next = [...cells];
			next.forEach((c, i) => {
				if (c === 1 && Math.random() < 0.4) next[i] = Math.random() < 0.06 ? 2 : 3;
				else if (c === 2 && Math.random() < 0.3) next[i] = Math.random() < 0.3 ? 4 : 3;
			});
			let running = next.filter((c) => c === 1).length;
			for (let i = 0; i < next.length && running < workers; i++) if (next[i] === 0) (next[i] = 1), running++;
			cells = next;
		}, 500);
		return () => clearInterval(t);
	});
	const n = (st: number) => cells.filter((c) => c === st).length;
	let only = $state<number | null>(null);
	const retryFailed = () => (cells = cells.map((c) => (c === 4 ? 2 : c)));
	const label = ['Waiting', 'Running', 'Retrying', 'Done', 'Failed'];
</script>

<div class="ui-ag ui-fog">
	<div class="ui-fog__bar"><b><span style:color="var(--ag-blue)">⇶</span> Fan-out <span class="ui-ag-muted">{job}</span></b><span><b>{n(3)}</b> <span class="ui-ag-muted">/ {total}</span></span><b>${(n(3) * costPer).toFixed(2)}</b><small class="ui-ag-muted">~{Math.ceil((total - n(3)) / workers / 2)}s left</small></div>
	<div class="ui-ag-card ui-fog__card">
		<div class="ui-fog__grid" role="img" aria-label="{n(3)} of {total} tasks done" onpointerover={(e) => { const i = (e.target as HTMLElement).dataset.i; hover = i === undefined ? null : +i; }} onpointerleave={() => (hover = null)}>
			{#each cells as c, i (i)}<i data-s={c} data-i={i} data-dim={only !== null && c !== only ? '' : undefined}></i>{/each}
		</div>
		<div class="ui-fog__leg">
			{#each [[3, 'done'], [1, 'running'], [2, 'retrying'], [4, 'failed']] as [st, l] (st)}<button class="ui-fog__lb" aria-pressed={only === st} data-zero={!n(Number(st)) || undefined} onclick={() => (only = only === st ? null : Number(st))}><i data-s={st}></i><b>{n(Number(st))}</b> {l}</button>{/each}
			<span class="ui-fog__tip">{#if hover !== null}Lead #{hover + 1} · {label[cells[hover]]}{:else if n(4)}<button class="ui-ag-btn" data-variant="ghost" onclick={retryFailed}>↻ Retry failed</button>{:else}{n(3)} of {total} done.{/if}</span>
		</div>
	</div>
</div>

<style>
	.ui-fog__lb {
		display: flex;
		align-items: center;
		gap: 4px;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		padding: 2px 4px;
		border-radius: 5px;
		cursor: pointer;
	}
	.ui-fog__lb[aria-pressed='true'] {
		background: var(--ag-fill);
	}
	.ui-fog__lb[data-zero] {
		opacity: 0.45;
	}
	.ui-fog__tip .ui-ag-btn {
		color: var(--ag-red);
	}
	i[data-dim] {
		opacity: 0.2;
	}
	i[data-s='1'] {
		background-image: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%);
		background-size: 250% 100%;
		animation: ui-ag-sheen 1.6s linear infinite;
	}
	.ui-fog {
		width: 100%;
		max-width: 560px;
		display: grid;
		gap: 8px;
		font-size: 11.5px;
	}
	.ui-fog__bar {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.ui-fog__bar > b:first-child {
		margin-right: auto;
		font-weight: 500;
	}
	.ui-fog__bar b {
		font-weight: 500;
	}
	.ui-fog__card {
		padding: 12px;
	}
	.ui-fog__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9px, 1fr));
		gap: 3px;
	}
	i {
		aspect-ratio: 1;
		border-radius: 2px;
		background: var(--ag-fill);
		display: block;
		transition: background-color 0.3s;
	}
	i[data-s='1'] {
		background: color-mix(in srgb, var(--ag-blue) 25%, transparent);
	}
	i[data-s='2'] {
		background: color-mix(in srgb, var(--ag-amber) 35%, transparent);
	}
	i[data-s='3'] {
		background: color-mix(in srgb, var(--ag-green) 30%, transparent);
	}
	i[data-s='4'] {
		background: color-mix(in srgb, var(--ag-red) 40%, transparent);
	}
	.ui-fog__leg {
		display: flex;
		gap: 14px;
		margin-top: 10px;
		color: var(--ag-muted);
	}
	.ui-fog__leg span {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-fog__leg i {
		width: 8px;
	}
	.ui-fog__leg b {
		color: var(--ag-ink);
		font-weight: 500;
	}
	.ui-fog__tip {
		margin-left: auto;
	}
</style>
