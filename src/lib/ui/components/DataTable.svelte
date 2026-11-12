<!-- Data Table – a spreadsheet-style table: select cells and ranges, edit in place with a double-click, copy, undo/redo and sort. -->
<script lang="ts" module>
	export type TableRow = { id: string; tool: string; category: string; website: string; renews: string; color: string };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		title = 'Design Stack',
		rows = $bindable([
			{ id: '1', tool: 'Canvas', category: 'Design', website: 'canvas.app', renews: 'Mar 12, 2026', color: '#db2777' },
			{ id: '2', tool: 'Tracker', category: 'Issue tracking', website: 'tracker.app', renews: 'Jan 4, 2026', color: '#2f6bff' },
			{ id: '3', tool: 'Shipyard', category: 'Hosting', website: 'shipyard.dev', renews: 'Aug 21, 2026', color: '#737373' },
			{ id: '4', tool: 'Pages', category: 'Website', website: 'pages.io', renews: 'May 2, 2026', color: '#db2777' },
			{ id: '5', tool: 'Clips', category: 'Video', website: 'clips.video', renews: 'Nov 18, 2026', color: '#0f9d76' }
		])
	}: { title?: string; rows?: TableRow[] } = $props();
	const cols = [
		{ key: 'tool', label: 'Tool' },
		{ key: 'category', label: 'Category' },
		{ key: 'website', label: 'Website' },
		{ key: 'renews', label: 'Renews' }
	] as const;
	type Key = (typeof cols)[number]['key'];
	let sel = $state<{ r: number; c: number } | null>(null);
	let anchor = $state<{ r: number; c: number } | null>(null);
	let editing = $state<{ r: number; c: number } | null>(null);
	let checked = $state<Record<string, boolean>>({});
	let sort = $state<{ key: Key; dir: 1 | -1 } | null>(null);
	let past: TableRow[][] = [];
	let future: TableRow[][] = [];
	let copied = $state(false);
	const view = $derived(sort ? [...rows].sort((a, b) => a[sort!.key].localeCompare(b[sort!.key]) * sort!.dir) : rows);
	const inRange = (r: number, c: number) => {
		if (!sel) return false;
		const a = anchor ?? sel;
		return r >= Math.min(a.r, sel.r) && r <= Math.max(a.r, sel.r) && c >= Math.min(a.c, sel.c) && c <= Math.max(a.c, sel.c);
	};
	function commit(r: number, c: number, v: string) {
		const id = view[r].id;
		past.push(rows);
		future = [];
		rows = rows.map((x) => (x.id === id ? { ...x, [cols[c].key]: v } : x));
		editing = null;
	}
	function undo() {
		if (!past.length) return;
		future.push(rows);
		rows = past.pop()!;
	}
	function redo() {
		if (!future.length) return;
		past.push(rows);
		rows = future.pop()!;
	}
	function keydown(e: KeyboardEvent) {
		if (editing) return;
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') return e.preventDefault(), e.shiftKey ? redo() : undo();
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && sel) {
			const a = anchor ?? sel;
			const text = view.slice(Math.min(a.r, sel.r), Math.max(a.r, sel.r) + 1).map((row) => cols.slice(Math.min(a.c, sel!.c), Math.max(a.c, sel!.c) + 1).map((col) => row[col.key]).join('\t')).join('\n');
			navigator.clipboard?.writeText(text).catch(() => {});
			copied = true;
			setTimeout(() => (copied = false), 1200);
			return;
		}
		if (!sel) return;
		const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
		if (e.key in moves) {
			e.preventDefault();
			const [dr, dc] = moves[e.key];
			const next = { r: Math.max(0, Math.min(view.length - 1, sel.r + dr)), c: Math.max(0, Math.min(cols.length - 1, sel.c + dc)) };
			if (!e.shiftKey) anchor = null;
			else anchor ??= sel;
			sel = next;
		} else if (e.key === 'Enter') (e.preventDefault(), (editing = sel));
	}
	function pick(e: MouseEvent, r: number, c: number) {
		if (e.shiftKey && sel) anchor ??= sel;
		else anchor = null;
		sel = { r, c };
	}
