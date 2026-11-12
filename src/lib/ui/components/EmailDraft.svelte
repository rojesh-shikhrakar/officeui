<!-- Email Draft – ported from affectUI (MIT). An agent-written email for review: recipient menu, tones, inline edit, attach, send with undo. -->
<script lang="ts" module>
	export type DraftContact = { name: string; email: string };
	export type DraftTone = { id: string; label: string; body: (contact: DraftContact) => string };
	const first = (c: DraftContact) => c.name.trim().split(/\s+/)[0] ?? '';
	const initials = (name: string) =>
		name
			.trim()
			.split(/\s+/)
			.map((w) => w.match(/[\p{L}\p{N}]/u)?.[0] ?? '')
			.join('')
			.slice(0, 2)
			.toUpperCase();
	const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const NO_ONE: DraftContact = { name: '', email: '' };
	const defaultTones: DraftTone[] = [
		{ id: 'friendly', label: 'Friendly', body: (c) => `Hi ${first(c)}, a heads-up that your Growth plan renews on October 9 for $8,900 a year. If you'd like to add seats or switch to monthly billing, you can review the quote here:` },
		{ id: 'short', label: 'Short', body: (c) => `Hi ${first(c)}, your Growth plan renews on October 9 ($8,900/year). Quote for changes:` },
		{ id: 'formal', label: 'Formal', body: (c) => `Dear ${c.name}, this is a reminder that your Growth subscription is scheduled to renew on October 9 at $8,900 per year. Should you wish to adjust seats or billing, please review the attached quote:` }
	];
	type Phase = 'draft' | 'sending' | 'sent' | 'discarded';
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import './email-draft.css';

	let {
		reference = 'SUB-1182',
		account = 'Northwind Logistics',
		amount = '$8,900',
		status = 'Renews in 5 days',
		agent = 'Renewal agent',
		contacts = [
			{ name: 'Jonas Weber', email: 'jonas@northwind.io' },
			{ name: 'Lena Hart', email: 'lena@northwind.io' },
			{ name: 'Finance team', email: 'billing@northwind.io' }
		],
		attachment = 'Renewal-quote.pdf',
		tones = defaultTones,
		link = { label: 'Review quote', href: '#' },
		onsend,
		ondiscard,
		class: cls
	}: {
		reference?: string;
		account?: string;
		amount?: string;
		status?: string;
		agent?: string;
		contacts?: DraftContact[];
		attachment?: string | null;
		/** Text variants to switch between – the first one is shown first */
		tones?: DraftTone[];
		link?: { label: string; href: string };
		onsend?: (email: { to: DraftContact; body: string; attachment: string | null }) => void;
		ondiscard?: () => void;
		class?: string;
	} = $props();

	// svelte-ignore state_referenced_locally
	let to = $state<DraftContact>(contacts[0] ?? NO_ONE);
	// svelte-ignore state_referenced_locally
	let file = $state<string | null>(attachment);
	// svelte-ignore state_referenced_locally
	let tone = $state(tones[0]?.id ?? '');
	let edited = $state<string | null>(null);
	let editing = $state(false);
	let menu = $state(false);
	let phase = $state<Phase>('draft');
	let toneKey = $state(0);
	let inner: HTMLDivElement;
	let outer: HTMLDivElement;
	let textEl = $state<HTMLTextAreaElement>();
	let menuEl = $state<HTMLDivElement>();
	const timers: ReturnType<typeof setTimeout>[] = [];
	const generated = $derived(tones.find((t) => t.id === tone)?.body(to) ?? '');
	const body = $derived(edited ?? generated);
	const open = $derived(phase === 'draft' || phase === 'sending');
	const badge = $derived(phase === 'sent' ? { text: 'Sent', tone: 'ok' } : phase === 'discarded' ? { text: 'Discarded', tone: 'muted' } : { text: 'Ready for review', tone: 'ok' });

	onMount(() => {
		const sync = () => (outer.style.height = `${inner.offsetHeight}px`);
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(inner);
		const frame = requestAnimationFrame(() => outer.setAttribute('data-smooth', ''));
		return () => {
			ro.disconnect();
			cancelAnimationFrame(frame);
			timers.forEach(clearTimeout);
		};
	});
	// The edit field grows with its text
	$effect(() => {
		void [editing, body];
		tick().then(() => {
			if (!textEl) return;
			textEl.style.height = 'auto';
			textEl.style.height = `${textEl.scrollHeight}px`;
		});
	});
	function startEditing() {
		edited = body;
		editing = true;
		requestAnimationFrame(() => {
			if (!textEl) return;
			textEl.focus();
			textEl.setSelectionRange(textEl.value.length, textEl.value.length);
		});
	}
	function pickTone(id: string) {
		if (id === tone && edited === null) return;
		tone = id;
		edited = null;
		editing = false;
		toneKey += 1;
	}
	function pickContact(c: DraftContact) {
		// Keep manual edits, but follow the new name in the text
		const full = to.name.trim();
		const parts = [full && escape(full), first(to) && `\\b${escape(first(to))}\\b`].filter(Boolean);
		if (edited !== null && parts.length) edited = edited.replace(new RegExp(parts.join('|'), 'g'), (m) => (m === full ? c.name.trim() : first(c)));
		to = c;
		menu = false;
	}
	function send() {
		if (phase !== 'draft' || !to.email) return;
		editing = false;
		phase = 'sending';
		timers.push(
			setTimeout(() => {
				phase = 'sent';
				onsend?.({ to, body: `${body} ${link.label}: ${link.href}`, attachment: file });
			}, 900)
		);
	}
	function discard() {
		editing = false;
		phase = 'discarded';
		ondiscard?.();
	}
