<!-- Tree – an ARIA tree: arrow-key navigation, expand/collapse, single select or tri-state checkboxes. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type TreeNode = { id: string; label: string; meta?: string; icon?: string | Snippet; disabled?: boolean; children?: TreeNode[] };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import './tree.css';
	type Flat = { n: TreeNode; level: number; parent: TreeNode | null; pos: number; size: number };
	type Props = {
		nodes?: TreeNode[];
		expanded?: string[];
		selectedId?: string | null;
		checked?: string[];
		/** Checkbox per node; parents show a mixed state */
		checkable?: boolean;
		/** Default folder / file icons */
		icons?: boolean;
		label?: string;
		class?: string;
		onselect?: (id: string, n: TreeNode) => void;
		onexpandedchange?: (v: string[]) => void;
		oncheckedchange?: (v: string[]) => void;
	};
	let { nodes = [], expanded: ex = $bindable([]), selectedId = $bindable(null), checked = $bindable([]), checkable = false, icons = false, label, class: cls, onselect, onexpandedchange, oncheckedchange }: Props = $props();
	let fid: string | null = $state(null);
	let ref: HTMLElement | undefined = $state();

	const flat = $derived.by(() => {
		const out: Flat[] = [];
		(function walk(list: TreeNode[], level: number, parent: TreeNode | null) {
			list.forEach((n, i) => {
				out.push({ n, level, parent, pos: i + 1, size: list.length });
				if (n.children?.length && ex.includes(n.id)) walk(n.children, level + 1, n);
			});
		})(nodes, 1, null);
		return out;
	});
	const leaves = (n: TreeNode): string[] => (n.children?.length ? n.children.flatMap(leaves) : [n.id]);
	function chk(n: TreeNode) {
		const l = leaves(n),
			c = l.filter((x) => checked.includes(x)).length;
		return c === 0 ? 'false' : c === l.length ? 'true' : 'mixed';
	}
	function toggleEx(id: string) {
		ex = ex.includes(id) ? ex.filter((x) => x !== id) : ex.concat([id]);
		onexpandedchange?.(ex);
	}
	function toggleCk(n: TreeNode) {
		const l = leaves(n),
			all = chk(n) === 'true',
			rest = checked.filter((x) => !l.includes(x));
		checked = all ? rest : rest.concat(l);
		oncheckedchange?.(checked);
	}
	function choose(n: TreeNode) {
		if (n.disabled) return;
		if (checkable) toggleCk(n);
		else {
			selectedId = n.id;
			onselect?.(n.id, n);
		}
	}
	const cur = $derived(fid != null && flat.some((f) => f.n.id === fid) ? fid : selectedId != null && flat.some((f) => f.n.id === selectedId) ? selectedId : flat[0]?.n.id);
	function focusId(id: string) {
		fid = id;
		setTimeout(() => ref?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus(), 0);
	}
	function key(e: KeyboardEvent, f: Flat) {
		const i = flat.indexOf(f),
			n = f.n,
			has = !!n.children?.length,
			open = ex.includes(n.id);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (flat[i + 1]) focusId(flat[i + 1].n.id);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (flat[i - 1]) focusId(flat[i - 1].n.id);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			if (has && !open) toggleEx(n.id);
			else if (has && flat[i + 1]) focusId(flat[i + 1].n.id);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (has && open) toggleEx(n.id);
			else if (f.parent) focusId(f.parent.id);
		} else if (e.key === 'Home') {
			e.preventDefault();
			focusId(flat[0].n.id);
		} else if (e.key === 'End') {
			e.preventDefault();
			focusId(flat[flat.length - 1].n.id);
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			choose(n);
		}
	}
</script>

<ul bind:this={ref} role="tree" aria-label={label} aria-multiselectable={checkable ? 'true' : undefined} class={['ui-tre', cls]}>
	{#each flat as f (f.n.id)}
		{@const n = f.n}
		{@const has = !!n.children?.length}
		{@const open = ex.includes(n.id)}
		{@const st = checkable ? chk(n) : null}
		{@const on = !checkable && selectedId === n.id}
		<li role="treeitem" aria-level={f.level} aria-posinset={f.pos} aria-setsize={f.size} aria-expanded={has ? (open ? 'true' : 'false') : undefined} aria-selected={checkable ? undefined : on ? 'true' : 'false'} aria-checked={checkable ? (st as 'true' | 'false' | 'mixed') : undefined} aria-disabled={n.disabled ? 'true' : undefined} class="ui-tre__li">
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex -->
			<div data-id={n.id} tabindex={n.id === cur ? 0 : -1} role="presentation" class={['ui-tre__row', on && 'is-selected', n.disabled && 'is-disabled']} style="padding-left: {8 + (f.level - 1) * 20}px" onfocus={() => (fid = n.id)} onkeydown={(e) => key(e, f)} onclick={() => choose(n)}>
				{#if has}
					<button type="button" tabindex="-1" class={['ui-tre__tog', open && 'is-open']} aria-label="{open ? 'Collapse' : 'Expand'} {n.label}" onclick={(e) => { e.stopPropagation(); toggleEx(n.id); }}><Icon name="chevron-right" size={14} /></button>
				{:else}<span class="ui-tre__tog"></span>{/if}
				{#if checkable}
					<span class={['ui-tre__check', st !== 'false' && 'is-on']} aria-hidden="true">{#if st === 'true'}<Icon name="check" size={12} />{:else if st === 'mixed'}<Icon name="minus" size={12} />{/if}</span>
				{/if}
				{#if n.icon || icons}
					<span class="ui-tre__ic">{#if typeof n.icon === 'function'}{@render n.icon()}{:else}<Icon name={n.icon ?? (has ? (open ? 'folder-open' : 'folder') : 'file')} size={16} />{/if}</span>
				{/if}
				<span class="ui-tre__label">{n.label}</span>{#if n.meta}<span class="ui-tre__meta">{n.meta}</span>{/if}
			</div>
		</li>
	{/each}
</ul>
