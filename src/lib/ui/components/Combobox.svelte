<!-- Combobox – pick one or many from a searchable, grouped list: chips with avatars, highlighted matches, create on the fly and full keyboard. -->
<script lang="ts" module>
	export type ComboOption = { value: string; label: string; hint?: string; group: string };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		label = 'Reviewers',
		placeholder = 'Add reviewers…',
		options = $bindable([
			{ value: 'mc', label: 'Maya Chen', hint: 'Product Designer', group: 'Design' },
			{ value: 'jw', label: 'Jonas Weber', hint: 'Design Lead', group: 'Design' },
			{ value: 'pr', label: 'Priya Raman', hint: 'Brand Designer', group: 'Design' },
			{ value: 'so', label: 'Sara Okafor', hint: 'Staff Engineer', group: 'Engineering' },
			{ value: 'lm', label: 'Leo Martins', hint: 'Frontend', group: 'Engineering' },
			{ value: 'np', label: 'Nina Petrova', hint: 'Backend', group: 'Engineering' },
			{ value: 'tb', label: 'Tom Becker', hint: 'iOS', group: 'Engineering' },
			{ value: 'al', label: 'Ana Lopez', hint: 'PM', group: 'Product' }
		]),
		value = $bindable<string[]>([]),
		multiple = true,
		creatable = true,
		/** Show the list from the start, like the original's preview */
		startOpen = true
	}: { label?: string; placeholder?: string; options?: ComboOption[]; value?: string[]; multiple?: boolean; creatable?: boolean; startOpen?: boolean } = $props();
	const uid = $props.id();
	let query = $state('');
	// svelte-ignore state_referenced_locally
	let open = $state(startOpen);
	let active = $state(0);
	let root: HTMLDivElement;
	const filtered = $derived(options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()) || o.hint?.toLowerCase().includes(query.toLowerCase())));
	const canCreate = $derived(creatable && query.trim() && !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()));
	const groups = $derived([...new Set(filtered.map((o) => o.group))]);
	const initials = (s: string) => s.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
	function toggle(v: string) {
		value = value.includes(v) ? value.filter((x) => x !== v) : multiple ? [...value, v] : [v];
		if (!multiple) open = false;
		query = '';
	}
	function create() {
		const l = query.trim();
		const o = { value: l.toLowerCase().replace(/\s+/g, '-'), label: l, hint: 'New', group: 'Added' };
		options = [...options, o];
		toggle(o.value);
	}
	function keydown(e: KeyboardEvent) {
		const n = filtered.length + (canCreate ? 1 : 0);
		if (e.key === 'ArrowDown') (e.preventDefault(), (open = true), (active = (active + 1) % Math.max(n, 1)));
		else if (e.key === 'ArrowUp') (e.preventDefault(), (active = (active - 1 + n) % Math.max(n, 1)));
		else if (e.key === 'Enter' && open) {
			e.preventDefault();
			if (active < filtered.length) toggle(filtered[active].value);
			else if (canCreate) create();
		} else if (e.key === 'Escape') open = false;
		else if (e.key === 'Backspace' && !query && value.length) value = value.slice(0, -1);
	}
	const mark = (s: string) => {
		const i = s.toLowerCase().indexOf(query.toLowerCase());
		return query && i >= 0 ? [s.slice(0, i), s.slice(i, i + query.length), s.slice(i + query.length)] : [s, '', ''];
	};
</script>

<svelte:document onpointerdown={(e) => open && !root.contains(e.target as Node) && (open = false)} />

