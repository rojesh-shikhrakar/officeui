<!-- Text Area – Auto-growing multi-line field with counter, expand button and ⌘/Ctrl+Enter. -->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { onMount, tick } from 'svelte';
	import './text-area.css';

	type Props = Omit<HTMLTextareaAttributes, 'rows'> & {
		label?: string;
		hint?: string;
		error?: string;
		optional?: boolean;
		/** Shows "120/2000" under the field; needs maxlength */
		counter?: boolean;
		/** Height when empty, in lines */
		minRows?: number;
		/** Grows with the text up to this many lines, then scrolls */
		maxRows?: number;
		/** A corner button that gives the field more room */
		expandable?: boolean;
		/** Lines while expanded */
		expandedRows?: number;
		expanded?: boolean;
		/** ⌘/Ctrl+Enter – save or send without leaving the keyboard */
		onsubmitshortcut?: (value: string) => void;
		inputClass?: string;
		el?: HTMLTextAreaElement;
	};
	let {
		label,
		hint,
		error,
		optional = false,
		counter = false,
		minRows = 3,
		maxRows = 10,
		expandable = false,
		expandedRows = 16,
		expanded = $bindable(false),
		onsubmitshortcut,
		class: cls,
		inputClass,
		id,
		value = $bindable(''),
		onkeydown,
		disabled,
		readonly,
		maxlength,
		el = $bindable(),
		'aria-describedby': describedBy,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const messageId = `${uid}-message`;
	const counterId = `${uid}-count`;
	const text = $derived(String(value ?? ''));
	const isExpanded = $derived(expandable && expanded);
	let gliding = $state(false);
	let glideTimer: ReturnType<typeof setTimeout>;
	const invalid = $derived(Boolean(error) || rest['aria-invalid'] === true || rest['aria-invalid'] === 'true');
	const message = $derived(error || hint || null);
	const showCount = $derived(counter && typeof maxlength === 'number');
	const fallbackName = $derived(label == null && !rest['aria-label'] && !rest['aria-labelledby'] && typeof rest.placeholder === 'string' ? rest.placeholder : undefined);

	// Fits the height to the text: at least minRows (expandedRows while expanded), at most maxRows, then it scrolls
	function fit() {
		if (!el) return;
		const cs = getComputedStyle(el);
		const line = parseFloat(cs.lineHeight) || 20;
		const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
		const min = (isExpanded ? Math.max(expandedRows, minRows) : minRows) * line + pad;
		const max = (isExpanded ? Math.max(expandedRows, maxRows) : Math.max(maxRows, minRows)) * line + pad;
		const before = el.style.height;
		el.style.height = 'auto';
		const needed = el.scrollHeight;
		const next = Math.min(Math.max(needed, min), max);
		el.style.height = before;
		void el.offsetHeight;
		el.style.height = `${next}px`;
		el.style.overflowY = needed > max + 1 ? 'auto' : 'hidden';
	}
	$effect(() => {
		void [text, isExpanded, minRows, maxRows, expandedRows];
		tick().then(fit);
	});
	onMount(() => {
		if (!el) return;
		let width = el.clientWidth;
		const ro = new ResizeObserver(() => {
			if (!el || el.clientWidth === width) return;
			width = el.clientWidth;
			fit();
		});
		ro.observe(el);
		return () => ro.disconnect();
	});
	function toggle() {
		gliding = true;
		clearTimeout(glideTimer);
		glideTimer = setTimeout(() => (gliding = false), 320);
		expanded = !isExpanded;
	}
</script>

<div class={['ui-tac', cls]} data-invalid={invalid || undefined} data-disabled={disabled || undefined} data-readonly={readonly || undefined} data-expandable={expandable || undefined}>
	{#if label != null}
		<div class="ui-tac__head">
			<label class="ui-tac__label" for={inputId}>{label}</label>
			{#if optional}<span class="ui-tac__optional">Optional</span>{/if}
		</div>
	{/if}
	<div class="ui-tac__box">
		<textarea
			{...rest}
			bind:this={el}
			bind:value
			id={inputId}
			class={['ui-tac__input', inputClass]}
			rows={minRows}
			{disabled}
			{readonly}
			{maxlength}
			dir={rest.dir ?? 'auto'}
			aria-label={rest['aria-label'] ?? fallbackName}
			aria-invalid={invalid || undefined}
			aria-describedby={[describedBy, message ? messageId : null, showCount ? counterId : null].filter(Boolean).join(' ') || undefined}
			aria-keyshortcuts={onsubmitshortcut ? 'Meta+Enter Control+Enter' : rest['aria-keyshortcuts']}
			data-gliding={gliding || undefined}
			onkeydown={(e) => {
				if (onsubmitshortcut && e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.isComposing) {
					e.preventDefault();
					onsubmitshortcut(e.currentTarget.value);
				}
				onkeydown?.(e);
			}}
		></textarea>
		{#if expandable && !disabled}
			<button type="button" class="ui-tac__expand" aria-label={isExpanded ? 'Less room' : 'More room'} aria-pressed={isExpanded} aria-controls={inputId} onclick={toggle}>
				{#key isExpanded}
					<span class="ui-tac__swap">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d={isExpanded ? 'M14.5 5v4.5H19M14.5 9.5 20 4M9.5 19v-4.5H5M9.5 14.5 4 20' : 'M16.5 3h4.5v4.5M21 3l-6 6M7.5 21H3v-4.5M3 21l6-6'} />
						</svg>
					</span>
				{/key}
			</button>
		{/if}
	</div>
	{#if message || showCount}
		<div class="ui-tac__foot">
			{#key error ? 'error' : 'hint'}<p class="ui-tac__message" id={messageId} dir="auto" aria-live={error ? 'polite' : undefined}>{message}</p>{/key}
			{#if showCount && maxlength}
				<span class="ui-tac__count" id={counterId} data-full={text.length === maxlength || undefined} data-over={text.length > maxlength || undefined}>{text.length.toLocaleString()}/{maxlength.toLocaleString()}</span>
			{/if}
		</div>
	{/if}
</div>
