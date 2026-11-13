<!-- ToggleGroup – single (radiogroup, optionally deselectable) or multiple (pressed buttons); segmented with a sliding thumb, or separate. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick, untrack } from 'svelte';
	import Icon from './Icon.svelte';
	import './toggle-group.css';

	type Option = { value: string; label?: string; icon?: string | Snippet; disabled?: boolean; 'aria-label'?: string };
	type Props = {
		options?: Option[];
		value?: string | string[] | null;
		type?: 'single' | 'multiple';
		/** segmented: one tray with a sliding thumb · outline: separate bordered buttons */
		variant?: 'segmented' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		/** single: the selected option can't be toggled off */
		required?: boolean;
		label?: string;
		onchange?: (v: any) => void;
		class?: string;
	};
	let { options = [], value = $bindable(), type = 'single', variant = 'segmented', size = 'md', fullWidth = false, required = false, label, onchange, class: cls }: Props = $props();
	const uid = $props.id();
	const multi = $derived(type === 'multiple');
	const thumb = $derived(!multi && variant === 'segmented');
	const sel = $derived((multi ? (Array.isArray(value) ? value : []) : (value ?? null)) as any);
	let pos = $state({ x: 0, w: 0, ready: false });
	function measure(ready: boolean) {
		const el = document.getElementById(uid + sel);
		if (el) pos = { x: el.offsetLeft, w: el.offsetWidth, ready };
	}
	$effect(() => {
		if (!thumb) return;
		sel; // track
		untrack(() => measure(pos.ready));
		const t = requestAnimationFrame(() => measure(true));
		return () => cancelAnimationFrame(t);
	});
	function set(n: any) {
		value = n;
		onchange?.(n);
	}
	function click(o: Option) {
		if (o.disabled) return;
		if (multi) set(sel.includes(o.value) ? sel.filter((x: string) => x !== o.value) : [...sel, o.value]);
		else if (!(required && sel === o.value)) set(sel === o.value ? null : o.value);
	}
	async function onkeydown(e: KeyboardEvent) {
		if (multi) return;
		const en = options.filter((o) => !o.disabled);
		const i = en.findIndex((o) => o.value === sel);
		let n: number;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % en.length;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + en.length) % en.length;
		else return;
		e.preventDefault();
		set(en[n].value);
		await tick();
		document.getElementById(uid + en[n].value)?.focus();
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div role={multi ? 'group' : 'radiogroup'} aria-label={label} {onkeydown} class={['ui-tgl', `ui-tgl--${variant}`, `ui-tgl--${size}`, fullWidth && 'ui-tgl--block', cls]}>
	{#if thumb}<span class={['ui-tgl__ink', pos.ready && 'is-ready']} aria-hidden="true" style="transform: translateX({pos.x}px); width: {pos.w}px"></span>{/if}
	{#each options as o (o.value)}
		{@const on = multi ? sel.includes(o.value) : sel === o.value}
		<button
			id={uid + o.value}
			type="button"
			disabled={o.disabled}
			class={['ui-tgl__btn', on && 'is-on', o.label == null && 'is-icon']}
			onclick={() => click(o)}
			aria-label={o['aria-label']}
			aria-pressed={multi ? (on ? 'true' : 'false') : undefined}
			role={multi ? undefined : 'radio'}
			aria-checked={multi ? undefined : on ? 'true' : 'false'}
			tabindex={multi ? undefined : on || (sel == null && o === options[0]) ? 0 : -1}>
			{#if typeof o.icon === 'string'}<Icon name={o.icon} />{:else if o.icon}{@render o.icon()}{/if}{o.label}
		</button>
	{/each}
</div>
