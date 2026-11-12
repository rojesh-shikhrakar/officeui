<!-- Text Field – ported from affectUI (MIT). Label, hint/error, prefix/suffix, clear, password reveal, copy and counter. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './text-field.css';

	type Affix = string | Snippet;
	type Props = Omit<HTMLInputAttributes, 'size' | 'prefix'> & {
		/** Shown above the field and tied to it */
		label?: string;
		/** A quiet line under the field – the error takes its place */
		hint?: string;
		/** Marks the field invalid and shows this under it */
		error?: string;
		/** Text or an icon inside the field, before the value */
		prefix?: Affix;
		/** Text or an icon inside the field, after the value */
		suffix?: Affix;
		/** sm 28 · md 32 · lg 36 high */
		size?: 'sm' | 'md' | 'lg';
		/** "Optional" next to the label */
		optional?: boolean;
		/** A small × that empties the field while it has a value */
		clearable?: boolean;
		/** A copy button – for API keys, links and IDs */
		copyable?: boolean;
		/** Shows "12/40" under the field; needs maxlength */
		counter?: boolean;
		onclear?: () => void;
		inputClass?: string;
		el?: HTMLInputElement;
	};

	let {
		label,
		hint,
		error,
		prefix,
		suffix,
		size = 'md',
		optional = false,
		clearable = false,
		copyable = false,
		counter = false,
		onclear,
		onkeydown,
		class: cls,
		inputClass,
		id,
		type = 'text',
		value = $bindable(''),
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
	const isPassword = $derived(type === 'password');
	let revealed = $state(false);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;
	const invalid = $derived(Boolean(error) || rest['aria-invalid'] === true || rest['aria-invalid'] === 'true');
	const message = $derived(error || hint || null);
	const showCount = $derived(counter && typeof maxlength === 'number');
	const fallbackName = $derived(label == null && !rest['aria-label'] && !rest['aria-labelledby'] && typeof rest.placeholder === 'string' ? rest.placeholder : undefined);
	const showClear = $derived(clearable && !disabled && !readonly && text.length > 0);
	const scale = $derived(['sm', 'md', 'lg'].includes(size) ? size : 'md');

	function clear() {
		value = '';
		el?.focus();
		onclear?.();
	}
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			el?.select();
			return;
		}
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 1600);
	}
</script>

