<!-- Agent Handoff – a task passed from agent to agent like a relay: at every handoff what went along to the next one, and what got lost on the way. Open a handoff to see both. -->
<script lang="ts" module>
	export type HAgent = { name: string; model: string; mark: string; color: string; role: string; cost: number };
	export type Pass = { id: number; task: string; tool: number; kept: string[]; lost?: string[]; fresh?: boolean };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { play } from '../utils/script';
	import './agents.css';
	let {
		agents = [
			{ name: 'Researcher', model: 'Atlas Max', mark: '✳', color: '#d97757', role: 'Finds the sources, pulls the facts and decides the angle.', cost: 1.25 },
			{ name: 'Writer', model: 'Orbit Pro', mark: '◎', color: '#171717', role: 'Turns the brief into a first draft in the team’s voice.', cost: 0.57 },
			{ name: 'Reviewer', model: 'Prism Pro', mark: '✦', color: '#3b82f6', role: 'Checks every claim against its source before it ships.', cost: 0.3 }
		] as HAgent[],
		lanes = $bindable([
			[
				{ id: 1, task: 'Support macro for refunds', tool: 3, kept: ['50 good replies', 'refund-policy.md'], lost: ['2 edge cases'] },
				{ id: 2, task: 'API release notes', tool: 11, kept: ['endpoints.yaml', '3 examples', 'Write for integrators'] },
				{ id: 3, task: 'Onboarding email', tool: 8, kept: ['first-run.md', 'Where teams drop off', 'One step only'] }
			],
			[
				{ id: 4, task: 'Support macro for refunds', tool: 3, kept: ['Macro draft', 'Tone: warm'] },
				{ id: 5, task: 'API release notes', tool: 11, kept: ['Draft v2', '3 examples'] },
				{ id: 6, task: 'Onboarding email', tool: 8, kept: ['Email draft', 'Tone: friendly'] }
			]
		] as Pass[][]),
		queue = $bindable(['Reply to churned team', 'Changelog v2', 'Pricing FAQ', 'Webinar invite']),
		autoplay = true
	}: { agents?: HAgent[]; lanes?: Pass[][]; queue?: string[]; autoplay?: boolean } = $props();
	let work = $state<(string | null)[]>([null, null, null]);
	let doing = $state<string[]>(['', '', '']);
	// svelte-ignore state_referenced_locally
	let costs = $state(agents.map((a) => a.cost));
	let open = $state<number | null>(null);
	let streak = $state<number | null>(null);
	let peek = $state<number | null>(null);
	const start = (i: number, task: string, what: string) => ((work[i] = task), (doing[i] = what));
	function hand(from: number, kept: string[], lost?: string[]) {
		const task = work[from]!;
		work[from] = null;
		streak = from;
		lanes[from] = [{ id: Date.now() + from, task, tool: from === 0 ? 3 : 8, kept, lost, fresh: true }, ...lanes[from]];
		costs[from] += 0.08;
	}
	onMount(() =>
		play(
			[
				[700, () => (start(0, queue[0], 'Reading sources'), (queue = queue.slice(1)))],
				[1600, () => ((doing[0] = 'Picking the angle'), (costs[0] += 0.04))],
				[1600, () => hand(0, ['3 churn interviews', 'win-back offer'], ['Pricing complaint'])],
				[400, () => start(1, 'Reply to churned team', 'Drafting')],
				[1800, () => ((doing[1] = 'Matching the team’s voice'), (costs[1] += 0.03))],
				[1600, () => hand(1, ['Reply draft', 'Tone: honest'])],
				[400, () => start(2, 'Reply to churned team', 'Checking claims')],
				[2000, () => ((work[2] = null), (costs[2] += 0.02))]
			],
			{ autoplay, still: 3 }
		)
	);
</script>

