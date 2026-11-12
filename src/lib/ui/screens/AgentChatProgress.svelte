<!-- AI Chat / Progress – a plain chat with what the assistant is doing beside it: progress steps, the outputs it made and what it used in this session. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import ChatComposer from '../agents/ChatComposer.svelte';
	import ToolCallCard from '../components/ToolCallCard.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { onsend }: { onsend?: (t: string) => void } = $props();
	let active = $state('follow');
	let open = $state({ progress: true, outputs: true, used: true });
	const nav = [CHAT_NAV[0], CHAT_NAV[1], { label: 'Projects', items: [CHAT_NAV[2].items[0], { id: 'follow', label: 'Follow-up after sales calls', indent: true }, ...CHAT_NAV[2].items.slice(1)] }, CHAT_NAV[3]];
	const outputs = [['Northwind – follow-up email', 'Docs', '#3b82f6'], ['Team Directory', 'Sheets', '#10b981'], ['Offer template.docx', 'Word', '#2563eb'], ['call-notes-summary.md', 'Markdown', '#737373']];
	const used = [['⇪ Uploads', 'call-screenshot.png +1'], ['⛓ Connectors', 'Notes · Drive · Chat'], ['⊕ Web search', '2 pages'], ['✦ Skills', 'sales-follow-up']];
</script>

{#snippet progress()}
	<div class="ui-scr__panel">
		<button class="ui-acp__h" aria-expanded={open.progress} onclick={() => (open.progress = !open.progress)}>Progress ⌄</button>
		{#if open.progress}<div class="ui-acp__steps"><small>3 earlier steps</small><span>Draft a test email for Northwind</span><span class="ui-acp__now">◉ Fix how team and customer are told apart</span></div>{/if}
		<button class="ui-acp__h" aria-expanded={open.outputs} onclick={() => (open.outputs = !open.outputs)}>Outputs ⌄</button>
		{#if open.outputs}<div class="ui-ag-card ui-acp__doc"><b>Northwind: follow-up</b><small>Thanks for the demo today – here is what we agreed on and the offer we promised.</small><i></i><i></i></div>{#each outputs as [n, k, c] (n)}<div class="ui-ag-row"><span style:color={c}>▮</span><span class="ui-ag-grow">{n}</span><small>{k}</small></div>{/each}{/if}
		<button class="ui-acp__h" aria-expanded={open.used} onclick={() => (open.used = !open.used)}>Used in this session ⌄</button>
		{#if open.used}{#each used as [n, v] (n)}<div class="ui-ag-row"><span class="ui-ag-grow">{n}</span><small>{v}</small></div>{/each}{/if}
	</div>
{/snippet}

<AppShell {nav} bind:active aside={progress} cards={false}>
	<div class="ui-scr__chat">
		<div class="ui-scr__msg">Can you automate the follow-up after our sales calls? The notes are in Notes, the team list is in Drive.</div>
		<ToolCallCard name="notes.search" summary="Searched your call notes" status="success" duration={4200} />
		<div class="ui-scr__ai"><p>I read your last twelve call notes. Every follow-up has the same three parts: a thank-you, the next step you agreed on and the offer as a link.</p><ToolCallCard name="drive.read_file" summary="Read Team Directory (Meetings)" status="success" duration={1800} /><p><b>What happens after each call now:</b></p><ul><li>The notes are read as soon as the call ends</li><li>Everyone in the Team Directory counts as your side, the rest as the customer</li><li>A follow-up email is drafted from the offer template and waits in Chat for your OK</li></ul></div>
		<div class="ui-scr__msg">Why did the first draft treat Jo from our team as the customer?</div>
		<ToolCallCard name="directory.match_people" summary="Checked the call's people against the team list" status="success" duration={2600} />
		<div class="ui-scr__ai"><p>Jo joined the call with a personal email address, and only work addresses were in the Team Directory. I added Jo's address there – the next draft counts Jo as your side.</p></div>
	</div>
	<div class="ui-scr__compose"><ChatComposer placeholder="Reply…" {onsend} placement="top" /></div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	ul {
		margin: 0;
		padding-left: 16px;
		line-height: 1.7;
	}
	.ui-acp__h {
		all: unset;
		cursor: pointer;
		font-weight: 500;
		margin-top: 4px;
	}
	.ui-acp__steps {
		display: grid;
		gap: 6px;
		padding-left: 10px;
		border-left: 1px solid var(--ag-line);
		color: var(--ag-muted);
	}
	.ui-acp__now {
		color: var(--ag-ink);
	}
	.ui-acp__doc {
		padding: 10px 12px;
		display: grid;
		gap: 4px;
		font-family: Georgia, serif;
	}
	.ui-acp__doc i {
		height: 3px;
		border-radius: 2px;
		background: var(--ag-fill);
	}
</style>