{#snippet affix(a: Affix, side: 'start' | 'end')}
	<span class="ui-tfc__affix" data-side={side}>
		{#if typeof a === 'string'}{#if side === 'start'}<span class="ui-tfc__affix-text">{a}</span>{:else}{a}{/if}{:else}{@render a()}{/if}
	</span>
{/snippet}

<div class={['ui-tfc', cls]} data-size={scale} data-invalid={invalid || undefined} data-disabled={disabled || undefined} data-readonly={readonly || undefined}>
	{#if label != null}
		<div class="ui-tfc__head">
			<label class="ui-tfc__label" for={inputId}>{label}</label>
			{#if optional}<span class="ui-tfc__optional">Optional</span>{/if}
		</div>
	{/if}
	<!-- A click anywhere on the box puts the caret in the input -->
	<div
		class="ui-tfc__box"
		role="presentation"
		onpointerdown={(e) => {
			if (e.target === el || (e.target as HTMLElement).closest('button')) return;
			e.preventDefault();
			el?.focus();
		}}
	>
		{#if prefix != null}{@render affix(prefix, 'start')}{/if}
		<input
			{...rest}
			bind:this={el}
			bind:value
			id={inputId}
			class={['ui-tfc__input', inputClass]}
			type={isPassword && revealed ? 'text' : type}
			{disabled}
			{readonly}
			{maxlength}
			aria-label={rest['aria-label'] ?? fallbackName}
			aria-invalid={invalid || undefined}
			aria-describedby={[describedBy, message ? messageId : null, showCount ? counterId : null].filter(Boolean).join(' ') || undefined}
			dir={rest.dir ?? 'auto'}
			data-revealed={isPassword ? (revealed ? 'true' : 'false') : undefined}
			onkeydown={(e) => {
				// Esc empties a clearable field
				if (e.key === 'Escape' && showClear) {
					e.preventDefault();
					clear();
				}
				onkeydown?.(e);
			}}
		/>
		{#if suffix != null}{@render affix(suffix, 'end')}{/if}
		{#if showClear}
			<button type="button" class="ui-tfc__action" aria-label="Clear" tabindex="-1" onclick={clear}>
				<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"
					><path
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3.53 12.22a.75.75 0 1 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 1.06-1.06L12 10.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L13.06 12l2.47 2.47Z"
					/></svg
				>
			</button>
		{/if}
		{#if isPassword && !disabled}
			<button type="button" class="ui-tfc__action" aria-label={revealed ? 'Hide password' : 'Show password'} aria-pressed={revealed} onclick={() => (revealed = !revealed)}>
				{#key revealed}
					<span class="ui-tfc__swap">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							{#if revealed}
								<path d="M19.439 15.439c.996-.91 1.719-1.82 2.105-2.36.304-.426.456-.64.456-.955 0-.316-.152-.529-.456-.955C20.178 9.253 16.689 5.124 12 5.124c-.908 0-1.77.155-2.582.418M6.74 6.869c-2.09 1.267-3.6 3.083-4.284 4.04-.304.426-.456.64-.456.955 0 .316.152.529.456.955C3.822 14.735 7.311 18.864 12 18.864c2.008 0 3.786-.757 5.26-1.746" /><path d="M9.858 10a2.98 2.98 0 0 0-.858 2.124 3 3 0 0 0 5.124 2.12M3 3l18 18" />
							{:else}
								<path d="M21.544 11.045C21.848 11.471 22 11.685 22 12c0 .316-.152.529-.456.955C20.178 14.871 16.689 19 12 19c-4.69 0-8.178-4.13-9.544-6.045C2.152 12.529 2 12.315 2 12c0-.316.152-.529.456-.955C3.822 9.129 7.311 5 12 5c4.69 0 8.178 4.13 9.544 6.045Z" /><path d="M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
							{/if}
						</svg>
					</span>
				{/key}
			</button>
		{/if}
		{#if copyable}
			<button type="button" class="ui-tfc__action" data-copied={copied || undefined} aria-label={copied ? 'Copied' : 'Copy'} onclick={copy} disabled={disabled || !text}>
				{#key copied}
					<span class="ui-tfc__swap">
						{#if copied}
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
								><path class="ui-tfc__check" d="M5 12.5 9.5 17 19 7" pathLength="1" /></svg
							>
						{:else}
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
								><path d="M9 15c0-2.828 0-4.243.879-5.121C10.757 9 12.172 9 15 9h1c2.828 0 4.243 0 5.121.879C22 10.757 22 12.172 22 15v1c0 2.828 0 4.243-.879 5.121C20.243 22 18.828 22 16 22h-1c-2.828 0-4.243 0-5.121-.879C9 20.243 9 18.828 9 16v-1Z" /><path
									d="M17 9c-.003-2.957-.047-4.489-.908-5.538a4 4 0 0 0-.554-.554C14.43 2 12.788 2 9.5 2c-3.287 0-4.931 0-6.038.908a4 4 0 0 0-.554.554C2 4.57 2 6.212 2 9.5c0 3.287 0 4.931.908 6.038a4 4 0 0 0 .554.554c1.05.86 2.58.906 5.538.908"
								/></svg
							>
						{/if}
					</span>
				{/key}
			</button>
			<span class="ui-tfc__sr" role="status">{copied ? 'Copied' : ''}</span>
		{/if}
	</div>
	{#if message || showCount}
		<div class="ui-tfc__foot">
			{#key error ? 'error' : 'hint'}
				<p class="ui-tfc__message" id={messageId} dir="auto" aria-live={error ? 'polite' : undefined}>{message}</p>
			{/key}
			{#if showCount}
				<span class="ui-tfc__count" id={counterId} data-full={text.length === maxlength || undefined} data-over={text.length > (maxlength ?? 0) || undefined}>{text.length}/{maxlength}</span>
			{/if}
		</div>
	{/if}
</div>
