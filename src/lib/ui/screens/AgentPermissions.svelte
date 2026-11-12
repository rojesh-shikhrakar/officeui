<!-- Agent / Permissions – what your agent may do without asking: one choice on top (Careful, Balanced, Hands-off), each app with what it does on its own, asks before or never does, and the red lines. -->
<script lang="ts" module>
	export type Level = 'own' | 'ask' | 'never';
	export type AppPerm = { name: string; account: string; color: string; actions: { name: string; level: Level; limit?: string }[] };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	const A = (name: string, account: string, color: string, levels: Level[], names: string[]): AppPerm => ({ name, account, color, actions: levels.map((level, i) => ({ name: names[i] ?? `Action ${i + 1}`, level })) });
	let {
		apps = $bindable([
			A('Mail', 'alex@fieldwork.co', '#ea4335', ['own', 'ask', 'never'], ['Read email', 'Send email', 'Delete email']),
			A('Chat', 'Fieldwork workspace', '#4a154b', ['own', 'own', 'ask', 'never'], ['Read channels', 'Post in threads', 'Post in channels', 'Post in #general']),
			A('Repo', 'fieldwork-labs', '#24292f', ['own', 'own', 'ask', 'never'], ['Read code', 'Open pull requests', 'Merge', 'Force-push']),
			A('Drive', 'Shared drive · Clients', '#0f9d58', ['own', 'own', 'ask', 'never'], ['Read files', 'Create files', 'Share files', 'Delete files']),
			{ name: 'Payments', account: 'Fieldwork GmbH', color: '#635bff', actions: [{ name: 'Read payments', level: 'own' }, { name: 'Issue refunds', level: 'own', limit: '50 €' }, { name: 'Change prices', level: 'never' }] },
			A('Calendar', 'alex@fieldwork.co', '#1a73e8', ['own', 'own', 'ask'], ['Read events', 'Create events', 'Invite people']),
			A('Web', 'Browser', '#ec4899', ['own', 'ask', 'never'], ['Browse', 'Fill forms', 'Buy things'])
		] as AppPerm[]),
		preset = $bindable<'Careful' | 'Balanced' | 'Hands-off'>('Balanced')
	}: { apps?: AppPerm[]; preset?: 'Careful' | 'Balanced' | 'Hands-off' } = $props();
	let active = $state('permissions');
	let sel = $state('Payments');
	const all = $derived(apps.flatMap((a) => a.actions));
	const cnt = (l: Level) => all.filter((a) => a.level === l).length;
	const cur = $derived(apps.find((a) => a.name === sel));
	function setPreset(p: typeof preset) {
		preset = p;
		apps = apps.map((a) => ({ ...a, actions: a.actions.map((x, i) => (x.level === 'never' ? x : { ...x, level: p === 'Careful' ? (i === 0 ? 'own' : 'ask') : p === 'Hands-off' ? 'own' : x.level })) }));
	}
	const setLevel = (app: string, act: string, level: Level) => (apps = apps.map((a) => (a.name !== app ? a : { ...a, actions: a.actions.map((x) => (x.name === act ? { ...x, level } : x)) })));
	const labels: Record<Level, string> = { own: 'On its own', ask: 'Asks before', never: 'Never' };
</script>