</script>

<svelte:document
	onpointerdown={(e) => menu && !menuEl?.contains(e.target as Node) && (menu = false)}
	onkeydown={(e) => menu && e.key === 'Escape' && (menu = false)}
/>

{#snippet icon(d: string)}<svg viewBox="0 0 24 24" aria-hidden="true"><path {d} /></svg>{/snippet}

<div class={['ui-edc', cls]} data-phase={phase}>
	<div class="ui-edc__record">
		<div class="ui-edc__ref">
			<span class="ui-edc__id" title={reference}>{reference}</span>
			{#if status}<span class="ui-edc__status" dir="auto" title={status}>{status}</span>{/if}
			<span class="ui-edc__amount">{amount}</span>
		</div>
		<span class="ui-edc__account" dir="auto">{account}</span>
	</div>
	<div class="ui-edc__outer" bind:this={outer} data-menu={menu ? '' : undefined}>
		<div bind:this={inner}>
			{#if open}
				<div class="ui-edc__draft" data-sending={phase === 'sending' ? '' : undefined}>
					<div class="ui-edc__meta">
						<div class="ui-edc__to" bind:this={menuEl}>
							<span class="ui-edc__label">To</span>
							{#if to.email}
								<button type="button" class="ui-edc__recipient" aria-haspopup="listbox" aria-expanded={menu} title="{to.name} <{to.email}>" onclick={() => (menu = !menu)}>
									<span class="ui-edc__name" dir="auto">{to.name}</span>
									<span class="ui-edc__email">{to.email}</span>
									<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
								</button>
							{:else}
								<span class="ui-edc__email">No recipient</span>
							{/if}
							{#if menu}
								<ul class="ui-edc__menu" role="listbox" aria-label="Recipient">
									{#each contacts as c, i (`${c.email}-${i}`)}
										<li>
											<button type="button" role="option" aria-selected={c.email === to.email} onclick={() => pickContact(c)}>
												<span class="ui-edc__avatar" aria-hidden="true">{initials(c.name)}</span>
												<span class="ui-edc__menu-text" dir="auto">{c.name}<small>{c.email}</small></span>
												{#if c.email === to.email}<svg class="ui-edc__tick" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4 8-9" /></svg>{/if}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
						{#if file}
							<span class="ui-edc__file">
								{@render icon('m15.5 7.5-6.4 6.4a1.8 1.8 0 0 0 2.5 2.5l6.7-6.7a3.5 3.5 0 0 0-5-5l-6.9 6.9a5.2 5.2 0 0 0 7.4 7.4l6-6')}
								<span class="ui-edc__file-name" title={file}>{file}</span>
								<button type="button" aria-label="Remove {file}" onclick={() => (file = null)}>{@render icon('M7 7l10 10M17 7 7 17')}</button>
							</span>
						{:else if attachment}
							<button type="button" class="ui-edc__attach" onclick={() => (file = attachment)}>
								{@render icon('M12 6v12M6 12h12')}<span class="ui-edc__file-name" title={attachment}>Attach {attachment}</span>
							</button>
						{/if}
					</div>
					<div class="ui-edc__body">
						{#if editing}
							<textarea
								bind:this={textEl}
								class="ui-edc__edit"
								dir="auto"
								value={edited ?? ''}
								oninput={(e) => (edited = e.currentTarget.value)}
								onkeydown={(e) => {
									if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
										e.preventDefault();
										send();
									}
									if (e.key === 'Escape') editing = false;
								}}
								onblur={() => (editing = false)}
								aria-label="Email text"
							></textarea>
						{:else}
							{#key toneKey}
								<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
								<p class="ui-edc__text" dir="auto" onclick={startEditing} title="Click to edit">
									{body}
									<a href={link.href} onclick={(e) => e.stopPropagation()}>{link.label}</a>
								</p>
							{/key}
						{/if}
					</div>
					<div class="ui-edc__tune">
						<div class="ui-edc__tones" role="group" aria-label="Tone">
							{#each tones as t (t.id)}<button type="button" aria-pressed={tone === t.id && edited === null} onclick={() => pickTone(t.id)}>{t.label}</button>{/each}
							<button type="button" class="ui-edc__edit-btn" aria-pressed={editing} aria-label="Edit text" onclick={startEditing}>{@render icon('M14.5 5.5 18.5 9.5M5 19l1-4L15.5 5.5l4 4L10 19l-5 0Z')}</button>
						</div>
						<span class="ui-edc__hint">⌘ Enter to send</span>
					</div>
				</div>
			{:else}
				<div class="ui-edc__receipt" role="status">
					<span class="ui-edc__receipt-icon" data-tone={phase === 'sent' ? 'ok' : 'muted'} aria-hidden="true">{@render icon(phase === 'sent' ? 'm6 12.5 4 4 8-9' : 'M7 7l10 10M17 7 7 17')}</span>
					<span class="ui-edc__receipt-text">
						{#if phase === 'sent'}Sent to <b dir="auto">{to.name}</b>{file ? ` with ${file}` : ''}{:else}Draft discarded{/if}
					</span>
					<button type="button" class="ui-edc__undo" onclick={() => (phase = 'draft')}>Undo</button>
				</div>
			{/if}
		</div>
	</div>
	<div class="ui-edc__foot">
		<span class="ui-edc__agent" title={agent}>{agent}</span>
		{#key badge.text}<span class="ui-edc__badge" data-tone={badge.tone}>{badge.text}</span>{/key}
		{#if open}
			<div class="ui-edc__buttons">
				<button type="button" class="ui-edc__secondary" onclick={discard} disabled={phase === 'sending'}>Discard</button>
				<button type="button" class="ui-edc__primary" onclick={send} disabled={phase === 'sending' || !to.email}>
					{#if phase === 'sending'}<span class="ui-edc__spinner" aria-hidden="true"></span>Sending{:else}Send email{/if}
				</button>
			</div>
		{/if}
	</div>
</div>
