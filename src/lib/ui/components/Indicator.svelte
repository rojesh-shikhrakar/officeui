<!-- Indicator – A count or dot badge pinned to a corner of its children. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './indicator.css';

	type Props = {
		count?: number;
		/** A small dot instead of a number */
		dot?: boolean;
		show?: boolean;
		showZero?: boolean;
		/** Counts above this render as "max+" */
		max?: number;
		tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent';
		position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
		pulse?: boolean;
		/** Accessible name (default "N notifications") */
		label?: string;
		children?: Snippet;
		class?: string;
	};
	let { count, dot, show: showProp = true, showZero, max = 99, tone = 'danger', position = 'top-right', pulse, label, children, class: cls }: Props = $props();
	const show = $derived(showProp && (dot || (count != null && (count > 0 || showZero))));
	const text = $derived(count != null ? (count > max ? `${max}+` : String(count)) : null);
</script>

<span class={['ui-ind-wrap', cls]}>{@render children?.()}{#if show}<span class={['ui-ind', `ui-ind--${tone}`, dot && 'ui-ind--dot', `ui-ind--${position}`, pulse && 'is-pulse']} role="status" aria-label={label || (text ? `${text} notifications` : 'New')}>{#if !dot}{text}{/if}</span>{/if}</span>
