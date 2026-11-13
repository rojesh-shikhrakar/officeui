<!-- ProgressCircle – A circular progress ring with a center label; omit value for a spinner. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './progress-circle.css';
	type Props = { value?: number | null; size?: number; thickness?: number; tone?: 'brand' | 'success' | 'warning' | 'danger'; label?: string; children?: Snippet; class?: string };
	let { value, size = 72, thickness: t = 6, tone = 'brand', label, children, class: cls }: Props = $props();
	const r = $derived((size - t) / 2);
	const C = $derived(2 * Math.PI * r);
	const v = $derived(value == null ? null : Math.max(0, Math.min(100, value)));
	const aria = $derived(v == null ? {} : { 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(v) });
</script>

<div class={['ui-pcr', `ui-pcr--${tone}`, v == null && 'is-ind', cls]} style="width: {size}px; height: {size}px">
	<svg width={size} height={size} viewBox="0 0 {size} {size}" role="progressbar" aria-label={label || 'Progress'} {...aria}>
		<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke-width={t} class="ui-pcr__track" />
		<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke-width={t} stroke-linecap="round" class="ui-pcr__fill" stroke-dasharray={v == null ? `${C * 0.28} ${C}` : C} stroke-dashoffset={v == null ? 0 : C * (1 - v / 100)} transform="rotate(-90 {size / 2} {size / 2})" />
	</svg>
	{#if v != null}<span class="ui-pcr__val" style="font-size: {Math.max(11, size / 5)}px">{#if children}{@render children()}{:else}{Math.round(v)}%{/if}</span>{/if}
</div>
