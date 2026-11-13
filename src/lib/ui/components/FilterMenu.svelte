<!-- Filter Menu – Grouped filters with removable chips on one line, collapsible groups, Clear all and keyboard control. -->
<script lang="ts" module>
	export type FilterOption = { id: string; label: string };
	export type FilterGroup = { id: string; label: string; options: FilterOption[]; /** e.g. "Score: " → "Score: 80–90" */ chipPrefix?: string };
	/** Picked option ids per group id */
	export type FilterValue = Record<string, string[]>;
	type Row = { kind: 'group'; group: FilterGroup; gi: number } | { kind: 'option'; group: FilterGroup; option: FilterOption; gi: number; oi: number };
	const CHIP_GAP = 4;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import './filter-menu.css';

	let {
		groups = [
			{ id: 'status', label: 'Status', options: [{ id: 'running', label: 'Running' }, { id: 'waiting', label: 'Waiting' }, { id: 'failed', label: 'Failed' }, { id: 'done', label: 'Done' }] },
			{ id: 'agent', label: 'Agent', options: [{ id: 'researcher', label: 'Researcher' }, { id: 'writer', label: 'Writer' }, { id: 'coder', label: 'Coder' }] },
			{ id: 'score', label: 'Score', chipPrefix: 'Score: ', options: [{ id: '90', label: '90–100' }, { id: '80', label: '80–90' }, { id: 'low', label: 'Under 80' }] }
		],
		value = $bindable({ status: ['running', 'waiting'] }),
		onchange,
		defaultOpen,
		title = 'Filters',
		hints = true,
		class: cls
	}: {
		groups?: FilterGroup[];
		value?: FilterValue;
		onchange?: (value: FilterValue) => void;
		/** Groups that start open – by default the first one */
		defaultOpen?: string[];
		title?: string;
		/** Show the keyboard hints as the last row */
		hints?: boolean;
		class?: string;
	} = $props();

	const uid = $props.id();
	// svelte-ignore state_referenced_locally
	const open = new SvelteSet(defaultOpen ?? groups.slice(0, 1).map((g) => g.id));
	let focus = $state<string | null>(null);
	let listEl: HTMLDivElement;
	let chipsOuter: HTMLDivElement;
	let chipsInner: HTMLDivElement;
	let measureEl: HTMLDivElement;
	let fit = $state(Infinity);

	function commit(next: FilterValue) {
		value = next;
		onchange?.(next);
	}
	const pickedIn = (g: string) => (Array.isArray(value?.[g]) ? value[g] : []);
	const isOn = (g: string, o: string) => pickedIn(g).includes(o);
	const toggle = (g: string, o: string) => {
		const cur = pickedIn(g);
		commit({ ...value, [g]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] });
	};
	const toggleGroup = (g: string) => (open.has(g) ? open.delete(g) : open.add(g));

	const chips = $derived.by(() => {
		const seen = new Set<string>();
		return groups.flatMap((g) =>
			g.options
				.filter((o) => isOn(g.id, o.id) && !seen.has(`${g.id}\0${o.id}`) && !!seen.add(`${g.id}\0${o.id}`))
				.map((o) => ({ group: g, option: o, label: `${g.chipPrefix ?? ''}${o.label}` }))
		);
	});
	const shown = $derived(chips.slice(0, fit));
	const hidden = $derived(chips.slice(fit));

	// One line only: as many chips as fit, the rest hide behind "+N"
	function place() {
		if (!chipsInner || !measureEl) return;
		const widths = [...measureEl.children].map((el) => (el as HTMLElement).offsetWidth + CHIP_GAP);
		const more = widths.pop() ?? 0;
		const style = getComputedStyle(chipsInner);
		const room = chipsInner.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) + CHIP_GAP;
		let used = 0;
		let n = 0;
		for (; n < widths.length; n++) {
			const rest = n + 1 < widths.length ? more : 0;
			if (used + widths[n] + rest > room) break;
			used += widths[n];
		}
		fit = n;
	}
	$effect(() => {
		void chips;
		queueMicrotask(place);
	});
	onMount(() => {
		const ro = new ResizeObserver(place);
		ro.observe(chipsInner);
		// The outer box follows the inner box's height, smoothly after the first frame
		const sync = () => (chipsOuter.style.height = `${chipsInner.offsetHeight}px`);
		sync();
		const ro2 = new ResizeObserver(sync);
		ro2.observe(chipsInner);
		const frame = requestAnimationFrame(() => chipsOuter.setAttribute('data-smooth', ''));
		return () => {
			ro.disconnect();
			ro2.disconnect();
			cancelAnimationFrame(frame);
		};
	});

	const rows = $derived<Row[]>(
		groups.flatMap((g, gi) => [{ kind: 'group', group: g, gi } as Row, ...(open.has(g.id) ? g.options.map((o, oi) => ({ kind: 'option', group: g, option: o, gi, oi }) as Row) : [])])
	);
	const keyOf = (r: Row) => (r.kind === 'group' ? `g:${r.gi}` : `o:${r.gi}:${r.oi}`);
	function moveTo(key: string) {
		focus = key;
		listEl?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus();
	}
	function keydown(e: KeyboardEvent) {
		const i = rows.findIndex((r) => keyOf(r) === focus);
		const row = rows[i];
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const next = rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))] ?? rows[0];
			moveTo(keyOf(next));
		} else if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			moveTo(keyOf(rows[e.key === 'Home' ? 0 : rows.length - 1]));
		} else if (row && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
			e.preventDefault();
			const g = row.group.id;
			if (e.key === 'ArrowRight' && !open.has(g)) toggleGroup(g);
			if (e.key === 'ArrowLeft') {
				if (open.has(g)) toggleGroup(g);
				moveTo(`g:${row.gi}`);
			}
		} else if (row && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			if (row.kind === 'group') toggleGroup(row.group.id);
			else toggle(row.group.id, row.option.id);
		}
	}