</script>

<div class="ui-ag ui-ag-panel ui-dtb" role="grid" tabindex="0" aria-label={title} onkeydown={keydown}>
	<div class="ui-ag-head"><span style:color="var(--ag-blue)">▣</span><b>{title}</b><button class="ui-ag-btn" data-variant="ghost" aria-label="Undo" onclick={undo}>↶</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Redo" onclick={redo}>↷</button></div>
	<table>
		<thead>
			<tr>
				<th class="ui-dtb__ck"><input type="checkbox" aria-label="Select all rows" checked={rows.every((r) => checked[r.id])} onchange={(e) => rows.forEach((r) => (checked[r.id] = e.currentTarget.checked))} /></th>
				{#each cols as col (col.key)}<th><button onclick={() => (sort = sort?.key === col.key ? (sort.dir === 1 ? { key: col.key, dir: -1 } : null) : { key: col.key, dir: 1 })}>{col.label} {sort?.key === col.key ? (sort.dir === 1 ? '↑' : '↓') : ''}</button></th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each view as row, r (row.id)}
				<tr>
					<td class="ui-dtb__ck"><input type="checkbox" aria-label="Select {row.tool}" bind:checked={checked[row.id]} /></td>
					{#each cols as col, c (col.key)}
						<td role="gridcell" aria-selected={inRange(r, c)} data-sel={inRange(r, c) || undefined} onmousedown={(e) => pick(e, r, c)} ondblclick={() => (editing = { r, c })}>
							{#if editing?.r === r && editing?.c === c}
								<!-- svelte-ignore a11y_autofocus -->
								<input class="ui-dtb__edit" value={row[col.key]} autofocus aria-label="Edit {col.label}" onblur={(e) => commit(r, c, e.currentTarget.value)} onkeydown={(e) => (e.key === 'Enter' ? commit(r, c, e.currentTarget.value) : e.key === 'Escape' && (editing = null))} />
							{:else if col.key === 'tool'}<span class="ui-dtb__tool"><i style:background={row.color}></i>{row.tool}</span>
							{:else if col.key === 'category'}<span class="ui-dtb__tag" style:--c={row.color}>{row.category}</span>
							{:else if col.key === 'website'}<u>{row.website}</u>
							{:else}{row[col.key]}{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="ui-ag-foot" style:justify-content="space-between">
		<button class="ui-ag-btn" data-variant="ghost" onclick={() => (rows = [...rows, { id: String(Date.now()), tool: 'New tool', category: 'Other', website: '—', renews: '—', color: '#a3a3a3' }])}>+ Add row</button>
		<small class="ui-ag-muted">{copied ? 'Copied' : 'Double-click a cell to edit'}</small>
	</div>
</div>

<style>
	.ui-dtb {
		max-width: 520px;
		font-size: 12px;
		outline: none;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		user-select: none;
	}
	th {
		text-align: left;
		font-weight: 400;
		color: var(--ag-muted);
		padding: 0;
		border-bottom: 1px solid var(--ag-line);
	}
	th button {
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		padding: 7px 10px;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}
	td {
		padding: 7px 10px;
		border-bottom: 1px solid var(--ag-line);
		cursor: cell;
		white-space: nowrap;
	}
	td[data-sel] {
		background: color-mix(in srgb, var(--ag-blue) 10%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ag-blue) 50%, transparent);
	}
	.ui-dtb__ck {
		width: 28px;
		padding-left: 14px;
	}
	.ui-dtb__tool {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 500;
	}
	.ui-dtb__tool i {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}
	.ui-dtb__tag {
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 11px;
		background: color-mix(in srgb, var(--c) 12%, transparent);
		color: var(--c);
	}
	u {
		text-decoration-color: var(--ag-line);
		text-underline-offset: 2px;
	}
	.ui-dtb__edit {
		width: 100%;
		border: 0;
		outline: none;
		font: inherit;
		background: var(--ag-surface);
		color: var(--ag-ink);
	}
</style>
