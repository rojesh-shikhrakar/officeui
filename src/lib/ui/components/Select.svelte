<!-- Select – pick one option in the Text Field's look: popover list, gliding highlight, typeahead. -->
<script lang="ts" module>
	export type SelectOption = { value: string; label: string; description?: string; disabled?: boolean };
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import './select.css';

	let {
		options = [
			{ value: 'auto', label: 'Auto', description: 'Picks the best model for each step' },
			{ value: 'fable', label: 'Claude Fable 5.1', description: 'Best for long tasks' },
			{ value: 'sol', label: 'GPT-6 Sol', description: 'Fast and sharp' },
			{ value: 'gem', label: 'Gemini 3.8 Flash', description: 'Cheap and quick' },
			{ value: 'old', label: 'Legacy model', disabled: true }
		],
		value = $bindable(null),
		onchange,
		placeholder = 'Choose…',
		label,
		hint,
		error,
		optional = false,
		size = 'md',
		disabled = false,
		name,
		required,
		id,
		class: cls,
		'aria-label': ariaLabel
	}: {
		options?: SelectOption[];
		value?: string | null;
		onchange?: (value: string, option: SelectOption) => void;
		placeholder?: string;
		label?: string;
		hint?: string;
		error?: string;
		optional?: boolean;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		/** Sends the value with a form, through a hidden input */
		name?: string;
		required?: boolean;
		id?: string;
		class?: string;
		'aria-label'?: string;
	} = $props();

	const uid = $props.id();
	const triggerId = $derived(id ?? `${uid}-trigger`);
	const listId = `${uid}-list`;
	const labelId = `${uid}-label`;
	const messageId = `${uid}-message`;
	const optionId = (i: number) => `${uid}-option-${i}`;
	const chosen = $derived(options.find((o) => o.value === value) ?? null);
	let open = $state(false);
	let active = $state(-1);
	let place = $state<{ top: number; left: number; width: number; maxHeight: number; up: boolean } | null>(null);
	let glow = $state<{ top: number; height: number } | null>(null);
	let trigger = $state<HTMLButtonElement>();
	let list = $state<HTMLDivElement>();
	const typed = { text: '', at: 0 };
	const message = $derived(error || hint || null);
	const scale = $derived(['sm', 'md', 'lg'].includes(size) ? size : 'md');

	const enabled = (i: number) => i >= 0 && i < options.length && !options[i].disabled;
	const first = () => options.findIndex((o) => !o.disabled);
	const last = () => {
		for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
		return -1;
	};
	const step = (from: number, dir: 1 | -1) => {
		for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i;
		return from;
	};
	function show(at?: number) {
		if (disabled || !options.length) return;
		const chosenAt = options.findIndex((o) => o.value === value);
		active = at ?? (enabled(chosenAt) ? chosenAt : first());
		open = true;
	}
	function hide(focusBack = true) {
		open = false;
		glow = null;
		place = null;
		if (focusBack) trigger?.focus({ preventScroll: true });
	}
	function pick(i: number) {
		if (!enabled(i)) return;
		const o = options[i];
		const changed = o.value !== value;
		value = o.value;
		if (changed) onchange?.(o.value, o);
		hide();
	}
	// Under the field, or above it when there is more room there; as wide as the field
	function measure() {
		if (!trigger) return;
		const r = trigger.getBoundingClientRect();
		const gap = 4,
			edge = 8;
		const below = innerHeight - r.bottom - gap - edge;
		const above = r.top - gap - edge;
		const want = Math.min(list?.scrollHeight ?? 280, 288);
		const up = below < Math.min(want, 160) && above > below;
		const width = Math.max(r.width, 180);
		const left = Math.min(Math.max(edge, r.left), innerWidth - width - edge);
		place = { top: up ? r.top - gap : r.bottom + gap, left, width, maxHeight: Math.max(120, Math.min(288, up ? above : below)), up };
	}
	$effect(() => {
		if (!open) return;
		const el = list;
		if (el && 'showPopover' in el && !el.matches(':popover-open')) el.showPopover();
		measure();
		addEventListener('resize', measure);
		addEventListener('scroll', measure, true);
		const down = (e: PointerEvent) => {
			const t = e.target as Node;
			if (trigger?.contains(t) || list?.contains(t)) return;
			hide(false);
		};
		document.addEventListener('pointerdown', down, true);
		return () => {
			removeEventListener('resize', measure);
			removeEventListener('scroll', measure, true);
			document.removeEventListener('pointerdown', down, true);
			if (el && 'hidePopover' in el && el.matches(':popover-open')) el.hidePopover();
		};
	});
	// The highlight glides to the active option
	$effect(() => {
		if (!open || active < 0) return;
		void place;
		const a = active;
		tick().then(() => {
			const row = list?.querySelector<HTMLElement>(`[data-index="${a}"]`);
			if (!row) return;
			glow = { top: row.offsetTop, height: row.offsetHeight };
			row.scrollIntoView({ block: 'nearest' });
		});
	});
	// Typing letters jumps to the next option that starts with them
	function typeahead(key: string) {
		const now = Date.now();
		typed.text = now - typed.at > 700 ? key : typed.text + key;
		typed.at = now;
		const q = typed.text.toLowerCase();
		const start = open ? active : options.findIndex((o) => o.value === value);
		const order = [...options.keys()].map((k) => (k + start + (q.length === 1 ? 1 : 0) + options.length) % options.length);
		const hit = order.find((i) => enabled(i) && options[i].label.toLowerCase().startsWith(q));
		if (hit === undefined) return;
		if (open) active = hit;
		else pick(hit);
	}
	function keydown(e: KeyboardEvent) {
		if (disabled) return;
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
				e.preventDefault();
				show();
			} else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e.key);
			return;
		}
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				active = step(active, 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				active = step(active, -1);
				break;
			case 'Home':
			case 'PageUp':
				e.preventDefault();
				active = first();
				break;
			case 'End':
			case 'PageDown':
				e.preventDefault();
				active = last();
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (e.key === ' ' && Date.now() - typed.at < 700) typeahead(' ');
				else pick(active);
				break;
			case 'Escape':
				e.preventDefault();
				hide();
				break;
			case 'Tab':
				hide(false);
				break;
			default:
				if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e.key);
		}
	}
