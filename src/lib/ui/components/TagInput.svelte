<!-- Tag Input – Several values as chips: validate, split on separators, paste, keyboard editing. -->
<script lang="ts">
	import { tick } from 'svelte';
	import './tag-input.css';

	let {
		value = $bindable(['design', 'research']),
		onchange,
		label,
		hint,
		error,
		optional = false,
		placeholder = 'Add…',
		validate,
		normalize = (t: string) => t.trim(),
		splitOnSpace = false,
		max,
		avatar = false,
		disabled = false,
		name,
		id,
		class: cls,
		'aria-label': ariaLabel
	}: {
		/** The chips */
		value?: string[];
		onchange?: (tags: string[]) => void;
		label?: string;
		hint?: string;
		error?: string;
		optional?: boolean;
		placeholder?: string;
		/** Checks a value before it becomes a chip: true, or a message that says what's wrong */
		validate?: (tag: string) => true | string;
		/** Cleans a value before it's checked (default: trim) */
		normalize?: (tag: string) => string;
		/** Also split on spaces – for emails and single words */
		splitOnSpace?: boolean;
		/** At most this many chips */
		max?: number;
		/** A small circle with the first letter on every chip */
		avatar?: boolean;
		disabled?: boolean;
		/** Sends the chips with a form, one hidden input per chip */
		name?: string;
		id?: string;
		class?: string;
		'aria-label'?: string;
	} = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const labelId = `${uid}-label`;
	const messageId = `${uid}-message`;
	const liveId = `${uid}-live`;
	let draft = $state('');
	let problem = $state('');
	let armed = $state(false);
	let flash = $state<{ tag: string; n: number } | null>(null);
	let said = $state('');
	let input = $state<HTMLInputElement>();
	let box = $state<HTMLDivElement>();
	const tags = $derived(value ?? []);
	const full = $derived(max != null && tags.length >= max);
	const shownError = $derived(error || problem || null);
	const invalid = $derived(Boolean(error) || Boolean(problem));
	const message = $derived(shownError ?? (hint || null));
	const split = $derived(splitOnSpace ? /[\s,;]+/ : /[,;\n]+/);

	function set(next: string[]) {
		value = next;
		onchange?.(next);
	}
	// Adds every good value; whatever doesn't pass stays in the field with a message
	function commit(text: string, rest = '') {
		const parts = text.split(split).map(normalize).filter(Boolean);
		if (!parts.length) return void (draft = rest);
		const added: string[] = [];
		const left: string[] = [];
		let why = '';
		for (const p of parts) {
			const check = validate ? validate(p) : true;
			if (check !== true) {
				left.push(p);
				why ||= check;
			} else if (tags.includes(p) || added.includes(p)) flash = { tag: p, n: Date.now() };
			else if (max != null && tags.length + added.length >= max) {
				left.push(p);
				why ||= `Up to ${max} at a time.`;
			} else added.push(p);
		}
		if (added.length) {
			set([...tags, ...added]);
			said = added.length === 1 ? `${added[0]} added` : `${added.length} added`;
		}
		const j = splitOnSpace ? ' ' : ', ';
		draft = [left.join(j), rest].filter(Boolean).join(j);
		problem = why;
	}
	function remove(tag: string, focusInput = true) {
		set(tags.filter((t) => t !== tag));
		said = `${tag} removed`;
		if (focusInput) input?.focus();
	}
	const chips = () => [...(box?.querySelectorAll<HTMLElement>('.ui-tagc__chip') ?? [])];

	function keydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (e.isComposing) return;
		const sep = e.key === ',' || e.key === ';' || (splitOnSpace && e.key === ' ');
		if ((e.key === 'Enter' || e.key === 'Tab' || sep) && draft.trim()) {
			e.preventDefault();
			return commit(draft);
		}
		if (sep) return e.preventDefault();
		if (e.key === 'Backspace' && !draft && tags.length) {
			// First press marks the last chip, the second takes it out
			e.preventDefault();
			if (armed) {
				remove(tags[tags.length - 1]);
				armed = false;
			} else armed = true;
			return;
		}
		if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0 && tags.length) {
			e.preventDefault();
			return chips().at(-1)?.focus();
		}
		if (e.key === 'Escape' && draft) {
			e.preventDefault();
			draft = '';
			problem = '';
		}
		armed = false;
	}
	function chipKey(e: KeyboardEvent, i: number) {
		const list = chips();
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			list[Math.max(0, i - 1)]?.focus();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			if (i + 1 < list.length) list[i + 1].focus();
			else input?.focus();
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault();
			const next = list[i + 1] ?? null;
			remove(tags[i], false);
			tick().then(() => (next && next.isConnected ? next.focus() : input?.focus()));
		}
	}
	function paste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text') ?? '';
		if (!split.test(text.trim())) return;
		e.preventDefault();
		commit(draft + (draft ? (splitOnSpace ? ' ' : ',') : '') + text);
	}
	function oninput(e: Event & { currentTarget: HTMLInputElement }) {
		const v = e.currentTarget.value;
		armed = false;
		if (problem) problem = '';
		// A separator typed anywhere turns what's before it into chips
		const parts = v.split(split);
		if (parts.length > 1) commit(parts.slice(0, -1).join(','), parts[parts.length - 1]);
		else draft = v;
	}
