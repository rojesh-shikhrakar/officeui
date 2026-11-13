<!-- Message Actions – The quiet bar under an AI message: copy, regenerate with versions, feedback with reasons, read aloud. -->
<script lang="ts" module>
	export type MessageActionKey = 'copy' | 'regenerate' | 'feedback' | 'speak';
	export type FeedbackKind = 'up' | 'down';
	const reduced = () => typeof window !== 'undefined' && matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	const icons = {
		copy: 'M5.5 2A1.5 1.5 0 0 0 4 3.5V4h5A3 3 0 0 1 12 7v5h.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 12.5 2h-7ZM3.5 5A1.5 1.5 0 0 0 2 6.5v6A1.5 1.5 0 0 0 3.5 14H9a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 9 5H3.5Z',
		check: 'M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm8.9-1.2a.5.5 0 0 0-.8-.6L7.44 9.23 6.35 8.15a.5.5 0 1 0-.7.7l1.5 1.5a.5.5 0 0 0 .76-.06l2.5-3.5Z',
		redo: 'M13 8a5 5 0 1 1-1.46-3.54M13 2.5v2.5h-2.5',
		thumb: 'M4.5 7v6.5H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1.5Zm1 6.5h5.95a1.5 1.5 0 0 0 1.47-1.2l.86-4.3A1.5 1.5 0 0 0 12.31 6.2H9.5l.42-2.08A1.4 1.4 0 0 0 7.3 3.1L5.5 6.8v6.7Z',
		next: 'M10.85 7.65a.5.5 0 0 1 0 .7L7.2 12a.5.5 0 0 1-.7-.7L9.79 8 6.5 4.7a.5.5 0 1 1 .7-.7l3.65 3.65Z',
		close: 'm4.5 4.5 7 7m0-7-7 7'
	};
	const DEFAULT_ACTIONS: MessageActionKey[] = ['copy', 'regenerate', 'feedback', 'speak'];
	const whole = (n: unknown, fallback: number) => (typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : fallback);
	const fmt = (n: number) => n.toLocaleString('en-US');
	const DEFAULT_REASONS = ['Not accurate', 'Too long', "Didn't follow instructions", 'Other'];
</script>

