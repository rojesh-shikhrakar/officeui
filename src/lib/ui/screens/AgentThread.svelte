<!-- Agent / Thread – one conversation with your orchestrator: plain answers with small task cards for the work it started, tool calls folded into a line, and a composer that can stop it. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import ChatComposer from '../agents/ChatComposer.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { onsend, onopen }: { onsend?: (t: string) => void; onopen?: (task: string) => void } = $props();
	let active = $state('thread');
	let running = $state(true);
	let msgs = $state<{ me: boolean; text: string }[]>([]);
	const tasks = [['Client dashboard', 'Drawing the empty states', '1/3'], ['API migration', 'Moving our own apps', '1/4']];
	const calls = [['▤', 'Read ingest-design.md', '1.2s'], ['▦', 'Checked the staging cluster', '1.4s'], ['⌕', 'Compared three queue options', '1.4s']];
	const nav = [{ items: AGENT_NAV[0].items }, { label: 'Workspace', items: [AGENT_NAV[1].items[4]] }];
	function send(t: string) {
		msgs = [...msgs, { me: true, text: t }, { me: false, text: 'On it – I added that to the plan and will tell you when it needs a decision.' }];
		onsend?.(t);
	}
</script>

<AppShell workspace="Fieldwork" {nav} bind:active cards={false}>
	<div class="ui-scr__bar"><span class="ui-ag-grow"></span><small><span style:color="var(--ag-blue)">◌</span> 9 running · <span style:color="var(--ag-amber)">●</span> 5 need you</small></div>
	<div class="ui-scr__chat">
		<div class="ui-scr__ai"><small>✓ Ran 3 tools · 2.1s</small><p>On it. I split it into four tasks and started them side by side – you'll only hear from me when something needs a decision.</p>{#each tasks as [t, d, n] (t)}<div class="ui-ag-card ui-ath__task"><span style:color="var(--ag-amber)">◔</span><span class="ui-ag-grow"><b>{t}</b><small>{d}</small></span><small>{n}</small><button class="ui-ag-btn" data-variant="ghost" onclick={() => onopen?.(t)}>Open</button></div>{/each}</div>
		<div class="ui-scr__msg">How did the ingest load test go?</div>
		<div class="ui-scr__ai"><b>⁙ Orchestrator <small>9:19 AM</small></b><small>✓ Ran 2 tools · 1.1s</small><p>It passed at 20k events a minute: p95 stayed under 100 ms and errors at 0.02%. Past 30k it starts to fall behind – well above Northwind's bursts.</p><span class="ui-ag-row"><span class="ui-ag-pill" data-tone="green">▤ load-test-results.csv</span><span class="ui-ag-pill" data-tone="blue">▤ ingest-design.md</span></span></div>
		<div class="ui-scr__msg">Good. Get ingest onto staging today – and tell me what you need from me.</div>
		<div class="ui-scr__ai"><b>⁙ Orchestrator <small>10:28 AM</small></b>{#if running}<small>◌ Running 3 tools in parallel</small>{:else}<small>◻ Stopped</small>{/if}{#each calls as [i, t, s] (t)}<div class="ui-ag-row ui-ath__call"><span>{running ? '◌' : '✓'}</span><span>{i}</span><span class="ui-ag-grow">{t}</span><small>{s}</small></div>{/each}</div>
		{#each msgs as m, i (i)}{#if m.me}<div class="ui-scr__msg ui-ag-in">{m.text}</div>{:else}<div class="ui-scr__ai ui-ag-in"><p>{m.text}</p></div>{/if}{/each}
		{#if running}<button class="ui-ag-btn ui-ath__stop" onclick={() => (running = false)}>◼ Stop</button>{/if}
	</div>
	<div class="ui-scr__compose"><ChatComposer placeholder="Ask for anything…" onsend={send} placement="top" /></div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-ath__task {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
	}
	.ui-ath__task .ui-ag-grow {
		display: grid;
	}
	.ui-ath__call {
		padding-left: 12px;
		color: var(--ag-muted);
	}
	.ui-ath__stop {
		justify-self: end;
	}
</style>
