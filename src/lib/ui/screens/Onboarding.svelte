<!-- Onboarding – the first-run flow of an AI workspace inside the app: a checklist on the left (workspace, tools, team, first agent) and the current step on the right. -->
<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { CHAT_NAV } from './shell/nav';
	import './shell/screen.css';
	let { user = 'Alex', workspace = 'Acme', oncomplete }: { user?: string; workspace?: string; oncomplete?: () => void } = $props();
	let active = $state('home');
	let step = $state(1);
	let tools = $state([{ n: 'Chat', d: 'Ask your agents from any channel and get their reports there.', c: '#4a154b', on: true }, { n: 'Notes', d: 'Search pages while you chat and save answers as docs.', c: '#171717', on: false }, { n: 'Drive', d: 'Pick files from Drive and let agents read them for context.', c: '#0f9d58', on: false }, { n: 'CRM', d: 'Look up contacts and deals, and log what agents find.', c: '#ff7a59', on: false }, { n: 'Tracker', d: 'Turn requests from chat into issues and follow them to release.', c: '#5e6ad2', on: false }, { n: 'Calendar', d: 'Schedule agent runs and prepare briefs before meetings.', c: '#1a73e8', on: false }]);
	let invites = $state('');
	let agent = $state('Meeting recap');
	const steps = $derived([['Workspace', `${workspace} · 2–10 people`], ['Connect your tools', 'In progress'], ['Invite your team', 'Under a minute'], ['Your first agent', 'About 1 min']]);
	const nav = [{ items: [{ id: 'home', label: 'Home', icon: '⌂' }, { id: 'chat', label: 'Chat', icon: '◎' }, { id: 'an', label: 'Analytics', icon: '▦' }, { id: 'apps', label: 'Integrations', icon: '⊞' }] }, CHAT_NAV[2]];
	const next = () => (step < 3 ? step++ : ((step = 4), oncomplete?.()));
</script>

<AppShell {workspace} user="Alex Morgan" {nav} bind:active>
	<div class="ui-scr__bar"><span class="ui-scr__crumbs">Home / <b>Getting started</b></span></div>
	<div class="ui-onbg">
		<aside>
			<small>Getting started</small>
			<h1>Welcome to {workspace}, {user}</h1>
			<small>A few quick steps – about two minutes.</small>
			<span class="ui-ag-bar"><i style:width="{(Math.min(step, 4) / 4) * 100}%"></i></span>
			<small>{Math.min(step, 4)} of 4 done</small>
			{#each steps as [t, d], i (t)}<button class="ui-onbg__s" aria-current={step === i || undefined} data-done={i < step || undefined} onclick={() => (step = i)}><span class="ui-onbg__c">{i < step ? '✓' : ''}</span><span><b>{t}</b><small>{i < step ? 'Done' : i === step ? 'In progress' : d}</small></span></button>{/each}
			<div class="ui-onbg__help"><span>◎</span><span><b>Need a hand?</b><small>Book a free 15-minute setup call</small></span></div>
		</aside>
		<section>
			{#if step >= 4}
				<div class="ui-scr__empty ui-ag-in"><i>✓</i><b>You're all set</b><span>Your workspace is ready – start a chat or open your first agent.</span></div>
			{:else}
				{#key step}
					<div class="ui-ag-in ui-onbg__step">
						<small>Step {step + 1} of 4</small>
						{#if step === 0}<h2>Your workspace</h2><p class="ui-ag-muted">Name it and say how many people use it.</p><div class="ui-scr__rows"><label class="ui-scr__row"><span><b>Name</b></span><input class="ui-ag-input" value={workspace} /></label><label class="ui-scr__row"><span><b>Team size</b></span><select class="ui-ag-input"><option>2–10 people</option><option>11–50 people</option></select></label></div>
						{:else if step === 1}<h2>Connect your tools</h2><p class="ui-ag-muted">Your agents can read from and act in the apps you connect. Change this anytime.</p><div class="ui-scr__rows">{#each tools as t, i (t.n)}<label class="ui-scr__row"><i class="ui-onbg__ic" style:background={t.c}>{t.n[0]}</i><span><b>{t.n} {#if t.on}<span class="ui-ag-pill" data-tone="green">Connected</span>{/if}</b><small>{t.d}</small></span><input type="checkbox" role="switch" aria-label="Connect {t.n}" checked={t.on} onchange={() => (tools = tools.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} /></label>{/each}</div>
						{:else if step === 2}<h2>Invite your team</h2><p class="ui-ag-muted">They'll get an email to join {workspace}.</p><textarea class="ui-ag-input" rows="3" placeholder="ana@example.com, sam@example.com" aria-label="Email addresses" bind:value={invites}></textarea>
						{:else}<h2>Your first agent</h2><p class="ui-ag-muted">Pick one to start with – you can add more later.</p><div class="ui-scr__rows" role="radiogroup" aria-label="First agent">{#each ['Meeting recap', 'Inbox triage', 'Weekly report'] as a (a)}<label class="ui-scr__row"><input type="radio" name="agent" value={a} bind:group={agent} /><span><b>{a}</b></span></label>{/each}</div>{/if}
						<div class="ui-ag-row"><button class="ui-ag-btn" data-variant="ghost" onclick={next}>Skip for now</button><span class="ui-ag-grow"></span>{#if step > 0}<button class="ui-ag-btn" onclick={() => step--}>‹ Back</button>{/if}<button class="ui-ag-btn" data-variant="primary" onclick={next}>{step === 3 ? 'Finish' : 'Continue ›'}</button></div>
					</div>
				{/key}
			{/if}
		</section>
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-onbg {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 30px;
		padding: 30px 40px;
	}
	aside {
		display: grid;
		gap: 6px;
		align-content: start;
	}
	h1 {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
	}
	h2 {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
	}
	.ui-onbg__s {
		display: flex;
		gap: 8px;
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		text-align: left;
		padding: 6px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-onbg__s span:last-child {
		display: grid;
	}
	.ui-onbg__s[aria-current] {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
	.ui-onbg__c {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.3px var(--ag-subtle);
		display: grid;
		place-items: center;
		font-size: 8px;
		flex: none;
		margin-top: 1px;
	}
	.ui-onbg__s[data-done] .ui-onbg__c {
		box-shadow: none;
		background: var(--ag-fill);
	}
	.ui-onbg__help {
		display: flex;
		gap: 8px;
		margin-top: 20px;
	}
	.ui-onbg__help span:last-child {
		display: grid;
	}
	.ui-onbg__step {
		display: grid;
		gap: 10px;
	}
	.ui-onbg__step p {
		margin: -6px 0 0;
	}
	.ui-onbg__ic {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		color: #fff;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 9px;
		font-weight: 600;
		flex: none;
	}
	.ui-onbg__step .ui-scr__row > span:nth-of-type(1) {
		flex: 1;
		display: grid;
	}
</style>