<div class="ui-ag ui-aho">
	<div class="ui-aho__agents">
		{#each agents as a, i (a.name)}
			<div class="ui-ag-card ui-aho__agent" role="button" tabindex="0" aria-label="{a.name}{work[i] ? ` – ${work[i]}` : ''}" aria-expanded={peek === i} onclick={() => (peek = peek === i ? null : i)} onkeydown={(e) => e.key === 'Enter' && (peek = peek === i ? null : i)}>
				<div class="ui-ag-row"><span class="ui-aho__mk" style:color={a.color}>{a.mark}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model}</small></span><small>${costs[i].toFixed(2)}</small><span class="ui-ag-pill" data-tone={work[i] ? 'blue' : 'gray'}>{#if work[i]}<i class="ui-ag-spin"></i> Working{:else}Idle{/if}</span></div>
				<p>{a.role}</p>
				<div class="ui-aho__slot">
					{#if work[i]}<span class="ui-aho__now ui-ag-rise"><b>{work[i]}</b><small>{doing[i]}</small></span>
					{:else if i === 0 && queue.length}<span><small>Up next</small> <Mark i={11} size={11} /> {queue[0]} <small>+{queue.length - 1}</small></span>
					{:else}<small>Ready for a task</small>{/if}
				</div>
				{#if peek === i && i === 0}<ul class="ui-aho__q ui-ag-in">{#each queue as q (q)}<li>{q}</li>{/each}</ul>{/if}
			</div>
		{/each}
	</div>
	<svg class="ui-aho__wires" viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden="true">
		{#each [['M100,0 V20 Q100,30 110,30 H190 Q200,30 200,40 V70', 0], ['M300,0 V20 Q300,30 290,30 H230 Q220,30 220,40 V70', 0], ['M300,0 V20 Q300,30 310,30 H370 Q380,30 380,40 V70', 1], ['M500,0 V20 Q500,30 490,30 H410 Q400,30 400,40 V70', 1]] as [d, lane], k (k)}
			<path d={String(d)} class="ui-aho__wire" />
			{#if streak === lane}{#key lanes[Number(lane)][0].id}<path d={String(d)} class="ui-aho__streak" pathLength="100" />{/key}{/if}
		{/each}
	</svg>
	<div class="ui-aho__lanes">
		{#each lanes as lane, li (li)}
			<div class="ui-aho__lane">
				<div class="ui-aho__lh"><span style:color={agents[li].color}>{agents[li].mark}</span> {agents[li].name} <span class="ui-ag-muted">→</span> <span style:color={agents[li + 1].color}>{agents[li + 1].mark}</span> {agents[li + 1].name}<span class="ui-ag-grow"></span><span class="ui-ag-pill" data-tone="gray">{lane.length}</span></div>
				{#each lane.slice(0, 3) as p (p.id)}
					<button class="ui-ag-card ui-aho__pass" class:ui-aho__drop={p.fresh} aria-expanded={open === p.id} onclick={() => (open = open === p.id ? null : p.id)}>
						<span class="ui-ag-row"><Mark i={p.tool} size={12} /><b>{p.task}</b></span>
						{#if open === p.id}
							<span class="ui-aho__chips ui-ag-in"><small>Went along</small>{#each p.kept as k (k)}<span class="ui-ag-chip">{k}</span>{/each}</span>
							{#if p.lost?.length}<span class="ui-aho__chips ui-ag-in"><small>Got lost</small>{#each p.lost as k (k)}<span class="ui-ag-chip ui-aho__lost">{k}</span>{/each}</span>{/if}
						{:else}
							<small class="ui-aho__kept">{p.kept.join(', ')}</small>
						{/if}
						<small class="ui-aho__state" data-lost={p.lost?.length || undefined}><i></i>{p.lost?.length ? `${p.lost.length} lost on the way` : 'Looks good'}</small>
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.ui-aho {
		width: 100%;
		max-width: 680px;
		display: grid;
		font-size: 12.5px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-aho__agents {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.ui-aho__agent {
		padding: 12px 12px 10px;
		display: grid;
		gap: 8px;
		cursor: pointer;
		align-content: start;
	}
	.ui-aho__agent .ui-ag-grow {
		display: grid;
		line-height: 1.25;
	}
	.ui-aho__mk {
		width: 24px;
		height: 24px;
		border-radius: 7px;
		box-shadow: 0 0 0 1px var(--ag-line);
		display: grid;
		place-items: center;
		flex: none;
	}
	.ui-aho__agent p {
		margin: 0;
		color: var(--ag-muted);
		line-height: 1.5;
	}
	.ui-aho__slot {
		min-height: 30px;
		display: flex;
		align-items: center;
		padding: 5px 8px;
		border-radius: 8px;
		background: var(--ag-fill);
	}
	.ui-aho__slot > span {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.ui-aho__now {
		display: grid !important;
		gap: 0 !important;
	}
	.ui-aho__q {
		margin: 0;
		padding-left: 16px;
		color: var(--ag-muted);
	}
	.ui-aho__wires {
		width: 100%;
		height: 70px;
		overflow: visible;
	}
	.ui-aho__wire {
		fill: none;
		stroke: color-mix(in srgb, var(--ag-blue) 45%, transparent);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
	}
	.ui-aho__streak {
		fill: none;
		stroke: var(--ag-blue);
		stroke-width: 2.4;
		vector-effect: non-scaling-stroke;
		stroke-dasharray: 18 100;
		animation: ui-aho-streak 0.9s var(--ag-ease) forwards;
	}
	@keyframes ui-aho-streak {
		from {
			stroke-dashoffset: 18;
		}
		to {
			stroke-dashoffset: -100;
		}
	}
	.ui-aho__lanes {
		display: grid;
		grid-template-columns: repeat(2, 260px);
		justify-content: center;
		gap: 20px;
	}
	.ui-aho__lane {
		background: var(--ag-fill);
		border-radius: 12px;
		padding: 4px;
		display: grid;
		gap: 4px;
		align-content: start;
		max-height: 220px;
		overflow: hidden;
		-webkit-mask: linear-gradient(#000 80%, transparent);
		mask: linear-gradient(#000 80%, transparent);
	}
	.ui-aho__lh {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 4px 6px;
		color: var(--ag-muted);
		font-size: 11.5px;
	}
	.ui-aho__pass {
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 9px 10px;
		display: grid;
		gap: 4px;
		cursor: pointer;
	}
	.ui-aho__drop {
		animation: ui-aho-drop 0.5s var(--ag-ease) both;
	}
	@keyframes ui-aho-drop {
		from {
			opacity: 0;
			transform: translateY(-14px) scale(0.97);
		}
	}
	.ui-aho__kept {
		color: var(--ag-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-left: 20px;
	}
	.ui-aho__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
		padding-left: 20px;
	}
	.ui-aho__chips small {
		width: 100%;
	}
	.ui-aho__lost {
		text-decoration: line-through;
		color: var(--ag-red);
	}
	.ui-aho__state {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-left: 20px;
	}
	.ui-aho__state i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ag-green);
	}
	.ui-aho__state[data-lost] i {
		background: var(--ag-amber);
	}
</style>
