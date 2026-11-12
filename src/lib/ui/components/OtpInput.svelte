<!-- OTP Input – ported from affectUI (MIT). Verification code boxes with a gliding ring, paste, error shake, success pill and resend timer. -->
<script lang="ts" module>
	export type OtpStatus = 'idle' | 'verifying' | 'error' | 'success';
	const pad = (n: number) => String(n).padStart(2, '0');
	const clock = (s: number) => {
		if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
		if (s >= 3600) return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
		return `${Math.floor(s / 60)}:${pad(s % 60)}`;
	};
	const MAX_LENGTH = 24;
	const normalize = (text: string) =>
		text
			.normalize('NFKC')
			.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
			.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
	const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import './otp-input.css';

	let {
		length: lengthProp = 6,
		separator = false,
		numeric = true,
		value = $bindable(''),
		onchange,
		oncomplete,
		status = 'idle',
		errorMessage = "That code didn't work. Try again.",
		clearOnError = true,
		successLabel = 'Verified',
		onresend,
		resendIn: resendInProp = 30,
		align = 'start',
		disabled = false,
		autofocus = false,
		label = 'Verification code',
		class: cls
	}: {
		/** Number of boxes */
		length?: number;
		/** A small dash between the boxes – true in the middle, a number after that many */
		separator?: boolean | number;
		/** Digits only; false allows letters too, shown in capitals */
		numeric?: boolean;
		value?: string;
		onchange?: (code: string) => void;
		/** Called once the last box is filled */
		oncomplete?: (code: string) => void;
		status?: OtpStatus;
		errorMessage?: string;
		/** Clears the boxes shortly after an error */
		clearOnError?: boolean;
		successLabel?: string;
		/** Shows "Resend code" once the countdown is over */
		onresend?: () => void;
		/** Seconds until the code can be resent */
		resendIn?: number;
		align?: 'start' | 'center';
		disabled?: boolean;
		autofocus?: boolean;
		label?: string;
		class?: string;
	} = $props();

	const length = $derived(Number.isFinite(lengthProp) ? Math.min(MAX_LENGTH, Math.max(1, Math.floor(lengthProp))) : 6);
	const resendIn = $derived(Number.isFinite(resendInProp) && resendInProp > 0 ? Math.floor(resendInProp) : 0);
	function clean(text: string) {
		let out = '';
		for (const ch of normalize(String(text ?? ''))) {
			const c = numeric ? (/[0-9]/.test(ch) ? ch : '') : /[a-z0-9]/i.test(ch) ? ch.toUpperCase() : '';
			if (c && out.length < length) out += c;
		}
		return out;
	}
	const code = $derived(clean(value));
	let idx = $state(0);
	let focused = $state(false);
	let errorShown = $state(false);
	let clearing = $state(false);
	let locked = $state(false);
	// svelte-ignore state_referenced_locally
	let left = $state(resendIn);
	let announce = $state('');
	let input: HTMLInputElement;
	let slots: HTMLDivElement;
	let ring: HTMLSpanElement;
	let pill: HTMLSpanElement;
	let pillInner: HTMLSpanElement;
	const boxes: HTMLSpanElement[] = [];
	const timers: ReturnType<typeof setTimeout>[] = [];
	const uid = $props.id();

	// Every character remembers when it arrived, so it pops in once; pasted codes arrive one after another
	let prevCode = '';
	let counter = 0;
	let stamps = $state<number[]>([]);
	let delays = $state<number[]>([]);
	$effect.pre(() => {
		const c = code;
		if (prevCode === c) return;
		const changed = [...c].map((ch, i) => ch !== prevCode[i]);
		const first = changed.indexOf(true);
		const bulk = changed.filter(Boolean).length > 1;
		changed.forEach((ch, i) => {
			if (!ch) return;
			stamps[i] = ++counter;
			delays[i] = bulk ? (i - first) * 45 : 0;
		});
		prevCode = c;
	});

	const active = $derived(Math.min(idx, code.length, length - 1));
	const sepAt = $derived(separator === true ? Math.floor(length / 2) : typeof separator === 'number' ? separator : 0);
	const busy = $derived(status === 'verifying' || status === 'success');
	const readOnly = $derived(busy || locked || disabled);
	const showError = $derived(status === 'error' && errorShown);
	const showRing = $derived(!busy && !disabled && (focused || (code.length > 0 && code.length < length)));

	function commit(next: string, nextIdx: number, user = true) {
		const before = code;
		value = next;
		if (next !== before) onchange?.(next);
		idx = Math.max(0, Math.min(nextIdx, next.length, length - 1));
		if (!user) return;
		if (errorShown && next.length) errorShown = false;
		if (next.length === length && next !== before) oncomplete?.(next);
	}
	function oninput() {
		if (readOnly) return;
		const raw = input.value;
		const caretRaw = input.selectionStart ?? raw.length;
		const next = clean(raw);
		const caret = clean(raw.slice(0, caretRaw)).length;
		if (next === code) {
			input.value = code;
			syncSelection();
			return;
		}
		commit(next, caret);
	}
	function onpaste(e: ClipboardEvent) {
		e.preventDefault();
		if (readOnly) return;
		const text = clean(e.clipboardData?.getData('text') ?? '');
		if (!text) return;
		if (text.length >= length) return commit(text.slice(0, length), length - 1);
		const next = (code.slice(0, active) + text + code.slice(active + text.length)).slice(0, length);
		commit(next, active + text.length);
	}
	function onkeydown(e: KeyboardEvent) {
		const last = Math.min(code.length, length - 1);
		const moves: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: last, ArrowUp: 0, ArrowDown: last };
		if (e.key in moves && !e.shiftKey && !e.metaKey) {
			e.preventDefault();
			idx = Math.max(0, Math.min(moves[e.key], last));
		}
	}
	function pick(x: number) {
		let i = boxes.findIndex((b) => b && x < b.getBoundingClientRect().right + 4);
		if (i < 0) i = length - 1;
		idx = Math.min(i, code.length, length - 1);
		requestAnimationFrame(syncSelection);
	}
	// The real input selects the active character, so typing replaces it and Backspace removes it
	function syncSelection() {
		if (!input || document.activeElement !== input) return;
		const i = Math.min(idx, code.length, length - 1);
		if (i < code.length) input.setSelectionRange(i, i + 1);
		else input.setSelectionRange(i, i);
	}
	function layout() {
		const box = boxes[active];
		if (ring && box) {
			const first = !ring.dataset.ready;
			if (first) ring.style.transition = 'none';
			ring.style.width = `${box.offsetWidth}px`;
			ring.style.height = `${box.offsetHeight}px`;
			ring.style.transform = `translate(${box.offsetLeft}px, ${box.offsetTop}px)`;
			if (first) {
				ring.dataset.ready = '1';
				void ring.offsetWidth;
				ring.style.transition = '';
			}
		}
		// The pill starts as wide as all the boxes and morphs down to its label
		if (pill && slots && pillInner) {
			const w = status === 'success' ? pillInner.offsetWidth : slots.offsetWidth;
			pill.style.width = `${w}px`;
			const root = slots.parentElement?.parentElement;
			let shift = 0;
			if (root && w > slots.offsetWidth) {
				const b = root.getBoundingClientRect();
				const own = slots.getBoundingClientRect();
				const l = own.left + own.width / 2 - w / 2;
				shift = Math.min(Math.max(l, b.left), b.right - w) - l;
			}
			pill.style.marginLeft = shift ? `${shift}px` : '';
		}
	}
	$effect(() => {
		void [active, status, code, idx, length];
		tick().then(() => {
			syncSelection();
			layout();
		});
	});
	onMount(() => {
		if (autofocus) input.focus({ preventScroll: true });
		const ro = new ResizeObserver(layout);
		ro.observe(slots);
		return () => {
			ro.disconnect();
			timers.forEach(clearTimeout);
		};
	});

	// Status changes: announce, shake on error, clear for the next try
	let prevStatus: OtpStatus | undefined;
	$effect(() => {
		const s = status;
		const before = prevStatus;
		prevStatus = s;
		if (before === undefined || s === before) return;
		if (s === 'verifying') announce = 'Verifying code';
		if (s === 'success') announce = successLabel;
		if (s !== 'error') return void (errorShown = false);
		errorShown = true;
		announce = errorMessage;
		if (!reduced()) {
			slots?.animate(
				[{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'none' }],
				{ duration: 420, easing: 'ease-out' }
			);
		}
		if (!clearOnError) return;
		locked = true;
		timers.push(
			setTimeout(() => (clearing = true), 700),
			setTimeout(() => {
				clearing = false;
				locked = false;
				commit('', 0, false);
			}, 980)
		);
	});
	// Resend countdown
	$effect(() => {
		if (left <= 0) {
			if (onresend && resendIn > 0) announce = 'You can resend the code now';
			return;
		}
		const t = setTimeout(() => (left -= 1), 1000);
		return () => clearTimeout(t);
	});
	function resend() {
		onresend?.();
		left = resendIn;
		announce = 'A new code is on its way';
	}
	const unit = $derived(numeric ? (length === 1 ? 'digit' : 'digits') : length === 1 ? 'character' : 'characters');
