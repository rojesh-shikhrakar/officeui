<!-- CommandPalette – A modal search-and-run palette: grouped items, arrow keys, highlighted match, shortcuts. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Kbd from './Kbd.svelte';
	import './command-palette.css';
	type Item = { label: string; keywords?: string; icon?: string | Snippet; shortcut?: string | string[]; disabled?: boolean; onSelect?: () => void };
	type Props = {
		open?: boolean;
		groups?: { heading?: string; items: Item[] }[];
		label?: string;
		placeholder?: string;
		emptyText?: string;
		noAutofocus?: boolean;
		onclose?: () => void;
	};
	let { open = $bindable(false), groups = [], label, placeholder, emptyText, noAutofocus = false, onclose }: Props = $props();
	const uid = $props.id();
	let q = $state(''),
		active = $state(0);
	let input: HTMLInputElement | undefined = $state();
	const ql = $derived(q.trim().toLowerCase());
	const view = $derived.by(() => {
		const flat: (Item & { _i: number })[] = [];
		const out: { heading?: string; items: (Item & { _i: number })[] }[] = [];
		for (const g of groups) {
			const items = g.items
				.filter((it) => !ql || `${it.label} ${it.keywords ?? ''}`.toLowerCase().includes(ql))
				.map((it) => {
					const o = { ...it, _i: flat.length };
					flat.push(o);
					return o;
				});
			if (items.length) out.push({ heading: g.heading, items });
		}
		return { flat, groups: out };
	});
	$effect(() => {
		if (open) {
			q = '';
			active = 0;
			if (!noAutofocus) input?.focus();
		}
	});
	function close() {
		open = false;
		onclose?.();
	}
	function pick(it?: Item) {
		if (it && !it.disabled) {
			it.onSelect?.();
			close();
		}
	}
	function onkeydown(e: KeyboardEvent) {
		const n = Math.max(1, view.flat.length);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = (active + 1) % n;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = (active - 1 + n) % n;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			pick(view.flat[active]);
		} else if (e.key === 'Escape') {
			e.stopPropagation();
			close();
		}
	}
	function hl(text: string): [string, string, string] {
		const i = ql ? text.toLowerCase().indexOf(ql) : -1;
		return i < 0 ? [text, '', ''] : [text.slice(0, i), text.slice(i, i + ql.length), text.slice(i + ql.length)];
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ui-cmp__scrim" onmousedown={(e) => { if (e.target === e.currentTarget) close(); }}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_interactive_supports_focus -->
		<div class="ui-cmp" role="dialog" aria-modal="true" aria-label={label ?? 'Command palette'} {onkeydown}>
			<div class="ui-cmp__search">
				<Icon name="search" size={16} />
				<input bind:this={input} class="ui-cmp__input" placeholder={placeholder ?? 'Type a command or search'} bind:value={q} oninput={() => (active = 0)} role="combobox" aria-expanded="true" aria-controls="{uid}l" aria-activedescendant={view.flat[active] ? `${uid}${view.flat[active]._i}` : undefined} />
				<Kbd>Esc</Kbd>
			</div>
			<div id="{uid}l" role="listbox" class="ui-cmp__list">
				{#each view.groups as g, gi (gi)}
					<div role="group" aria-label={g.heading} class="ui-cmp__group">
						{#if g.heading}<div class="ui-cmp__heading">{g.heading}</div>{/if}
						{#each g.items as it (it._i)}
							{@const [a, m, z] = hl(it.label)}
							<div id="{uid}{it._i}" role="option" tabindex="-1" aria-selected={it._i === active ? 'true' : 'false'} aria-disabled={it.disabled ? 'true' : undefined} class={['ui-cmp__item', it._i === active && 'is-active']} onmousemove={() => { if (active !== it._i) active = it._i; }} onclick={() => pick(it)} onkeydown={() => {}}>
								<span class="ui-cmp__icon">{#if typeof it.icon === 'string'}<Icon name={it.icon} />{:else if it.icon}{@render it.icon()}{/if}</span>
								<span class="ui-cmp__label">{a}{#if m}<mark class="ui-cmp__mark">{m}</mark>{/if}{z}</span>
								{#if it.shortcut}<span class="ui-cmp__short">{#each [it.shortcut].flat() as k, i (i)}<Kbd>{k}</Kbd>{/each}</span>{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="ui-cmp__empty">{emptyText ?? `No results for “${q}”.`}</div>
				{/each}
			</div>
			<div class="ui-cmp__foot"><span><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Select</span><span><Kbd>Esc</Kbd> Close</span></div>
		</div>
	</div>
{/if}