</script>

<div class={['ui-tagc', cls]} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
	{#if label != null}
		<div class="ui-tagc__head">
			<label class="ui-tagc__label" id={labelId} for={inputId}>{label}</label>
			{#if optional}<span class="ui-tagc__optional">Optional</span>{/if}
		</div>
	{/if}
	<div
		bind:this={box}
		class="ui-tagc__box"
		role="presentation"
		onpointerdown={(e) => {
			if (e.target === e.currentTarget) {
				e.preventDefault();
				input?.focus();
			}
		}}
	>
		{#each tags as t, i (t)}
			<span
				class="ui-tagc__chip"
				role="option"
				aria-selected="false"
				tabindex="-1"
				title={t}
				data-armed={(armed && i === tags.length - 1) || undefined}
				data-flash={flash?.tag === t ? flash.n : undefined}
				onkeydown={(e) => chipKey(e, i)}
				onanimationend={(e) => e.animationName === 'ui-tagc-flash' && (flash = null)}
			>
				{#if avatar}<span class="ui-tagc__avatar" aria-hidden="true">{(Array.from(t)[0] ?? '').toUpperCase()}</span>{/if}
				<span class="ui-tagc__text">{t}</span>
				{#if !disabled}
					<button type="button" class="ui-tagc__remove" tabindex="-1" aria-label="Remove {t}" onpointerdown={(e) => e.preventDefault()} onclick={() => remove(t)}>
						<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>
					</button>
				{/if}
			</span>
		{/each}
		<input
			bind:this={input}
			id={inputId}
			class="ui-tagc__input"
			value={draft}
			placeholder={full ? '' : tags.length ? 'Add more…' : placeholder}
			disabled={disabled || full}
			dir="auto"
			autocomplete="off"
			spellcheck={false}
			aria-label={ariaLabel}
			aria-invalid={invalid || undefined}
			aria-describedby={[message ? messageId : null, liveId].filter(Boolean).join(' ')}
			{oninput}
			onkeydown={keydown}
			onpaste={paste}
			onblur={() => {
				armed = false;
				if (draft.trim()) commit(draft);
			}}
		/>
	</div>
	{#if name}{#each tags as t (t)}<input type="hidden" {name} value={t} />{/each}{/if}
	{#if message || max != null}
		<div class="ui-tagc__foot">
			{#if message}{#key shownError ? 'error' : 'hint'}<p class="ui-tagc__message" id={messageId} aria-live={shownError ? 'polite' : undefined}>{message}</p>{/key}{/if}
			{#if max != null}<span class="ui-tagc__count" data-full={full || undefined}>{tags.length}/{max}</span>{/if}
		</div>
	{/if}
	<span class="ui-tagc__sr" id={liveId} role="status">{said}</span>
</div>
