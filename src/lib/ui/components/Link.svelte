<!-- Link – an anchor (or any element via `as`) with inline/standalone/subtle looks, external and current states. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './link.css';

	type Props = {
		/** inline: underlined · standalone: bold with an arrow · subtle: inherits color */
		variant?: 'inline' | 'standalone' | 'subtle';
		/** Opens in a new tab with an icon and screen-reader hint */
		external?: boolean;
		/** aria-current="page" */
		current?: boolean;
		disabled?: boolean;
		/** Element tag */
		as?: string;
		class?: string;
		tabindex?: number;
		target?: string | null;
		rel?: string | null;
		children?: Snippet;
		[k: string]: any;
	};
	let { variant = 'inline', external = false, current = false, disabled = false, as = 'a', class: cls, tabindex, target, rel, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={as}
	{...rest as any}
	class={['ui-lnk', `ui-lnk--${variant}`, disabled && 'is-disabled', cls]}
	aria-current={current ? 'page' : undefined}
	aria-disabled={disabled ? 'true' : undefined}
	tabindex={disabled ? -1 : tabindex}
	target={external ? '_blank' : target}
	rel={external ? 'noopener noreferrer' : rel}>
	{@render children?.()}{#if external}<Icon name="external" size={13} class="ui-lnk__ic" /><span class="ui-lnk__sr"> (opens in a new tab)</span>{/if}{#if variant === 'standalone' && !external}<Icon name="arrow-right" size={14} class="ui-lnk__ic" />{/if}
</svelte:element>
