<!-- Grid – CSS grid: fixed columns, or auto-fit with a minimum width. gap numbers are 4px steps. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import './grid.css';

	type Props = HTMLAttributes<HTMLDivElement> & {
		/** A count, or a full grid-template-columns value */
		columns?: number | string;
		/** Auto-fit columns at least this wide (number = px); overrides columns */
		min?: number | string;
		/** Number = 4px steps, string = any CSS length */
		gap?: number | string;
		rowGap?: number | string;
		children?: Snippet;
	};
	let { columns = 12, min, gap = 5, rowGap, style, class: cls, children, ...rest }: Props = $props();
	const g = (v: number | string | undefined) => (v == null ? undefined : typeof v === 'number' ? `${v * 4}px` : v);
	const tpl = $derived(min ? `repeat(auto-fit, minmax(${typeof min === 'number' ? `${min}px` : min}, 1fr))` : typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns);
</script>

<div {...rest} class={['ui-grid', cls]} style:grid-template-columns={tpl} style:gap={g(gap)} style:row-gap={g(rowGap)} {style}>{@render children?.()}</div>