<script lang="ts">
	import MacSwap from './MacSwap.svelte';
	import './message-actions.css';

	let {
		text = 'Here is a short plan for the launch: draft the page, review it with the team and publish on Friday.',
		actions: actionsProp = DEFAULT_ACTIONS,
		versions = 1,
		version = $bindable(),
		onversionchange,
		oncopy,
		onregenerate,
		regenerating = false,
		onfeedback,
		reasons = DEFAULT_REASONS,
		onspeak,
		speaking,
		speakDuration,
		quiet = false,
		label = 'Message actions',
		class: cls
	}: {
		/** The message text – copied by Copy and used to time Read aloud */
		text?: string;
		/** Which actions to show, in this order */
		actions?: MessageActionKey[];
		/** All versions of the message, or how many there are. From 2 on the switcher shows */
		versions?: number | string[];
		/** Version index (0-based); defaults to the newest */
		version?: number;
		onversionchange?: (index: number) => void;
		oncopy?: (text?: string) => void;
		onregenerate?: () => void;
		/** Keeps the regenerate arrow spinning while a new version is written */
		regenerating?: boolean;
		onfeedback?: (kind: FeedbackKind | null, reason?: string) => void;
		reasons?: string[];
		onspeak?: (playing: boolean) => void;
		speaking?: boolean;
		speakDuration?: number;
		/** Faded until the message (data-ui-message wrapper) is hovered */
		quiet?: boolean;
		label?: string;
		class?: string;
	} = $props();

	const uid = $props.id();
	const actions = $derived([...new Set(actionsProp)].filter((k) => DEFAULT_ACTIONS.includes(k)));
	const count = $derived(Math.max(1, whole(typeof versions === 'number' ? versions : Array.isArray(versions) ? versions.length : 1, 1)));
	// svelte-ignore state_referenced_locally
	let seenCount = count;
	let vote = $state<FeedbackKind | null>(null);
	let panel = $state(false);
	let reason = $state<string | null>(null);
	let other = $state('');
	let sent = $state(false);
	// A new version arrived: show it, and its vote starts fresh
	$effect.pre(() => {
		if (seenCount === count) return;
		if (count > seenCount) {
			version = count - 1;
			vote = null;
			panel = false;
		}
		seenCount = count;
	});
	const index = $derived(Math.min(count - 1, Math.max(0, whole(version, count - 1))));
	function goTo(i: number) {
		const next = Math.min(count - 1, Math.max(0, i));
		if (next === index) return;
		version = next;
		onversionchange?.(next);
		announce(`Version ${fmt(next + 1)} of ${fmt(count)}`);
	}
	let status = $state('');
	const announce = (s: string) => (status = status === s ? `${s} ` : s);

	let copied = $state(0);
	$effect(() => {
		if (!copied) return;
		const t = setTimeout(() => (copied = 0), 1600);
		return () => clearTimeout(t);
	});
	function copy() {
		try {
			if (text !== undefined) navigator.clipboard?.writeText(text).catch(() => {});
		} catch {
			/* no clipboard – the check still confirms the press */
		}
		oncopy?.(text);
		copied = Date.now();
		announce('Copied');
	}
	let spin = $state(0);
	function regenerate() {
		spin += 1;
		onregenerate?.();
		announce('Regenerating');
	}
	function thumbsUp() {
		if (vote === 'up') return (vote = null), onfeedback?.(null);
		vote = 'up';
		panel = false;
		onfeedback?.('up');
		announce('Marked as good response');
	}
	function thumbsDown() {
		if (vote === 'down') return (vote = null), (panel = false), onfeedback?.(null);
		vote = 'down';
		panel = true;
		sent = false;
		reason = null;
		other = '';
		onfeedback?.('down');
		announce('Marked as bad response. Tell us what went wrong below');
	}
	function send() {
		if (!reason || sent) return;
		onfeedback?.('down', reason === 'Other' ? other.trim() || 'Other' : reason);
		sent = true;
		announce('Thanks for the feedback');
	}
	$effect(() => {
		if (!sent) return;
		const t = setTimeout(() => (panel = false), reduced() ? 1200 : 1500);
		return () => clearTimeout(t);
	});
	let downEl = $state<HTMLButtonElement>();
	function closePanel() {
		panel = false;
		downEl?.focus();
	}
	let innerSpeaking = $state(false);
	const playing = $derived(speaking ?? innerSpeaking);
	const duration = $derived(typeof speakDuration === 'number' && speakDuration > 0 ? speakDuration : Math.max(2600, (text ? text.trim().split(/\s+/).length : 0) * 380));
	$effect(() => {
		if (speaking !== undefined || !innerSpeaking) return;
		const t = setTimeout(() => {
			innerSpeaking = false;
			onspeak?.(false);
			announce('Finished reading');
		}, duration);
		return () => clearTimeout(t);
	});
	function speak() {
		const next = !playing;
		if (speaking === undefined) innerSpeaking = next;
		onspeak?.(next);
		announce(next ? 'Reading aloud' : 'Stopped reading');
	}
	const active = $derived(Boolean(copied) || panel || playing || regenerating);
</script>

