<!-- Pagination – previous / next and numbered pages with ellipses around the current page. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import './pagination.css';

	type Props = { /** Current page, 1-based */ page?: number; pageCount: number; onchange?: (p: number) => void; class?: string };
	let { page = $bindable(1), pageCount, onchange, class: cls }: Props = $props();
	const items = $derived.by(() => {
		const out: (number | '…')[] = [];
		for (let i = 1; i <= pageCount; i++) {
			if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) out.push(i);
			else if (out[out.length - 1] !== '…') out.push('…');
		}
		return out;
	});
	function go(x: number) { if (x >= 1 && x <= pageCount) { page = x; onchange?.(x); } }
</script>

<nav aria-label="Pagination" class={['ui-pgn', cls]}>
	<button type="button" class="ui-pgn__page" aria-label="Previous page" disabled={page <= 1} onclick={() => go(page - 1)}><Icon name="chevron-left" size={14} /></button>
	{#each items as x, k (typeof x === 'number' ? x : `e${k}`)}
		{#if x === '…'}<span class="ui-pgn__gap" aria-hidden="true">{x}</span>
		{:else}<button type="button" class="ui-pgn__page" aria-current={x === page ? 'page' : undefined} onclick={() => go(x)}>{x}</button>{/if}
	{/each}
	<button type="button" class="ui-pgn__page" aria-label="Next page" disabled={page >= pageCount} onclick={() => go(page + 1)}><Icon name="chevron-right" size={14} /></button>
</nav>