<div class="ui-ag ui-cbx" bind:this={root}>
	<label for="{uid}-in">{label}</label>
	<div class="ui-cbx__box" data-open={open || undefined}>
		{#each value as v (v)}{@const o = options.find((x) => x.value === v)}<span class="ui-cbx__chip"><span class="ui-ag-avatar">{initials(o?.label ?? v)}</span>{o?.label ?? v}<button aria-label="Remove {o?.label}" onclick={() => toggle(v)}>×</button></span>{/each}
		<input id="{uid}-in" role="combobox" aria-expanded={open} aria-controls="{uid}-list" aria-autocomplete="list" bind:value={query} {placeholder} onfocus={() => (open = true)} oninput={() => ((open = true), (active = 0))} onkeydown={keydown} />
		<span class="ui-ag-muted">{open ? '⌃' : '⌄'}</span>
	</div>
	{#if open}
		<div class="ui-cbx__list ui-ag-in" id="{uid}-list" role="listbox" aria-multiselectable={multiple}>
			{#each groups as g (g)}
				<small class="ui-cbx__g">{g}</small>
				{#each filtered.filter((o) => o.group === g) as o (o.value)}
					{@const i = filtered.indexOf(o)}
					{@const [a, b, c] = mark(o.label)}
					<div class="ui-cbx__opt" role="option" tabindex="-1" aria-selected={value.includes(o.value)} data-active={i === active || undefined} onpointermove={() => (active = i)} onclick={() => toggle(o.value)} onkeydown={() => {}}>
						<span class="ui-ag-avatar">{initials(o.label)}</span><span>{a}<mark>{b}</mark>{c}</span><small>{o.hint}</small>{#if value.includes(o.value)}<span class="ui-cbx__tick">✓</span>{/if}
					</div>
				{/each}
			{/each}
			{#if canCreate}<div class="ui-cbx__opt" role="option" tabindex="-1" aria-selected="false" data-active={active === filtered.length || undefined} onclick={create} onkeydown={() => {}}>+ Create “{query.trim()}”</div>{/if}
			{#if !filtered.length && !canCreate}<p class="ui-ag-muted ui-cbx__g">No matches</p>{/if}
			<div class="ui-cbx__foot"><span>{value.length} selected</span><span><span class="ui-ag-kbd">↑</span><span class="ui-ag-kbd">↓</span> to move <span class="ui-ag-kbd">↵</span> to toggle</span></div>
		</div>
	{/if}
</div>

<style>
	.ui-cbx {
		width: 100%;
		max-width: 330px;
		position: relative;
		font-size: 12px;
	}
	label {
		display: block;
		font-weight: 500;
		margin-bottom: 5px;
	}
	.ui-cbx__box {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
		padding: 4px 8px;
		min-height: 30px;
		border-radius: 9px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		transition: box-shadow 0.2s var(--ag-ease);
	}
	.ui-cbx__box[data-open] {
		box-shadow:
			var(--ag-shadow),
			0 0 0 3px color-mix(in srgb, var(--ag-blue) 16%, transparent);
	}
	.ui-cbx__box input {
		flex: 1;
		min-width: 80px;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-ag-avatar {
		width: 16px;
		height: 16px;
		font-size: 7.5px;
		background: var(--ag-fill);
		color: var(--ag-muted);
	}
	.ui-cbx__chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 1px 4px 1px 2px;
		border-radius: 999px;
		background: var(--ag-fill);
		font-size: 11.5px;
	}
	.ui-cbx__chip button {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
		padding: 0 2px;
	}
	.ui-cbx__list {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(100% + 4px);
		z-index: 10;
		max-height: 260px;
		overflow-y: auto;
		padding: 4px;
		border-radius: 10px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 10px 30px -10px rgba(0, 0, 0, 0.2);
	}
	.ui-cbx__g {
		display: block;
		padding: 6px 8px 2px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-cbx__opt {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 5px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-cbx__opt[data-active] {
		background: var(--ag-fill);
	}
	.ui-cbx__opt small {
		color: var(--ag-muted);
	}
	.ui-cbx__tick {
		margin-left: auto;
		color: var(--ag-blue);
	}
	mark {
		background: color-mix(in srgb, var(--ag-amber) 25%, transparent);
		color: inherit;
		border-radius: 2px;
	}
	.ui-cbx__foot {
		position: sticky;
		bottom: -4px;
		display: flex;
		justify-content: space-between;
		padding: 6px 8px;
		margin: 4px -4px -4px;
		border-top: 1px solid var(--ag-line);
		background: var(--ag-surface);
		color: var(--ag-muted);
		font-size: 11px;
	}
</style>
