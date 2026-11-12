<!-- AI Chat / Overview – the AI workspace start page with your numbers under the composer: activity heatmap, recent chats, usage, files made for you and this month. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import ChatComposer from '../agents/ChatComposer.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { workspace = 'Acme', user = 'Alex Morgan', used = 1284, credits = 2000, onsend }: { workspace?: string; user?: string; used?: number; credits?: number; onsend?: (t: string) => void } = $props();
	let active = $state('new');
	// 26 weeks × 7 days of activity levels 0–4
	const heat = Array.from({ length: 26 * 7 }, (_, i) => Math.floor(((Math.sin(i * 1.7) + Math.cos(i * 0.31) + 2) / 4) * 4.99 * Math.min(1, i / 60)));
	const chats = [['Q3 launch messaging', '2 hours ago'], ['Ad hooks for the linen overshirt', 'Yesterday'], ['Logo usage on partner sites', '3 days ago']];
	const files = [['q3-launch-plan.md', '1 hour ago', '#3b82f6'], ['budget-by-channel.csv', 'Yesterday', '#10b981'], ['competitor-pricing.csv', 'Tue', '#10b981']];
</script>

<AppShell {workspace} {user} nav={CHAT_NAV} bind:active>
	<div class="ui-ao">
		<h1><span class="ui-ao__mark">◧</span> {workspace}</h1>
		<ChatComposer placeholder="Help me brainstorm ideas for…" {onsend} placement="bottom" />
		<div class="ui-ao__grid">
			<div class="ui-ag-card ui-ao__heat"><div class="ui-ag-row"><b class="ui-ag-grow">▦ Activity</b></div><div class="ui-ao__cells" role="img" aria-label="Activity over the last six months">{#each heat as v, i (i)}<i data-v={v}></i>{/each}</div><div class="ui-ag-row"><small class="ui-ag-grow">872 chats · 214 files · 38 automations</small><small>Feb – Nov</small></div></div>
			<div class="ui-ag-card"><div class="ui-ag-row"><b class="ui-ag-grow">◷ Recent chats</b><small>6 more</small></div>{#each chats as [t, w] (t)}<div class="ui-ag-row ui-ao__li"><span class="ui-ag-grow">◌ {t}</span><small>{w}</small></div>{/each}</div>
			<div class="ui-ag-card"><b>◫ Usage</b><div><b class="ui-ao__big">{used.toLocaleString('en-US')}</b> <small>/ {credits.toLocaleString('en-US')} credits</small></div><span class="ui-ag-bar"><i style:width="{(used / credits) * 100}%"></i></span><small>Resets Dec 1</small></div>
			<div class="ui-ag-card"><div class="ui-ag-row"><b class="ui-ag-grow">▤ Files made for you</b><small>11 more</small></div>{#each files as [f, w, c] (f)}<div class="ui-ag-row ui-ao__li"><span class="ui-ag-grow"><span style:color={c}>▮</span> {f}</span><small>{w}</small></div>{/each}</div>
			<div class="ui-ag-card"><b>▦ This month</b><div class="ui-ag-row ui-ao__m"><span><small>Chats</small><b>36</b> <em>+12</em></span><span><small>Files made</small><b>14</b> <em class="ui-ao__neg">−3</em></span></div></div>
		</div>
	</div>
</AppShell>

<style>
	.ui-ao {
		max-width: 560px;
		margin: 0 auto;
		padding: 60px 20px 20px;
		display: grid;
		gap: 16px;
	}
	h1 {
		margin: 0 0 6px;
		text-align: center;
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.ui-ao__mark {
		font-size: 15px;
	}
	.ui-ao__grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
		margin-top: 10px;
	}
	.ui-ag-card {
		padding: 10px;
		display: grid;
		gap: 6px;
		align-content: start;
		grid-column: span 2;
	}
	.ui-ao__heat {
		grid-column: span 4;
	}
	.ui-ao__grid > :nth-child(2) {
		grid-column: span 2;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-ao__cells {
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: repeat(7, 1fr);
		gap: 2px;
	}
	.ui-ao__cells i {
		aspect-ratio: 1;
		border-radius: 1.5px;
		background: color-mix(in srgb, var(--ag-blue) calc(var(--o, 0) * 1%), var(--ag-fill));
	}
	.ui-ao__cells i[data-v='1'] {
		--o: 20;
	}
	.ui-ao__cells i[data-v='2'] {
		--o: 40;
	}
	.ui-ao__cells i[data-v='3'] {
		--o: 65;
	}
	.ui-ao__cells i[data-v='4'] {
		--o: 90;
	}
	.ui-ao__li {
		font-size: 10.5px;
	}
	.ui-ao__big {
		font-size: 15px;
	}
	.ui-ao__m {
		gap: 30px;
	}
	.ui-ao__m span {
		display: grid;
	}
	.ui-ao__m b {
		font-size: 15px;
		display: inline;
	}
	em {
		font-style: normal;
		font-size: 9.5px;
		color: var(--ag-green);
	}
	.ui-ao__neg {
		color: var(--ag-red);
	}
</style>
