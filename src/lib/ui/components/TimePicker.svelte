<!-- TimePicker – labelled field that opens hour / minute / AM-PM columns. -->
<script lang="ts">
	import Button from './Button.svelte';
	import TimeColumns from './TimeColumns.svelte';
	import PickerField from './PickerField.svelte';
	import { fmtT } from '../utils/dates';

	type Props = {
		value?: Date | null;
		label?: string;
		hint?: string;
		error?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		defaultOpen?: boolean;
		minuteStep?: number;
		hour12?: boolean;
		onchange?: (v: Date) => void;
		class?: string;
	};
	let { value = $bindable(null), label, hint, error, placeholder, size, disabled, defaultOpen, minuteStep, hour12, onchange, class: cls }: Props = $props();
	const set = (v: Date) => {
		value = v;
		onchange?.(v);
	};
</script>

<PickerField {label} {hint} {error} {size} {disabled} {defaultOpen} class={cls} icon="clock" text={value ? fmtT(value) : ''} placeholder={placeholder || 'Select a time'} width="auto">
	{#snippet content(close)}
		<TimeColumns value={value || new Date(2000, 0, 1, 9, 0)} {minuteStep} {hour12} onchange={set} />
		<div style="display: flex; justify-content: flex-end; padding-top: 8px"><Button size="sm" onclick={close}>Done</Button></div>
	{/snippet}
</PickerField>
