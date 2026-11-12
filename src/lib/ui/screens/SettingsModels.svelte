<!-- Settings / Models – default chat and image models with how Auto works, then every model by provider with who may use it and an on/off switch. -->
<script lang="ts" module>
	export type ModelRow = { name: string; provider: string; kind: 'Chat' | 'Image'; who: string; on: boolean; host: string };
</script>

<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	const M = (name: string, provider: string, kind: ModelRow['kind'], on = true, who = 'Everyone'): ModelRow => ({ name, provider, kind, who, on, host: `Hosted by ${provider} in the EU` });
	let {
		chat = $bindable('Auto'),
		image = $bindable('Canvas Image 2'),
		models = $bindable([M('Atlas Max', 'Atlas Labs', 'Chat'), M('Atlas Pro', 'Atlas Labs', 'Chat'), M('Atlas Mini', 'Atlas Labs', 'Chat'), M('Orbit Pro', 'Orbit AI', 'Chat'), M('Orbit Mini', 'Orbit AI', 'Chat', false, 'Admins'), M('Prism Ultra', 'Prism', 'Chat', false), M('Canvas Image 2', 'Orbit AI', 'Image')] as ModelRow[])
	}: { chat?: string; image?: string; models?: ModelRow[] } = $props();
	let tab = $state('All');
	let q = $state('');
	let folded = $state<Set<string>>(new Set());
	const shown = $derived(models.filter((m) => (tab === 'All' || m.kind === tab) && m.name.toLowerCase().includes(q.toLowerCase())));
	const providers = $derived([...new Set(shown.map((m) => m.provider))]);
	const upd = (n: string, p: Partial<ModelRow>) => (models = models.map((m) => (m.name === n ? { ...m, ...p } : m)));
	const fold = (p: string) => {
		const s = new Set(folded);
		if (s.has(p)) s.delete(p);
		else s.add(p);
		folded = s;
	};
</script>

<SettingsShell page="models" title="Models" subtitle="Choose the models people in your workspace can use.">
	<h2>Defaults</h2>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Chat model</b><small>Every new chat starts with it. People can pick their own in their preferences.</small></span><select class="ui-ag-input" bind:value={chat}><option>Auto</option>{#each models.filter((m) => m.kind === 'Chat' && m.on) as m (m.name)}<option>{m.name}</option>{/each}</select></label>
		{#if chat === 'Auto'}<div class="ui-scr__row ui-smo__auto"><span><b>How Auto works</b><small>Auto picks the model and how long it thinks for each message – the strongest one for hard questions, a fast one for quick replies.</small><small>✓ The best answer for what it costs</small><small>✓ Only models you've turned on, hosted in the EU first</small></span><span class="ui-smo__wheel">{#each models.filter((m) => m.kind === 'Chat' && m.on).slice(0, 4) as m, i (m.name)}<span style:opacity={i === 1 ? 1 : 0.4}>{m.name}</span>{/each}</span></div>{/if}
		<label class="ui-scr__row"><span><b>Image model</b><small>Used when someone asks for a picture</small></span><select class="ui-ag-input" bind:value={image}>{#each models.filter((m) => m.kind === 'Image') as m (m.name)}<option>{m.name}</option>{/each}</select></label>
	</div>
	<div class="ui-ag-row"><div class="ui-ag-tabs ui-ag-grow" role="tablist">{#each ['All', 'Chat', 'Image'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t)}>{t}</button>{/each}</div><input class="ui-ag-input ui-smo__q" placeholder="⌕ Search models…" aria-label="Search models" bind:value={q} /></div>
	<small>🇪🇺 <b>Hosted in the EU</b> · Zero data retention, data stays in Frankfurt</small>
	{#each providers as p (p)}
		{@const list = shown.filter((m) => m.provider === p)}
		<div class="ui-scr__rows">
			<button class="ui-scr__row ui-smo__prov" aria-expanded={!folded.has(p)} onclick={() => fold(p)}><span><b>✳ {p}</b></span><span class="ui-ag-pill" data-tone="gray">{list.filter((m) => m.on).length}/{list.length} on</span><span>{folded.has(p) ? '⌄' : '⌃'}</span></button>
			{#if !folded.has(p)}{#each list as m (m.name)}<div class="ui-scr__row"><span><b>{m.name}</b><small>{m.host}</small></span><select class="ui-ag-input ui-smo__who" aria-label="Who can use {m.name}" value={m.who} onchange={(e) => upd(m.name, { who: e.currentTarget.value })}><option>Everyone</option><option>Admins</option></select><input type="checkbox" role="switch" aria-label="{m.name} on" checked={m.on} onchange={() => upd(m.name, { on: !m.on })} /></div>{/each}{/if}
		</div>
	{/each}
</SettingsShell>

<style>
	b {
		font-weight: 500;
	}
	.ui-smo__auto {
		margin: 0 10px 8px;
		border-radius: 8px;
		background: var(--ag-fill);
	}
	.ui-smo__wheel {
		display: grid;
		gap: 4px;
		text-align: center;
		font-size: 10.5px;
	}
	.ui-smo__q {
		width: 150px;
	}
	.ui-smo__prov {
		width: 100%;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.ui-smo__who {
		width: 100px !important;
	}
</style>
