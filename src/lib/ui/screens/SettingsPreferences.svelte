<!-- Settings / Preferences – personal preferences: default chat and image models with an Auto nudge, language, appearance, app actions, chat tools and custom instructions. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let { model = $bindable('Atlas Pro'), image = $bindable('Canvas Image 2'), language = $bindable('English'), appearance = $bindable<'System' | 'Light' | 'Dark'>('System'), appActions = $bindable(false), instructions = $bindable('') }: { model?: string; image?: string; language?: string; appearance?: 'System' | 'Light' | 'Dark'; appActions?: boolean; instructions?: string } = $props();
	let tools = $state({ 'Web search': [true, 'Looks things up when it needs fresh facts'], 'Image generation': [true, 'Draws pictures when you ask for one'], Memory: [false, 'Remembers things you tell it across chats'] } as Record<string, [boolean, string]>);
</script>

<SettingsShell page="preferences" title="Preferences" subtitle="Make the assistant work the way you do.">
	<h2>Models</h2>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Default model</b><small>Picked whenever you start a new chat</small></span><select class="ui-ag-input" bind:value={model}>{#each ['Auto', 'Atlas Max', 'Atlas Pro', 'Atlas Mini'] as m (m)}<option>{m}</option>{/each}</select></label>
		{#if model !== 'Auto'}<div class="ui-scr__row ui-spf__nudge"><span><b>✦ Get more out of your plan with Auto</b><small>It picks the right model for each message, so quick questions don't use up your credits.</small></span><button class="ui-ag-btn" data-variant="primary" onclick={() => (model = 'Auto')}>Switch to Auto</button></div>{/if}
		<label class="ui-scr__row"><span><b>Image model</b><small>Used when you ask for a picture</small></span><select class="ui-ag-input" bind:value={image}><option>Canvas Image 2</option><option>Canvas Image 1</option></select></label>
	</div>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Language</b><small>For menus and the assistant's answers</small></span><select class="ui-ag-input" bind:value={language}>{#each ['English', 'Deutsch', 'Français', 'Español'] as l (l)}<option>{l}</option>{/each}</select></label>
		<div class="ui-scr__row"><span><b>Appearance</b><small>{appearance === 'System' ? 'System follows your device' : `Always ${appearance.toLowerCase()}`}</small></span><div class="ui-ag-tabs" role="radiogroup" aria-label="Appearance">{#each ['System', 'Light', 'Dark'] as a (a)}<button class="ui-ag-tab" role="radio" aria-checked={appearance === a} onclick={() => (appearance = a as typeof appearance)}>{a}</button>{/each}</div></div>
	</div>
	<div class="ui-scr__rows"><label class="ui-scr__row"><span><b>Find app actions on its own <span class="ui-ag-pill" data-tone="gray">Beta</span></b><small>The chat can use connected apps without you tagging them first</small></span><input type="checkbox" role="switch" bind:checked={appActions} /></label></div>
	<h2>Chat tools</h2>
	<p class="ui-scr__sub">Extra tools for your own chats. Agents bring their own.</p>
	<div class="ui-spf__tools">{#each Object.entries(tools) as [t, [on, d]] (t)}<label class="ui-ag-card"><span class="ui-ag-row"><b class="ui-ag-grow">{t}</b><input type="checkbox" checked={on} onchange={() => (tools[t] = [!on, d])} /></span><small>{d}</small></label>{/each}</div>
	<h2>Custom instructions</h2>
	<p class="ui-scr__sub">Added to every message you send, so you don't have to repeat yourself.</p>
	<textarea class="ui-ag-input" rows="3" aria-label="Custom instructions" bind:value={instructions} placeholder="E.g. Answer in bullet points and suggest a next step."></textarea>
</SettingsShell>

<style>
	.ui-spf__nudge {
		margin: 0 10px;
		border-radius: 8px;
		background: var(--ag-fill);
	}
	.ui-spf__tools {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.ui-spf__tools label {
		padding: 10px;
		display: grid;
		gap: 4px;
		cursor: pointer;
	}
	.ui-spf__tools b {
		font-weight: 500;
	}
</style>