{#snippet detail()}
	{#if cur}
		<div class="ui-scr__tabs"><span class="ui-scr__tab"><i class="ui-prm__ic" style:background={cur.color}>{cur.name[0]}</i> {cur.name}</span></div>
		<div class="ui-scr__panel">
			<div class="ui-ag-row"><i class="ui-prm__ic ui-prm__big" style:background={cur.color}>{cur.name[0]}</i><span><b>{cur.name}</b><small>{cur.account}</small></span></div>
			{#each cur.actions as x (x.name)}<div class="ui-ag-card ui-prm__act"><div class="ui-ag-row"><span class="ui-ag-grow">{x.name}</span><select class="ui-ag-input" aria-label="{x.name} permission" value={x.level} onchange={(e) => setLevel(cur.name, x.name, e.currentTarget.value as Level)}>{#each Object.entries(labels) as [k, l] (k)}<option value={k}>{l}</option>{/each}</select></div>{#if x.limit && x.level === 'own'}<small>On its own up to <b>{x.limit}</b>, asks above</small>{/if}</div>{/each}
			<small class="ui-scr__k">Lately</small>
			{#each [['Refund 38 € to Hannah Kim – charged twice', 'Done'], ['Refund 240 € to Lumen Studio', 'Approved'], ['Refund 12 € to Jo Park', 'Done']] as [t, s] (t)}<div class="ui-ag-row"><span class="ui-ag-grow">{t}</span><span class="ui-ag-pill" data-tone={s === 'Approved' ? 'blue' : 'gray'}>{s}</span></div>{/each}
		</div>
	{/if}
{/snippet}

<AppShell workspace="Fieldwork" nav={AGENT_NAV} bind:active cards={false} aside={detail} asideWidth={240}>
	<div class="ui-scr__bar"><b>Permissions</b></div>
	<div class="ui-scr ui-prm">
		<p class="ui-scr__sub">What your agent – and every agent it starts – may do without asking first</p>
		<small>How much it does on its own</small>
		<div class="ui-ag-card ui-prm__presets" role="radiogroup" aria-label="How much it does on its own">
			{#each [['Careful', 'Reads on its own, asks before it changes anything'], ['Balanced', 'Works on its own, asks before anything that needs care'], ['Hands-off', 'Does everything on its own – except the red lines']] as [p, d] (p)}<button role="radio" aria-checked={preset === p} onclick={() => setPreset(p as typeof preset)}><b>{p}</b><small>{d}</small></button>{/each}
			<div class="ui-prm__sum"><span>Does <b>{cnt('own')}</b> things on its own · asks before <b>{cnt('ask')}</b> · never does <b>{cnt('never')}</b></span><span class="ui-prm__bar"><i style:flex={cnt('own')} data-l="own"></i><i style:flex={cnt('ask')} data-l="ask"></i><i style:flex={cnt('never')} data-l="never"></i></span></div>
		</div>
		<small>Apps {apps.length}</small>
		<div class="ui-scr__rows">{#each apps as a (a.name)}{@const o = a.actions.filter((x) => x.level === 'own').length}{@const k = a.actions.filter((x) => x.level === 'ask').length}<button class="ui-scr__row ui-prm__app" aria-current={sel === a.name || undefined} onclick={() => (sel = a.name)}><i class="ui-prm__ic" style:background={a.color}>{a.name[0]}</i><span><b>{a.name}</b><small>{a.account}</small></span><span class="ui-prm__mini"><i style:flex={o} data-l="own"></i><i style:flex={k} data-l="ask"></i></span><small>{o} on its own · asks before {k} · never {a.actions.length - o - k}</small></button>{/each}</div>
		<small>⊘ Red lines · these always ask – or never happen – whatever you pick above</small>
		<div class="ui-scr__rows">{#each apps.flatMap((a) => a.actions.filter((x) => x.level === 'never').map((x) => [a, x] as const)).slice(0, 4) as [a, x] (a.name + x.name)}<div class="ui-scr__row"><span><b>{x.name}</b><small>{a.name}</small></span><small>⊘ Never</small></div>{/each}</div>
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
	.ui-prm {
		max-width: 460px;
	}
	.ui-prm__presets {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		padding: 4px;
		background: var(--ag-fill);
	}
	.ui-prm__presets button {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		padding: 8px 10px;
		border-radius: 8px;
		display: grid;
		gap: 3px;
		cursor: pointer;
	}
	.ui-prm__presets button[aria-checked='true'] {
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
	}
	.ui-prm__sum {
		grid-column: 1 / -1;
		padding: 6px 8px;
		display: grid;
		gap: 6px;
		color: var(--ag-muted);
	}
	.ui-prm__bar,
	.ui-prm__mini {
		display: flex;
		gap: 2px;
		height: 3px;
	}
	.ui-prm__mini {
		width: 30px;
	}
	.ui-prm__bar i,
	.ui-prm__mini i {
		border-radius: 2px;
	}
	[data-l='own'] {
		background: var(--ag-blue);
	}
	[data-l='ask'] {
		background: var(--ag-amber);
	}
	[data-l='never'] {
		background: var(--ag-line);
	}
	.ui-prm__app {
		width: 100%;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-prm__app[aria-current] {
		background: var(--ag-fill);
	}
	.ui-prm__app > span:nth-of-type(1) {
		flex: 1;
		display: grid;
	}
	.ui-prm__ic {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		color: #fff;
		display: inline-grid;
		place-items: center;
		font-style: normal;
		font-size: 9px;
		font-weight: 600;
		flex: none;
	}
	.ui-prm__big {
		width: 26px;
		height: 26px;
		font-size: 12px;
	}
	.ui-prm__act {
		padding: 8px 10px;
		display: grid;
		gap: 4px;
	}
	.ui-prm__act select {
		width: 100px;
	}
</style>