</script>

<div class={['ui-otpc', cls]} data-status={status} data-error={showError || undefined} data-align={align} data-disabled={disabled || undefined}>
	<div class="ui-otpc__field">
		<div
			bind:this={slots}
			class="ui-otpc__slots"
			dir="ltr"
			data-clearing={clearing || undefined}
			style:--n={length}
			style:--sep-w={sepAt > 0 && sepAt < length ? 'calc(var(--ui-otpc-gap) + 8px)' : '0px'}
		>
			{#each { length } as _, i (i)}
				{#if sepAt > 0 && sepAt < length && i === sepAt}<span class="ui-otpc__sep"></span>{/if}
				<span bind:this={boxes[i]} class="ui-otpc__box" data-filled={code[i] ? '' : undefined} style:--i={i}>
					{#if code[i]}{#key stamps[i]}<span class="ui-otpc__char" style:animation-delay="{delays[i] ?? 0}ms">{code[i]}</span>{/key}{/if}
				</span>
			{/each}
			<span bind:this={ring} class="ui-otpc__ring" data-show={showRing || undefined} aria-hidden="true">
				<span class="ui-otpc__caret" data-show={(focused && !code[active] && !readOnly) || undefined}></span>
			</span>
			<span bind:this={pill} class="ui-otpc__pill" aria-hidden="true">
				<span bind:this={pillInner} class="ui-otpc__pill-inner">
					<svg viewBox="0 0 24 24" class="ui-otpc__check" aria-hidden="true"><path d="M5.5 12.5l4 4L18.5 8" pathLength="1" /></svg>
					<span class="ui-otpc__pill-text" title={successLabel}>{successLabel}</span>
				</span>
			</span>
			<input
				bind:this={input}
				class="ui-otpc__input"
				type="text"
				value={code}
				inputmode={numeric ? 'numeric' : 'text'}
				pattern={numeric ? '[0-9]*' : undefined}
				autocomplete="one-time-code"
				autocapitalize={numeric ? 'off' : 'characters'}
				autocorrect="off"
				spellcheck={false}
				enterkeyhint="done"
				aria-label="{label}, {length} {unit}"
				aria-invalid={showError || undefined}
				aria-describedby={showError ? `${uid}-msg` : undefined}
				{disabled}
				readonly={busy || locked}
				{oninput}
				{onpaste}
				{onkeydown}
				onfocus={() => {
					focused = true;
					requestAnimationFrame(syncSelection);
				}}
				onblur={() => (focused = false)}
				onpointerup={(e) => pick(e.clientX)}
				onselect={() => {
					const want = active < code.length ? [active, active + 1] : [active, active];
					if (input.selectionStart !== want[0] || input.selectionEnd !== want[1]) syncSelection();
				}}
			/>
		</div>
	</div>
	<div class="ui-otpc__msg" data-show={showError || undefined}>
		<div class="ui-otpc__msg-inner">
			<p id="{uid}-msg" class="ui-otpc__msg-text">
				<svg viewBox="0 0 24 24" class="ui-otpc__alert" aria-hidden="true"><path d="M12 8v4.5M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
				<span>{errorMessage}</span>
			</p>
		</div>
	</div>
	{#if onresend}
		<div class="ui-otpc__resend" data-hidden={status === 'success' || undefined}>
			<span class="ui-otpc__resend-q">Didn't get a code?</span>
			{#if left > 0}
				<span class="ui-otpc__swap ui-otpc__wait">Resend in&nbsp;<span class="ui-otpc__time">{clock(left)}</span></span>
			{:else}
				<button type="button" class="ui-otpc__swap ui-otpc__resend-btn" onclick={resend} disabled={disabled || busy}>Resend code</button>
			{/if}
		</div>
	{/if}
	<span class="ui-otpc__live" aria-live="polite">{announce}</span>
</div>
