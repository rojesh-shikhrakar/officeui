<!-- Calendar – month grid, single date or range, min/max/disabled dates, full keyboard navigation (arrows, PageUp/Down, Home/End). -->
<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { sod, addD, addM, same, type DateRange } from '../utils/dates';
	import './calendar.css';

	type Value = Date | DateRange | null;
	type Props = {
		mode?: 'single' | 'range';
		value?: Value;
		defaultMonth?: Date;
		/** 0 Sunday … 6 Saturday; default Monday */
		weekStart?: number;
		min?: Date;
		max?: Date;
		isDisabled?: (d: Date) => boolean;
		onchange?: (v: any) => void;
		class?: string;
	};
	let { mode = 'single', weekStart: ws = 1, value = $bindable(mode === 'range' ? { start: null, end: null } : null), defaultMonth, min, max, isDisabled, onchange, class: cls }: Props = $props();
	const rangeVal = $derived(value as DateRange);
	const single = $derived(value as Date | null);
	// svelte-ignore state_referenced_locally
	const base = (mode === 'range' ? (value as DateRange | null)?.start : (value as Date | null)) || defaultMonth || new Date();
	let view = $state(new Date(base.getFullYear(), base.getMonth(), 1));
	let focus = $state(sod(base));
	let hover = $state<Date | null>(null);
	let root: HTMLDivElement | undefined = $state();
	const today = sod(new Date());

	const first = $derived(new Date(view.getFullYear(), view.getMonth(), 1));
	const days = $derived.by(() => {
		const start = addD(first, -((first.getDay() - ws + 7) % 7));
		return Array.from({ length: 42 }, (_, i) => addD(start, i));
	});
	const weeks = $derived(Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)));
	const names = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const wd = addD(new Date(2024, 0, 7), ws + i);
			return { s: wd.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), l: wd.toLocaleDateString('en-US', { weekday: 'long' }) };
		})
	);
	const rs = $derived(mode === 'range' ? rangeVal.start : null);
	const re = $derived(mode === 'range' ? rangeVal.end || (rs && hover && hover > rs ? hover : null) : null);
	const label = $derived(view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

	const dis = (d: Date) => !!((min && d < sod(min)) || (max && d > sod(max)) || isDisabled?.(d));
	const set = (v: Value) => {
		value = v;
		onchange?.(v);
	};
	function pick(d: Date) {
		if (dis(d)) return;
		focus = d;
		if (mode === 'single') {
			const n = new Date(d);
			if (single) n.setHours(single.getHours(), single.getMinutes());
			set(n);
		} else if (!rangeVal.start || rangeVal.end) set({ start: d, end: null });
		else set(d < rangeVal.start ? { start: d, end: rangeVal.start } : { start: rangeVal.start, end: d });
	}
	function move(d: Date) {
		focus = d;
		if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = new Date(d.getFullYear(), d.getMonth(), 1);
		setTimeout(() => root?.querySelector<HTMLElement>('[tabindex="0"]')?.focus(), 0);
	}
	function onKey(e: KeyboardEvent) {
		const m = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
		const dow = (focus.getDay() - ws + 7) % 7;
		if (m) (e.preventDefault(), move(addD(focus, m)));
		else if (e.key === 'PageUp') (e.preventDefault(), move(addM(focus, -1)));
		else if (e.key === 'PageDown') (e.preventDefault(), move(addM(focus, 1)));
		else if (e.key === 'Home') (e.preventDefault(), move(addD(focus, -dow)));
		else if (e.key === 'End') (e.preventDefault(), move(addD(focus, 6 - dow)));
	}
</script>

<div class={['ui-cal', cls]} bind:this={root}>
	<div class="ui-cal__head">
		<Button variant="ghost" size="sm" aria-label="Previous month" onclick={() => (view = addM(view, -1))}>{#snippet icon()}<Icon name="chevron-left" />{/snippet}</Button>
		<div class="ui-cal__title" aria-live="polite">{label}</div>
		<Button variant="ghost" size="sm" aria-label="Next month" onclick={() => (view = addM(view, 1))}>{#snippet icon()}<Icon name="chevron-right" />{/snippet}</Button>
	</div>
	<div role="grid" tabindex="-1" aria-label={label} class="ui-cal__grid" onkeydown={onKey} onmouseleave={() => (hover = null)}>
		<div role="row" class="ui-cal__row">{#each names as n, i (i)}<div role="columnheader" aria-label={n.l} class="ui-cal__dow">{n.s}</div>{/each}</div>
		{#each weeks as week (+week[0])}
		<div role="row" class="ui-cal__row">
		{#each week as d (+d)}
			{@const out = d.getMonth() !== view.getMonth()}
			{@const sel = mode === 'single' ? same(d, single) : same(d, rs) || same(d, rangeVal.end)}
			{@const inR = !!(rs && re && d > rs && d < re)}
			<button
				type="button"
				role="gridcell"
				tabindex={same(d, focus) ? 0 : -1}
				disabled={dis(d)}
				aria-selected={sel ? 'true' : undefined}
				aria-current={same(d, today) ? 'date' : undefined}
				aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
				class={['ui-cal__day', out && 'is-out', same(d, today) && 'is-today', sel && 'is-sel', inR && 'is-mid', same(d, rs) && re && 'is-rs', same(d, re) && rs && 'is-re']}
				onclick={() => pick(d)}
				onmouseenter={() => {
					if (mode === 'range' && rs && !rangeVal.end) hover = d;
				}}>{d.getDate()}</button>
		{/each}
		</div>
		{/each}
	</div>
</div>
