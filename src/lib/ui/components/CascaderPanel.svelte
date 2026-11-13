<!-- CascaderPanel – the columns of a Cascader; arrow keys move within and between columns. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { CascaderOption } from './Cascader.svelte';
	import './cascader.css';

	type Props = { options: CascaderOption[]; value: (string | number)[]; expandTrigger?: 'click' | 'hover'; onselect: (path: (string | number)[]) => void };
	let { options, value, expandTrigger, onselect }: Props = $props();
	// svelte-ignore state_referenced_locally
	let active = $state<(string | number)[]>(value.slice());
	let root: HTMLDivElement | undefined = $state();
	const cols = $derived.by(() => {
		const out = [options];
		let lv = options;
		for (const v of active) {
			const n = lv.find((o) => o.value === v);
			if (n?.children) {
				lv = n.children;
				out.push(lv);
			}
		}
		return out;
	});
	function choose(ci: number, o: CascaderOption) {
		const np = active.slice(0, ci).concat(o.value);
		active = np;
		if (!(o.children && o.children.length)) onselect(np);
	}
	function focusCol(ci: number, vi = 0) {
		setTimeout(() => root?.querySelectorAll('.ui-casc__col')[ci]?.querySelectorAll<HTMLElement>('button')[vi]?.focus(), 0);
	}
	function onKey(e: KeyboardEvent, ci: number, o: CascaderOption, i: number) {
		const col = cols[ci];
		if (e.key === 'ArrowDown') (e.preventDefault(), focusCol(ci, (i + 1) % col.length));
		else if (e.key === 'ArrowUp') (e.preventDefault(), focusCol(ci, (i - 1 + col.length) % col.length));
		else if (e.key === 'ArrowRight' && o.children) (e.preventDefault(), (active = active.slice(0, ci).concat(o.value)), focusCol(ci + 1, 0));
		else if (e.key === 'ArrowLeft' && ci > 0) (e.preventDefault(), focusCol(ci - 1, Math.max(0, cols[ci - 1].map((x) => x.value).indexOf(active[ci - 1]))));
	}
</script>

<div bind:this={root} class="ui-casc" role="tree">
	{#each cols as col, ci (ci)}
		<div class="ui-casc__col" role="group">
			{#each col as o, i (o.value)}
				{@const on = active[ci] === o.value}
				{@const sel = value[ci] === o.value && value.length > ci}
				<button
					type="button"
					role="treeitem"
					disabled={o.disabled}
					aria-expanded={o.children ? (on ? 'true' : 'false') : undefined}
					aria-selected={sel ? 'true' : 'false'}
					class={['ui-casc__item', on && 'is-active', sel && 'is-sel']}
					tabindex={on || (active[ci] === undefined && i === 0) ? 0 : -1}
					onclick={() => choose(ci, o)}
					onmouseenter={expandTrigger === 'hover' && o.children ? () => (active = active.slice(0, ci).concat(o.value)) : undefined}
					onkeydown={(e) => onKey(e, ci, o, i)}>
					<span class="ui-casc__label">{o.label}</span>
					{#if o.children}<Icon name="chevron-right" size={14} />{:else if sel}<Icon name="check" size={14} />{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
