<!-- DatePicker – labelled field that opens a Calendar: single date or range, optional time and preset ranges. DateRangePicker is a separate, preset-driven analytics control. -->
<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Calendar from './Calendar.svelte';
	import TimeColumns from './TimeColumns.svelte';
	import PickerField from './PickerField.svelte';
	import { sod, fmtD, fmtT, type DateRange } from '../utils/dates';
	import './date-picker.css';

	type Value = Date | DateRange | null;
	type Props = {
		mode?: 'single' | 'range';
		value?: Value;
		label?: string;
		hint?: string;
		error?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		defaultOpen?: boolean;
		min?: Date;
		max?: Date;
		weekStart?: number;
		/** Single mode: also pick a time */
		withTime?: boolean;
		hour12?: boolean;
		/** Single mode: show a Clear button */
		clearable?: boolean;
		/** Range mode: quick ranges */
		presets?: { label: string; range: DateRange }[];
		onchange?: (v: any) => void;
		class?: string;
	};
	let { mode = 'single', value = $bindable(mode === 'range' ? { start: null, end: null } : null), label, hint, error, placeholder, size, disabled, defaultOpen, min, max, weekStart, withTime, hour12, clearable, presets, onchange, class: cls }: Props = $props();
	const range = $derived(mode === 'range');
	const r = $derived(value as DateRange);
	const d = $derived(value as Date | null);
	const text = $derived(range ? (r?.start ? fmtD(r.start) + (r.end ? ` – ${fmtD(r.end)}` : ' – …') : '') : d ? fmtD(d) + (withTime ? `, ${fmtT(d)}` : '') : '');
	const set = (v: Value) => {
		value = v;
		onchange?.(v);
	};
</script>

<PickerField {label} {hint} {error} {text} {size} {disabled} {defaultOpen} class={cls} width="auto" placeholder={placeholder || (range ? 'Select a date range' : withTime ? 'Select date and time' : 'Select a date')}>
	{#snippet content(close)}
		<div class="ui-dtp">
			{#if range && presets}
				<div class="ui-dtp__presets">
					<div class="ui-dtp__heading">Presets</div>
					{#each presets as pr, i (i)}<button type="button" class="ui-dtp__preset" onclick={() => { set(pr.range); close(); }}>{pr.label}</button>{/each}
				</div>
			{/if}
			<div>
				<Calendar {mode} {value} {min} {max} {weekStart} onchange={(v) => { set(v); if (range ? v.end : !withTime) close(); }} />
				{#if withTime && !range}
					<div class="ui-dtp__time">
						<div class="ui-dtp__heading"><Icon name="clock" size={14} /> Time</div>
						<TimeColumns value={d || new Date()} {hour12} onchange={(t) => { const n = new Date(d || sod(new Date())); n.setHours(t.getHours(), t.getMinutes()); set(n); }} />
						<div class="ui-dtp__foot"><Button size="sm" onclick={close}>Done</Button></div>
					</div>
				{/if}
				{#if range || (!withTime && clearable)}
					<div class="ui-dtp__foot"><Button size="sm" variant="ghost" onclick={() => set(range ? { start: null, end: null } : null)}>Clear</Button></div>
				{/if}
			</div>
		</div>
	{/snippet}
</PickerField>
