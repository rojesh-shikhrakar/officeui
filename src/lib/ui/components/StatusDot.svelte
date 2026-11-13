<!-- StatusDot – A colored dot with an inline label; optional pulse. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './status-dot.css';

	type Props = { tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent'; size?: 'md' | 'lg'; pulse?: boolean; children?: Snippet; class?: string };
	let { tone = 'neutral', size = 'md', pulse = false, children, class: cls }: Props = $props();
</script>

<span class={['ui-sdot', `ui-sdot--${tone}`, size === 'lg' && 'ui-sdot--lg', pulse && 'is-pulse', cls]}><i aria-hidden="true"></i>{@render children?.()}</span>
