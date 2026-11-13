<!-- Badge – A status label; the leading glyph varies by tone so color is never the only signal. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './badge.css';

	type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent';
	type Props = { tone?: Tone; variant?: 'soft' | 'solid' | 'outline'; size?: 'sm' | 'md'; children?: Snippet; class?: string };
	let { tone = 'neutral', variant = 'soft', size = 'md', children, class: cls }: Props = $props();
	const GLYPH: Record<Tone, string> = { neutral: '○', success: '●', danger: '▲', warning: '◆', info: '■', accent: '◇' };
</script>

<span class={['ui-bdg', `ui-bdg--${tone}`, variant !== 'soft' && `ui-bdg--${variant}`, size === 'sm' && 'ui-bdg--sm', cls]}><span class="ui-bdg__glyph" aria-hidden="true">{GLYPH[tone]}</span>{@render children?.()}</span>
