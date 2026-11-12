<!-- Settings / General – workspace settings: icon, name and address as rows, company context for every chat, and a danger zone with a confirm step. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let { name = $bindable('Acme'), slug = $bindable('acme'), context = $bindable(''), ondelete }: { name?: string; slug?: string; context?: string; ondelete?: () => void } = $props();
	let confirm = $state('');
	let asking = $state(false);
	const slugOk = $derived(/^[a-z0-9-]+$/.test(slug));
</script>

<SettingsShell page="general" title="General" subtitle="Set up the basics of your workspace.">
	<div class="ui-scr__rows">
		<div class="ui-scr__row"><span><b>Workspace icon</b><small>Square, PNG or JPEG, up to 512 KB</small></span><span class="ui-ag-avatar">{name[0] ?? 'A'}</span><button class="ui-ag-btn">⇪ Upload</button></div>
		<label class="ui-scr__row"><span><b>Workspace name</b><small>Shown in the sidebar and in invites</small></span><input class="ui-ag-input" bind:value={name} /></label>
		<label class="ui-scr__row"><span><b>Workspace URL</b><small>{slugOk ? 'Changing it breaks links people have saved' : 'Lowercase letters, numbers and dashes'}</small></span><span class="ui-ag-input ui-sg__url"><span class="ui-ag-muted">app.example.com/</span><input bind:value={slug} aria-label="Workspace URL" aria-invalid={!slugOk} /></span></label>
	</div>
	<h2>Company context</h2>
	<p class="ui-scr__sub">Added to every chat in this workspace, so the assistant already knows how your company works. Keep it short – it counts toward every message.</p>
	<textarea class="ui-ag-input" rows="4" maxlength="2000" aria-label="Company context" placeholder="E.g. We have three business units – Sales, Operations and Finance. Common terms: CRM (customer relationship management)…" bind:value={context}></textarea>
	<small>Two or three short paragraphs work best: what the company does, how it's organised and the terms people use. {context.length}/2,000</small>
	<h2>Danger zone</h2>
	<div class="ui-scr__rows">
		<div class="ui-scr__row"><span><b>Delete workspace</b><small>All chats, files and agents of {name} go for good, for every member.</small></span>{#if !asking}<button class="ui-ag-btn" data-variant="danger" onclick={() => (asking = true)}>🗑 Delete workspace</button>{/if}</div>
		{#if asking}<div class="ui-scr__row ui-ag-in"><span><small>Type <b>{name}</b> to confirm</small><input class="ui-ag-input" aria-label="Type the workspace name to confirm" bind:value={confirm} /></span><button class="ui-ag-btn" data-variant="ghost" onclick={() => ((asking = false), (confirm = ''))}>Cancel</button><button class="ui-ag-btn" data-variant="danger" disabled={confirm !== name} onclick={() => ondelete?.()}>Delete for good</button></div>{/if}
	</div>
</SettingsShell>

<style>
	.ui-sg__url {
		display: flex;
		align-items: center;
		width: 200px !important;
	}
	.ui-sg__url input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		color: var(--ag-ink);
	}
	textarea {
		resize: vertical;
	}
</style>
