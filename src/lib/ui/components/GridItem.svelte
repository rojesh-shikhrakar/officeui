<!-- GridItem – A cell that spans columns and/or rows of a Grid. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLDivElement> & { span?: number; rowSpan?: number; children?: Snippet };
	let { span, rowSpan, style, class: cls, children, ...rest }: Props = $props();
</script>

<div {...rest} class={cls} style:grid-column={span ? `span ${span}` : undefined} style:grid-row={rowSpan ? `span ${rowSpan}` : undefined} {style}>{@render children?.()}</div>