</script>

<div class={['ui-selc', cls]} data-size={scale} data-open={open || undefined} data-invalid={error ? true : undefined} data-disabled={disabled || undefined}>
	{#if label != null}
		<div class="ui-selc__head">
			<label class="ui-selc__label" id={labelId} for={triggerId}>{label}</label>
			{#if optional}<span class="ui-selc__optional">Optional</span>{/if}
		</div>
	{/if}
	<button
		bind:this={trigger}
		id={triggerId}
		type="button"
		class="ui-selc__trigger"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={listId}
		aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
		aria-label={ariaLabel}
		aria-labelledby={ariaLabel ? undefined : label != null ? `${labelId} ${triggerId}` : undefined}
		aria-describedby={message ? messageId : undefined}
		aria-invalid={error ? true : undefined}
		aria-required={required || undefined}
		{disabled}
		onclick={() => (open ? hide() : show())}
		onkeydown={keydown}
	>
		<span class="ui-selc__value" data-empty={chosen ? undefined : ''} title={chosen?.label}>{chosen ? chosen.label : placeholder}</span>
		<span class="ui-selc__chevron" aria-hidden="true"
			><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 10 5 5 5-5" /></svg></span
		>
	</button>
	{#if name}<input type="hidden" {name} value={value ?? ''} />{/if}
	{#if open}
		<div
			bind:this={list}
			id={listId}
			class="ui-selc__list"
			role="listbox"
			tabindex="-1"
			aria-labelledby={label != null ? labelId : undefined}
			aria-label={label == null ? (ariaLabel ?? placeholder) : undefined}
			popover="manual"
			data-up={place?.up || undefined}
			style:top={place && !place.up ? `${place.top}px` : undefined}
			style:bottom={place?.up ? `${innerHeight - place.top}px` : undefined}
			style:left={place ? `${place.left}px` : undefined}
			style:width={place ? `${place.width}px` : undefined}
			style:max-height={place ? `${place.maxHeight}px` : undefined}
			onpointerleave={() => (active = -1)}
		>
			{#if glow}<span class="ui-selc__glow" aria-hidden="true" style:transform="translateY({glow.top}px)" style:height="{glow.height}px"></span>{/if}
			{#each options as o, i (o.value)}
				<div
					id={optionId(i)}
					class="ui-selc__option"
					role="option"
					tabindex="-1"
					data-index={i}
					aria-selected={o.value === value}
					aria-disabled={o.disabled || undefined}
					data-active={i === active || undefined}
					onpointermove={() => o.disabled || i === active || (active = i)}
					onpointerdown={(e) => e.preventDefault()}
					onclick={() => pick(i)}
					onkeydown={() => {}}
				>
					<span class="ui-selc__text">
						<span class="ui-selc__option-label">{o.label}</span>
						{#if o.description}<span class="ui-selc__option-hint">{o.description}</span>{/if}
					</span>
					<span class="ui-selc__check" aria-hidden="true">
						{#if o.value === value}<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="ui-selc__tick" d="M5 12.5 9.5 17 19 7" pathLength="1" /></svg>{/if}
					</span>
				</div>
			{/each}
		</div>
	{/if}
	{#if message}
		{#key error ? 'error' : 'hint'}<p class="ui-selc__message" id={messageId} aria-live={error ? 'polite' : undefined}>{message}</p>{/key}
	{/if}
</div>
