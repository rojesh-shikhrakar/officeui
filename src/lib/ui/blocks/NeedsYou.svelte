<!-- Needs You – the questions agents are waiting on; answer one and it leaves the list. Part of the mission blocks. -->
<script lang="ts">
	import { ASKS, type Ask } from './mission';
	let { asks = $bindable(ASKS.map((a) => ({ ...a }))), onanswer }: { asks?: Ask[]; onanswer?: (a: Ask, yes: boolean) => void } = $props();
	let open = $state<string | null>(null);
	function answer(a: Ask, yes: boolean) {
		asks = asks.filter((x) => x !== a);
		open = null;
		onanswer?.(a, yes);
	}
</script>

<div class="ui-nyu">
	<small class="ui-nyu__h">✦ Needs you <span class="ui-ag-pill" data-tone="gray">{asks.length}</span></small>
	{#each asks as a (a.title)}
		<div class="ui-ag-card ui-nyu__item">
			<button class="ui-nyu__q" aria-expanded={open === a.title} onclick={() => (open = open === a.title ? null : a.title)}><b><span style:color="var(--ag-amber)">✦</span> {a.title}</b><span>{a.detail}</span><small>{#if a.state === 'failed'}<span style:color="var(--ag-red)">●</span> Failed{:else}<span style:color="var(--ag-amber)">▲</span> Waiting for you · {a.age}{/if}</small></button>
			{#if open === a.title}<div class="ui-ag-row ui-ag-in">{#if a.state === 'failed'}<button class="ui-ag-btn" data-variant="primary" onclick={() => answer(a, true)}>Retry</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => answer(a, false)}>Dismiss</button>{:else}<button class="ui-ag-btn" data-variant="primary" onclick={() => answer(a, true)}>Yes, go ahead</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => answer(a, false)}>Not now</button>{/if}</div>{/if}
		</div>
	{:else}<p class="ui-ag-muted">Nothing needs you right now.</p>{/each}
</div>

<style>
	.ui-nyu {
		background: var(--ag-fill);
		border-radius: 12px;
		padding: 8px;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.ui-nyu__h {
		padding: 4px 6px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-nyu__item {
		padding: 10px;
		display: grid;
		gap: 8px;
	}
	.ui-nyu__q {
		all: unset;
		display: grid;
		gap: 3px;
		cursor: pointer;
	}
	.ui-nyu__q:focus-visible {
		outline: 2px solid var(--ag-blue);
		border-radius: 4px;
	}
	.ui-nyu__q b {
		font-weight: 500;
	}
	.ui-nyu__q span,
	small {
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	p {
		margin: 6px;
	}
</style>
