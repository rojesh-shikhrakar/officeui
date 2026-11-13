<!-- Progress – A linear progress bar; omit value for an indeterminate sweep. -->
<script lang="ts">
	import './progress.css';
	type Props = { value?: number; label?: string; tone?: 'brand' | 'success' | 'warning' | 'danger'; size?: 'sm' | 'md' | 'lg'; class?: string };
	let { value, label, tone = 'brand', size = 'md', class: cls }: Props = $props();
	const ind = $derived(value == null);
</script>

<div class={['ui-prg', `ui-prg--${size}`, `ui-prg--${tone}`, cls]}>
	{#if label || !ind}<div class="ui-prg__head"><span>{label}</span>{#if !ind}<span class="ui-prg__val">{Math.round(value!)}%</span>{/if}</div>{/if}
	<div class={['ui-prg__track', ind && 'is-ind']} role="progressbar" aria-label={label || 'Progress'} aria-valuemin={ind ? undefined : 0} aria-valuemax={ind ? undefined : 100} aria-valuenow={ind ? undefined : Math.round(value!)}>
		<div class="ui-prg__fill" style:width={ind ? null : `${Math.max(0, Math.min(100, value!))}%`}></div>
	</div>
</div>
