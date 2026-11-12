<!-- Command Menu – search and run anything from one field: tool actions with marks and Ctrl 1–5, everyday commands, Tab to jump between sections. -->
<script lang="ts" module>
	export type Command = { id: string; label: string; hint?: string; section: string; color?: string };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		commands = [
			{ id: 'mail', label: 'Write an email', hint: 'Mail', section: 'Suggestions', color: '#ea4335' },
			{ id: 'ask', label: 'Ask assistant', hint: 'Summaries, drafts, answers', section: 'Suggestions', color: '#2f6bff' },
			{ id: 'task', label: 'Create a task', hint: 'Tasks', section: 'Suggestions', color: '#7c5cff' },
			{ id: 'crm', label: 'Add contact to CRM', hint: 'CRM', section: 'Suggestions', color: '#ff7a59' },
			{ id: 'meet', label: 'Schedule a meeting', hint: 'Calendar', section: 'Suggestions', color: '#4285f4' },
			{ id: 'post', label: 'Post an update', hint: '#team-updates', section: 'Share', color: '#e01e5a' },
			{ id: 'page', label: 'Save as page', hint: 'Notes · Meeting notes', section: 'Share', color: '#171717' },
			{ id: 'doc', label: 'New document', section: 'General' },
			{ id: 'settings', label: 'Open settings', section: 'General' }
		],
		onrun
	}: { commands?: Command[]; onrun?: (c: Command) => void } = $props();
	let query = $state('');
	let active = $state(0);
	let ran = $state<string | null>(null);
	let list: HTMLDivElement;
	const shown = $derived(commands.filter((c) => (c.label + ' ' + (c.hint ?? '')).toLowerCase().includes(query.toLowerCase())));
	const sections = $derived([...new Set(shown.map((c) => c.section))]);
	function run(c: Command | undefined) {
		if (!c) return;
		ran = c.label;
		onrun?.(c);
	}
	function keydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') (e.preventDefault(), (active = Math.min(shown.length - 1, active + 1)));
		else if (e.key === 'ArrowUp') (e.preventDefault(), (active = Math.max(0, active - 1)));
		else if (e.key === 'Enter') (e.preventDefault(), run(shown[active]));
		else if (e.key === 'Tab') {
			e.preventDefault();
			const sec = shown[active]?.section;
			const next = shown.findIndex((c, i) => i > active && c.section !== sec);
			active = next >= 0 ? next : 0;
		} else if ((e.ctrlKey || e.metaKey) && /^[1-5]$/.test(e.key)) (e.preventDefault(), run(shown.filter((c) => c.section === 'Suggestions')[+e.key - 1]));
	}
	$effect(() => {
		void active;
		list?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div class="ui-ag ui-ag-panel ui-cmd" role="dialog" aria-label="Command menu">
	<div class="ui-cmd__search"><span>⌕</span><input bind:value={query} placeholder="Type a command or search…" aria-label="Command" role="combobox" aria-expanded="true" aria-controls="ui-cmd-list" oninput={() => (active = 0)} onkeydown={keydown} /></div>
	<div class="ui-cmd__list" id="ui-cmd-list" role="listbox" bind:this={list}>
		{#each sections as s (s)}
			<small class="ui-cmd__sec">{s}</small>
			{#each shown.filter((c) => c.section === s) as c, k (c.id)}
				{@const i = shown.indexOf(c)}
				<div class="ui-cmd__item" role="option" tabindex="-1" aria-selected={i === active} data-active={i === active || undefined} onpointermove={() => (active = i)} onclick={() => run(c)} onkeydown={() => {}}>
					<i style:background={c.color ?? 'var(--ag-fill)'}></i><span>{c.label}</span><small>{c.hint ?? ''}</small>
					{#if s === 'Suggestions' && k < 5}<span class="ui-cmd__keys"><span class="ui-ag-kbd">Ctrl</span><span class="ui-ag-kbd">{k + 1}</span></span>{/if}
				</div>
			{/each}
		{:else}<p class="ui-ag-muted ui-cmd__sec">No results for “{query}”</p>{/each}
	</div>
	<div class="ui-cmd__foot">{#if ran}<span class="ui-ag-in">✓ {ran}</span>{:else}<span><span class="ui-ag-kbd">Tab</span> to jump between sections</span>{/if}<span><span class="ui-ag-kbd">Ctrl</span> <span class="ui-ag-kbd">K</span> to open</span></div>
</div>

<style>
	.ui-cmd {
		max-width: 470px;
		font-size: 12.5px;
	}
	.ui-cmd__search {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 10px 14px;
		border-bottom: 1px solid var(--ag-line);
		color: var(--ag-subtle);
	}
	.ui-cmd__search input {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-cmd__list {
		max-height: 270px;
		overflow-y: auto;
		padding: 4px;
	}
	.ui-cmd__sec {
		display: block;
		padding: 8px 8px 3px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-cmd__item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-cmd__item[data-active] {
		background: var(--ag-fill);
	}
	.ui-cmd__item i {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		flex: none;
	}
	.ui-cmd__item small {
		color: var(--ag-muted);
	}
	.ui-cmd__keys {
		margin-left: auto;
		display: flex;
		gap: 3px;
	}
	.ui-cmd__foot {
		display: flex;
		justify-content: space-between;
		padding: 7px 12px;
		border-top: 1px solid var(--ag-line);
		color: var(--ag-muted);
		font-size: 11px;
	}
</style>
