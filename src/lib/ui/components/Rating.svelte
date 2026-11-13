<!-- Rating – star rating (whole or half), hover preview, keyboard slider; read-only mode with an image role. -->
<script lang="ts">
	import RatingStar from './RatingStar.svelte';
	import './rating.css';

	type Props = { value?: number; max?: number; half?: boolean; size?: 'sm' | 'md' | 'lg'; readOnly?: boolean; clearable?: boolean; showValue?: boolean; count?: number; label?: string; onchange?: (v: number) => void; class?: string };
	let { max = 5, half = false, size: sz = 'md', value = $bindable(0), readOnly: ro, clearable, showValue, count, label = 'Rating', onchange, class: cls }: Props = $props();
	const size = $derived({ sm: 14, md: 20, lg: 28 }[sz]);
	let hov = $state<number | null>(null);
	const dv = $derived(hov ?? value);
	const set = (v: number) => {
		value = v;
		onchange?.(v);
	};
	function fromEvent(i: number, e: MouseEvent) {
		if (!half) return i;
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		return e.clientX - r.left < r.width / 2 ? i - 0.5 : i;
	}
	function onKey(e: KeyboardEvent) {
		const s = half ? 0.5 : 1;
		let n: number | null = null;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = Math.min(max, value + s);
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = Math.max(0, value - s);
		else if (e.key === 'Home') n = 0;
		else if (e.key === 'End') n = max;
		if (n == null) return;
		e.preventDefault();
		set(n);
	}
</script>

<span class={['ui-rate', ro && 'is-ro', cls]}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
	<span
		class="ui-rate__stars"
		onmouseleave={() => (hov = null)}
		{...ro ? { role: 'img', 'aria-label': `${value} out of ${max} stars` } : { role: 'slider', tabindex: 0, 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value, 'aria-valuetext': `${value} out of ${max} stars`, onkeydown: onKey }}>
		{#each { length: max } as _, k (k)}
			{@const i = k + 1}
			{@const f = Math.max(0, Math.min(1, dv - (i - 1)))}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events, a11y_mouse_events_have_key_events -->
			<span
				class="ui-rate__star"
				style="width: {size}px; height: {size}px"
				onmousemove={ro ? undefined : (e) => (hov = fromEvent(i, e))}
				onclick={ro ? undefined : (e) => { const v = fromEvent(i, e); set(v === value && clearable ? 0 : v); }}>
				<span class="ui-rate__base"><RatingStar {size} /></span><span class="ui-rate__fill" style="width: {f * 100}%"><RatingStar {size} fill /></span>
			</span>
		{/each}
	</span>
	{#if showValue || count != null}
		<span class="ui-rate__meta">{#if showValue}<b>{Number(value).toFixed(half || value % 1 ? 1 : 0)}</b>{/if}{#if count != null}<span>({count.toLocaleString('en-US')})</span>{/if}</span>
	{/if}
</span>
