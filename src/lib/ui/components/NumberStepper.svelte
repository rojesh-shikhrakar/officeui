<!-- NumberStepper – role="spinbutton" input with − / + buttons; arrows, Home/End, clamped to min/max. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import FieldBox from './FieldBox.svelte';
	import './number-stepper.css';

	type Props = {
		id?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		hint?: string;
		error?: string;
		/** Text after the number, e.g. "kg" */
		unit?: string;
		/** attached: buttons on both sides · split: separate round buttons */
		variant?: 'attached' | 'split';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		format?: (n: number) => string;
		class?: string;
		onchange?: (n: number) => void;
	};
	let { id, value = $bindable(0), min = -Infinity, max = Infinity, step = 1, label, hint, error, unit, variant = 'attached', size = 'md', disabled = false, format, class: cls, onchange }: Props = $props();
	const uid = $props.id();
	const fid = $derived(id ?? uid);
	let text: string | null = $state(null);
	const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n * 1e6) / 1e6));
	function set(n: number) {
		value = clamp(n);
		onchange?.(value);
	}
	function commit() {
		if (text == null) return;
		const n = parseFloat(text);
		text = null;
		if (!isNaN(n)) set(n);
	}
	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') (e.preventDefault(), set(value + step));
		else if (e.key === 'ArrowDown') (e.preventDefault(), set(value - step));
		else if (e.key === 'Enter') commit();
		else if (e.key === 'Home' && isFinite(min)) (e.preventDefault(), set(min));
		else if (e.key === 'End' && isFinite(max)) (e.preventDefault(), set(max));
	}
</script>

<FieldBox id={fid} {label} {hint} {error} class={cls}>
	<div role="group" aria-labelledby={label ? `${fid}-l` : undefined} class={['ui-nstep', `ui-nstep--${variant}`, `ui-nstep--${size}`, error && 'is-error']}>
		<button type="button" class="ui-nstep__btn" aria-label="Decrease" disabled={disabled || value <= min} onclick={() => set(value - step)}><Icon name="minus" size={14} /></button>
		<input
			id={fid}
			class="ui-nstep__input"
			role="spinbutton"
			inputmode="decimal"
			aria-valuenow={value}
			aria-valuemin={isFinite(min) ? min : undefined}
			aria-valuemax={isFinite(max) ? max : undefined}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error || hint ? `${fid}-n` : undefined}
			{disabled}
			value={text != null ? text : format ? format(value) : String(value)}
			oninput={(e) => (text = e.currentTarget.value)}
			onblur={commit}
			{onkeydown} />
		{#if unit}<span class="ui-nstep__unit">{unit}</span>{/if}
		<button type="button" class="ui-nstep__btn" aria-label="Increase" disabled={disabled || value >= max} onclick={() => set(value + step)}><Icon name="plus" size={14} /></button>
	</div>
</FieldBox>
