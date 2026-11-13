<!-- Slider – single value or range (value as [lo, hi]); pointer drag, full keyboard, optional marks and value tooltip. -->
<script lang="ts">
	import './slider.css';

	type Mark = { value: number; label?: string };
	type Props = {
		value?: number | number[];
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		marks?: Mark[];
		format?: (v: number) => string;
		disabled?: boolean;
		'aria-label'?: string;
		onchange?: (v: number | number[]) => void;
		class?: string;
	};
	let { value = $bindable(0), min = 0, max = 100, step = 1, label, showValue, marks, format, disabled, 'aria-label': ariaLabel, onchange, class: cls }: Props = $props();
	const uid = $props.id();
	const range = $derived(Array.isArray(value));
	const vals = $derived(Array.isArray(value) ? value : [value as number]);
	const fmt = (v: number) => (format ? format(v) : String(v));
	let area: HTMLDivElement | undefined = $state();
	let drag = $state(-1);

	const pct = (v: number) => ((v - min) / (max - min)) * 100;
	const snap = (v: number) => Math.max(min, Math.min(max, +(Math.round((v - min) / step) * step + min).toFixed(6)));
	function fromX(x: number) {
		const r = area!.getBoundingClientRect();
		return snap(min + Math.max(0, Math.min(1, (x - r.left) / r.width)) * (max - min));
	}
	function put(i: number, v: number) {
		if (range) {
			const n = vals.slice();
			n[i] = i === 0 ? Math.min(v, n[1]) : Math.max(v, n[0]);
			value = n;
		} else value = v;
		onchange?.(value);
	}
	function down(e: PointerEvent) {
		if (disabled) return;
		const v = fromX(e.clientX);
		let i = 0;
		if (range) {
			i = Math.abs(v - vals[0]) <= Math.abs(v - vals[1]) ? (v > vals[1] ? 1 : 0) : 1;
			if (vals[0] === vals[1]) i = v < vals[0] ? 0 : 1;
		}
		drag = i;
		put(i, v);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		(area?.querySelectorAll('.ui-sld__thumb')[i] as HTMLElement | undefined)?.focus();
	}
	function key(i: number, e: KeyboardEvent) {
		const s = e.shiftKey ? step * 10 : step;
		const v = vals[i];
		let n: number | null = null;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = v + s;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = v - s;
		else if (e.key === 'PageUp') n = v + step * 10;
		else if (e.key === 'PageDown') n = v - step * 10;
		else if (e.key === 'Home') n = min;
		else if (e.key === 'End') n = max;
		if (n == null) return;
		e.preventDefault();
		put(i, snap(n));
	}
	const lo = $derived(range ? pct(vals[0]) : 0);
	const hi = $derived(pct(vals[range ? 1 : 0]));
</script>

<div class={['ui-sld', disabled && 'is-disabled', cls]}>
	{#if label || showValue}
		<div class="ui-sld__head">
			<span id={uid}>{label}</span>
			{#if showValue}<span class="ui-sld__val">{range ? `${fmt(vals[0])} – ${fmt(vals[1])}` : fmt(vals[0])}</span>{/if}
		</div>
	{/if}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div bind:this={area} class="ui-sld__area" onpointerdown={down} onpointermove={(e) => { if (drag > -1) put(drag, fromX(e.clientX)); }} onpointerup={() => (drag = -1)}>
		<div class="ui-sld__track"><div class="ui-sld__fill" style="left: {lo}%; width: {hi - lo}%"></div></div>
		{#if marks}
			{#each marks as m (m.value)}
				<span class="ui-sld__mark" style="left: {pct(m.value)}%"><i></i>{#if m.label != null}<b>{m.label}</b>{/if}</span>
			{/each}
		{/if}
		{#each vals as v, i (i)}
			<div
				role="slider"
				tabindex={disabled ? -1 : 0}
				aria-valuemin={range ? (i === 0 ? min : vals[0]) : min}
				aria-valuemax={range ? (i === 0 ? vals[1] : max) : max}
				aria-valuenow={v}
				aria-valuetext={fmt(v)}
				aria-labelledby={label ? uid : undefined}
				aria-label={!label ? ariaLabel || (range ? (i ? 'Maximum' : 'Minimum') : 'Value') : undefined}
				aria-disabled={disabled ? 'true' : undefined}
				class={['ui-sld__thumb', drag === i && 'is-drag']}
				style="left: {pct(v)}%"
				onkeydown={(e) => key(i, e)}>
				<span class="ui-sld__tip">{fmt(v)}</span>
			</div>
		{/each}
	</div>
</div>
