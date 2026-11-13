<!-- Table – A semantic data table: sortable headers with aria-sort, numeric columns, dense mode, custom cells, empty row. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './table.css';
	type Col = { key: string; label: string; sortable?: boolean; numeric?: boolean };
	type Row = Record<string, any>;
	type Props = {
		columns?: Col[];
		rows?: Row[];
		caption?: string;
		dense?: boolean;
		sortKey?: string;
		sortDir?: 'asc' | 'desc';
		onsort?: (key: string) => void;
		/** Text of the empty row */
		empty?: string;
		cell?: Snippet<[Row, Col]>;
		class?: string;
	};
	let { columns = [], rows = [], caption, dense = false, sortKey, sortDir, onsort, empty, cell, class: cls }: Props = $props();
</script>

<table class={['ui-tbl', dense && 'ui-tbl--dense', cls]}>
	{#if caption}<caption>{caption}</caption>{/if}
	<thead>
		<tr>
			{#each columns as c (c.key)}
				{@const sorted = sortKey === c.key}
				<th scope="col" aria-sort={c.sortable ? (sorted ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none') : undefined} class={c.numeric ? 'ui-tbl__num' : undefined}>
					{#if c.sortable}
						<button type="button" class={['ui-tbl__sort', sorted && 'is-on']} onclick={() => onsort?.(c.key)}>{c.label}<Icon name="chevron-down" size={12} class={sorted && sortDir === 'asc' ? 'ui-tbl__flip' : ''} /></button>
					{:else}{c.label}{/if}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each rows as r, i (i)}
			<tr class={r._selected ? 'is-selected' : undefined}>
				{#each columns as c (c.key)}<td class={c.numeric ? 'ui-tbl__num' : undefined}>{#if cell}{@render cell(r, c)}{:else}{r[c.key]}{/if}</td>{/each}
			</tr>
		{:else}
			<tr><td colspan={columns.length} class="ui-tbl__empty">{empty ?? 'No records to show.'}</td></tr>
		{/each}
	</tbody>
</table>