</script>

<div class={['ui-fmc', cls]}>
	<div class="ui-fmc__head">
		<span class="ui-fmc__title" dir="auto" {title}>{title}</span>
		<button type="button" class="ui-fmc__clear" disabled={chips.length === 0} onclick={() => commit({})}>Clear all</button>
	</div>
	<div class="ui-fmc__chips-outer" bind:this={chipsOuter}>
		<div class="ui-fmc__chips" bind:this={chipsInner} data-empty={chips.length === 0 || undefined} aria-live="polite">
			<div class="ui-fmc__measure" bind:this={measureEl} aria-hidden="true">
				{#each chips as c, i (i)}<span class="ui-fmc__chip"><span class="ui-fmc__chip-label">{c.label}</span><span class="ui-fmc__chip-x"></span></span>{/each}
				<span class="ui-fmc__chip ui-fmc__more">+99</span>
			</div>
			{#each shown as c (c.group.id + c.option.id)}
				<span class="ui-fmc__chip">
					<span class="ui-fmc__chip-label" dir="auto" title={c.label}>{c.label}</span>
					<button type="button" class="ui-fmc__chip-x" aria-label="Remove {c.label}" onclick={() => toggle(c.group.id, c.option.id)}>
						<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></svg>
					</button>
				</span>
			{/each}
			{#if hidden.length > 0}
				<span class="ui-fmc__chip ui-fmc__more" title={hidden.map((c) => c.label).join(', ')} aria-label="{hidden.length} more: {hidden.map((c) => c.label).join(', ')}">
					{#key hidden.length}<span class="ui-fmc__roll">+{hidden.length}</span>{/key}
				</span>
			{/if}
		</div>
	</div>
	<div class="ui-fmc__groups" bind:this={listEl} role="presentation" onkeydown={keydown}>
		{#each groups as g, gi (`${g.id}#${gi}`)}
			{@const isOpen = open.has(g.id)}
			{@const count = new Set(pickedIn(g.id).filter((id) => g.options.some((o) => o.id === id))).size}
			{@const gKey = `g:${gi}`}
			<section class="ui-fmc__group" data-open={isOpen ? '' : undefined}>
				<button
					type="button"
					class="ui-fmc__group-head"
					data-key={gKey}
					tabindex={focus === gKey || (focus === null && gi === 0) ? 0 : -1}
					aria-expanded={isOpen}
					aria-controls="{uid}-{gi}"
					onfocus={() => (focus = gKey)}
					onclick={() => toggleGroup(g.id)}
				>
					<svg class="ui-fmc__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.25 8 9.75l3.5-3.5" /></svg>
					<span class="ui-fmc__group-label" dir="auto" title={g.label}>{g.label}</span>
					<span class="ui-fmc__group-count">{g.options.length.toLocaleString('en-US')}</span>
					<span class="ui-fmc__group-picked" aria-live="polite">
						{#if count > 0}{#key count}<span class="ui-fmc__roll">{count} filter{count === 1 ? '' : 's'}</span>{/key}{/if}
					</span>
				</button>
				<div class="ui-fmc__panel" id="{uid}-{gi}" role="group" aria-label={g.label}>
					<div class="ui-fmc__panel-inner">
						{#each g.options as o, oi (`${o.id}#${oi}`)}
							{@const key = `o:${gi}:${oi}`}
							<button
								type="button"
								role="checkbox"
								aria-checked={isOn(g.id, o.id)}
								class="ui-fmc__option"
								data-key={key}
								tabindex={isOpen && focus === key ? 0 : -1}
								onfocus={() => (focus = key)}
								onclick={() => toggle(g.id, o.id)}
							>
								<span class="ui-fmc__box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4.25 8.25 2.5 2.5 5-5.5" /></svg></span>
								<span class="ui-fmc__option-label" dir="auto" title={o.label}>{o.label}</span>
							</button>
						{/each}
					</div>
				</div>
			</section>
		{/each}
	</div>
	{#if hints}
		<div class="ui-fmc__hints" aria-hidden="true">
			<span class="ui-fmc__hint"><kbd>↑</kbd><kbd>↓</kbd><span>to navigate</span></span>
			<span class="ui-fmc__hint"><kbd>↵</kbd><span>to select</span></span>
		</div>
	{/if}
</div>
