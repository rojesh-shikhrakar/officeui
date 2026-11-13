<!-- Stack – A flex container with a gap (a number is a 4px step, a string is any CSS length). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import './stack.css';

	// ponytail: no auto-`divider` between children; place <Divider> manually.
	type Props = HTMLAttributes<HTMLElement> & {
		direction?: 'row' | 'column';
		gap?: number | string;
		align?: string;
		justify?: string;
		wrap?: boolean;
		/** Element tag */
		as?: string;
		children?: Snippet;
	};
	let { direction = 'column', gap = 4, align, justify, wrap = false, as = 'div', class: cls, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={as}
	{...rest}
	class={['ui-stk', cls]}
	style:flex-direction={direction}
	style:gap={typeof gap === 'number' ? `var(--p-space-${gap}, ${gap * 4}px)` : gap}
	style:align-items={align}
	style:justify-content={justify}
	style:flex-wrap={wrap ? 'wrap' : undefined}>{@render children?.()}</svelte:element>