{#snippet glyph(d: string, solid = false)}<svg viewBox="0 0 16 16" class="ui-mac__glyph" data-solid={solid || undefined} aria-hidden="true"><path {d} /></svg>{/snippet}
{#snippet tip(t: string)}<span class="ui-mac__tip" aria-hidden="true"><MacSwap text={t} /></span>{/snippet}

<div class={['ui-mac', cls]} data-quiet={quiet ? '' : undefined} data-active={active ? '' : undefined}>
	<div class="ui-mac__bar" role="group" aria-label={label}>
		{#each actions as key (key)}
			{#if key === 'copy'}
				<span class="ui-mac__item" data-flash={copied ? '' : undefined}>
					<button type="button" class="ui-mac__btn ui-mac__btn--copy" aria-label={copied ? 'Copied' : 'Copy message'} data-done={copied ? '' : undefined} onclick={copy}>
						<span class="ui-mac__icon ui-mac__morph">
							<span class="ui-mac__layer" data-on={copied ? undefined : ''}>{@render glyph(icons.copy, true)}</span>
							<span class="ui-mac__layer ui-mac__layer--check" data-on={copied ? '' : undefined}>{@render glyph(icons.check, true)}</span>
						</span>
					</button>
					{@render tip(copied ? 'Copied' : 'Copy')}
				</span>
			{:else if key === 'regenerate'}
				<span class="ui-mac__regen">
					<span class="ui-mac__item">
						<button type="button" class="ui-mac__btn ui-mac__btn--regenerate" aria-label="Regenerate response" data-busy={regenerating ? '' : undefined} onclick={regenerate}>
							<span class="ui-mac__icon">{#key spin}<span class="ui-mac__spin" data-spin={spin ? '' : undefined}>{@render glyph(icons.redo)}</span>{/key}</span>
						</button>
						{@render tip(regenerating ? 'Writing…' : 'Regenerate')}
					</span>
					<span class="ui-mac__versions" data-open={count > 1 ? '' : undefined} inert={count < 2}>
						<span class="ui-mac__versions-clip" role="group" aria-label="Versions">
							<button type="button" class="ui-mac__step" data-dir="prev" aria-label="Previous version" disabled={index === 0} onclick={() => goTo(index - 1)}>{@render glyph(icons.next, true)}</button>
							<span class="ui-mac__count" aria-label="Version {fmt(index + 1)} of {fmt(count)}">
								<MacSwap text={fmt(index + 1)} class="ui-mac__count-now" /><span aria-hidden="true">/</span><MacSwap text={fmt(count)} />
							</span>
							<button type="button" class="ui-mac__step" data-dir="next" aria-label="Next version" disabled={index >= count - 1} onclick={() => goTo(index + 1)}>{@render glyph(icons.next, true)}</button>
						</span>
					</span>
				</span>
			{:else if key === 'feedback'}
				<span class="ui-mac__item">
					<button type="button" class="ui-mac__btn ui-mac__btn--up" aria-label="Good response" aria-pressed={vote === 'up'} onclick={thumbsUp}>
						<span class="ui-mac__icon ui-mac__thumb">{@render glyph(icons.thumb, true)}</span>
					</button>
					{@render tip(vote === 'up' ? 'Thanks!' : 'Good response')}
				</span>
				<span class="ui-mac__item">
					<button
						bind:this={downEl}
						type="button"
						class="ui-mac__btn ui-mac__btn--down"
						aria-label="Bad response"
						aria-pressed={vote === 'down'}
						aria-expanded={panel}
						aria-controls="{uid}-feedback"
						onclick={thumbsDown}
					>
						<span class="ui-mac__icon ui-mac__thumb">{@render glyph(icons.thumb, true)}</span>
					</button>
					{@render tip('Bad response')}
				</span>
			{:else}
				<span class="ui-mac__item">
					<button type="button" class="ui-mac__btn ui-mac__btn--speak" aria-label={playing ? 'Stop reading' : 'Read aloud'} aria-pressed={playing} onclick={speak}>
						<span class="ui-mac__icon ui-mac__morph">
							<span class="ui-mac__layer" data-on={playing ? undefined : ''}>
								<svg viewBox="0 0 16 16" class="ui-mac__glyph" aria-hidden="true"
									><path class="ui-mac__fill" d="M7.4 3.2a.6.6 0 0 1 1 .46v8.68a.6.6 0 0 1-1 .46L4.6 10.5H3A1.5 1.5 0 0 1 1.5 9V7A1.5 1.5 0 0 1 3 5.5h1.6l2.8-2.3Z" /><path
										d="M10.6 6.2a2.6 2.6 0 0 1 0 3.6M12.4 4.4a5.2 5.2 0 0 1 0 7.2"
									/></svg
								>
							</span>
							<span class="ui-mac__layer ui-mac__eq" data-on={playing ? '' : undefined}><i></i><i></i><i></i><i></i></span>
						</span>
					</button>
					{@render tip(playing ? 'Stop' : 'Read aloud')}
				</span>
			{/if}
		{/each}
	</div>
	{#if actions.includes('feedback')}
		<div id="{uid}-feedback" class="ui-mac__fold" data-open={panel ? '' : undefined} inert={!panel}>
			<div class="ui-mac__clip">
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions (Escape closes the feedback group) -->
				<div
					class="ui-mac__panel"
					role="group"
					aria-labelledby="{uid}-ask"
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							e.stopPropagation();
							closePanel();
						}
					}}
				>
					<div class="ui-mac__panel-head">
						<span id="{uid}-ask" class="ui-mac__ask">What went wrong?</span>
						<button type="button" class="ui-mac__close" aria-label="Close feedback" onclick={closePanel}>{@render glyph(icons.close)}</button>
					</div>
					<div class="ui-mac__chips">
						{#each reasons as r, i (`${r}-${i}`)}
							<button type="button" class="ui-mac__chip" aria-pressed={reason === r} disabled={sent} onclick={() => (reason = reason === r ? null : r)} title={r} dir="auto">{r}</button>
						{/each}
						<button type="button" class="ui-mac__send" data-sent={sent ? '' : undefined} disabled={!reason} aria-disabled={sent || undefined} onclick={send}>
							<MacSwap text={sent ? 'Thanks!' : 'Send'} tick={sent} />
						</button>
					</div>
					{#if reasons.includes('Other')}
						<div class="ui-mac__fold" data-open={reason === 'Other' && !sent ? '' : undefined} inert={reason !== 'Other' || sent}>
							<div class="ui-mac__clip">
								<input
									class="ui-mac__input"
									bind:value={other}
									placeholder="Tell us more (optional)"
									dir="auto"
									aria-label="What went wrong, in your words"
									onkeydown={(e) => e.key === 'Enter' && send()}
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	<span class="ui-mac__sr" aria-live="polite">{status}</span>
</div>
