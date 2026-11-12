<!-- Comment Thread – ported from affectUI (MIT). One comment with replies, an assistant that answers, foldable status details. -->
<script lang="ts" module>
	export type ThreadAuthor = { name: string; avatar?: string; assistant?: boolean };
	export type ThreadMessage = { id: string; author: ThreadAuthor; createdAt: Date | number; text: string; status?: string; details?: string[] };
	function ago(time: number, now: number) {
		const s = Math.max(0, Math.round((now - time) / 1000));
		if (s < 45) return 'just now';
		const m = Math.round(s / 60);
		if (m < 60) return `${m}min ago`;
		const h = Math.round(m / 60);
		if (h < 24) return `${h}h ago`;
		const d = Math.round(h / 24);
		if (d < 30) return `${d}d ago`;
		return d < 365 ? `${Math.round(d / 30)}mo ago` : `${Math.round(d / 365)}y ago`;
	}
	const fmt = new Intl.NumberFormat('en');
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.map((w) => Array.from(w).find((c) => /[\p{L}\p{N}]/u.test(c)))
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase();
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import './comment-thread.css';

	const t0 = Date.now();
	const me = { name: 'Alex Morgan' };
	const ai = { name: 'Assistant', assistant: true };
	let {
		title = 'Comment',
		messages: initial = [
			{ id: '1', author: { name: 'Sam Lee' }, createdAt: t0 - 2 * 3600e3, text: 'The hero headline feels long on phones – can we tighten it?' },
			{ id: '2', author: me, createdAt: t0 - 90 * 60e3, text: '/edit shorten the headline to six words' },
			{ id: '3', author: ai, createdAt: t0 - 89 * 60e3, text: 'Done – “UI for AI agents” now fits on one line.', status: 'Edited 1 file', details: ['src/routes/+page.svelte', 'Headline: 11 → 4 words'] }
		],
		currentUser = me,
		assistant = ai,
		onreply,
		onclose,
		class: cls
	}: {
		title?: string;
		messages?: ThreadMessage[];
		currentUser?: ThreadAuthor;
		/** The assistant that answers – used for the thinking state */
		assistant?: ThreadAuthor;
		/** Return a message (or a promise of one) to let the assistant answer */
		onreply?: (text: string) => ThreadMessage | Promise<ThreadMessage | void> | void;
		onclose?: () => void;
		class?: string;
	} = $props();

	// svelte-ignore state_referenced_locally
	let messages = $state(initial);
	// svelte-ignore state_referenced_locally
	const firstIds = new Set(initial.filter((m) => m.author.assistant).map((m) => m.id));
	const open = new SvelteSet<string>();
	let draft = $state('');
	let thinking = $state(false);
	let now = $state(Date.now());
	let listEl: HTMLDivElement;
	let morph: HTMLDivElement;
	let failed = $state<Record<string, boolean>>({});

	onMount(() => {
		const t = setInterval(() => (now = Date.now()), 30_000);
		// The conversation glides to its new height
		const sync = () => (morph.style.height = `${listEl.offsetHeight}px`);
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(listEl);
		const frame = requestAnimationFrame(() => morph.setAttribute('data-smooth', ''));
		return () => {
			clearInterval(t);
			ro.disconnect();
			cancelAnimationFrame(frame);
		};
	});
	// Follow the conversation as it grows
	$effect(() => {
		void [messages.length, thinking];
		listEl?.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' });
	});
	const lockHeight = (on: boolean) => listEl && (listEl.style.maxHeight = on ? `${listEl.offsetHeight}px` : '');
	async function send() {
		const text = draft.trim();
		if (!text || thinking) return;
		draft = '';
		now = Date.now();
		lockHeight(true);
		messages.push({ id: `m-${Date.now()}`, author: currentUser, createdAt: Date.now(), text });
		const answer = onreply?.(text);
		if (!answer) return;
		thinking = true;
		try {
			const reply = await answer;
			if (reply) messages.push({ ...reply, createdAt: Date.now() });
		} finally {
			thinking = false;
			now = Date.now();
		}
	}
	function toggle(id: string) {
		lockHeight(false);
		if (open.has(id)) open.delete(id);
		else open.add(id);
	}
</script>

{#snippet avatarOf(author: ThreadAuthor, key: string)}
	{#if author.assistant && !author.avatar}
		<span class="ui-ctc__avatar">
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
				<defs><linearGradient id="{key}-fill" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5b9dff" /><stop offset="0.5" stop-color="#2f6bff" /><stop offset="1" stop-color="#8b5cf6" /></linearGradient></defs>
				<circle cx="12" cy="12" r="12" fill="url(#{key}-fill)" />
			</svg>
		</span>
	{:else if author.avatar && !failed[key]}
		<img class="ui-ctc__avatar" src={author.avatar} alt="" width="20" height="20" loading="lazy" onerror={() => (failed[key] = true)} />
	{:else}
		<span class="ui-ctc__avatar ui-ctc__avatar--initials" aria-hidden="true">{initials(author.name)}</span>
	{/if}
{/snippet}
{#snippet glyph(d: string)}<svg viewBox="0 0 16 16" class="ui-ctc__glyph" aria-hidden="true"><path {d} /></svg>{/snippet}

<section class={['ui-ctc', cls]} aria-label={title}>
	<header class="ui-ctc__head">
		<h3 class="ui-ctc__title" {title} dir="auto">{title}</h3>
		<span class="ui-ctc__count">{fmt.format(messages.length)} {messages.length === 1 ? 'message' : 'messages'}</span>
		{#if onclose}<button type="button" class="ui-ctc__icon-btn" aria-label="Close comment" onclick={onclose}>{@render glyph('m4.5 4.5 7 7M11.5 4.5l-7 7')}</button>{/if}
	</header>
	<div class="ui-ctc__morph" bind:this={morph}>
		<div class="ui-ctc__scroll" bind:this={listEl} aria-live="polite">
			{#each messages as m (m.id)}
				{@const isOpen = open.has(m.id)}
				{@const command = /^\/edit\b/i.test(m.text.trim())}
				<article class="ui-ctc__msg" data-delayed={firstIds.has(m.id) || undefined}>
					<div class="ui-ctc__meta">
						{@render avatarOf(m.author, m.id)}
						<span class="ui-ctc__name" title={m.author.name} dir="auto">{m.author.name}</span>
						<time class="ui-ctc__time" datetime={new Date(m.createdAt).toISOString()}>{ago(+m.createdAt, now)}</time>
					</div>
					{#if m.text}
						<p class="ui-ctc__text" dir="auto">
							{#if command}<span class="ui-ctc__command">/edit</span> {m.text.trim().replace(/^\/edit\s*/i, '')}{:else}{m.text}{/if}
						</p>
					{/if}
					{#if m.status}
						<div class="ui-ctc__status">
							<button type="button" class="ui-ctc__status-btn" aria-expanded={isOpen} disabled={!m.details?.length} onclick={() => toggle(m.id)}>
								<svg viewBox="0 0 16 16" class="ui-ctc__check" aria-hidden="true"
									><path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm8.9-1.2a.5.5 0 0 0-.8-.6L7.44 9.23 6.35 8.15a.5.5 0 1 0-.7.7l1.5 1.5a.5.5 0 0 0 .76-.06l2.5-3.5Z" /></svg
								>
								<span class="ui-ctc__status-text" title={m.status} dir="auto">{m.status}</span>
								{#if m.details?.length}<span class="ui-ctc__chevron">{@render glyph('m5 6.5 3 3 3-3')}</span>{/if}
							</button>
							{#if m.details?.length}
								<div class="ui-ctc__details" data-open={isOpen || undefined} inert={!isOpen}>
									<ul>{#each m.details as d, i (i)}<li dir="auto" style:--i={i}>{d}</li>{/each}</ul>
								</div>
							{/if}
						</div>
					{/if}
				</article>
			{/each}
			{#if thinking && assistant}
				<article class="ui-ctc__msg" aria-label="{assistant.name} is thinking">
					<div class="ui-ctc__meta">{@render avatarOf(assistant, 'thinking')}<span class="ui-ctc__name">{assistant.name}</span></div>
					<p class="ui-ctc__text"><span class="ui-ctc__thinking" data-text="Thinking…">Thinking…</span></p>
				</article>
			{/if}
		</div>
	</div>
	<form
		class="ui-ctc__composer"
		onsubmit={(e) => {
			e.preventDefault();
			send();
		}}
	>
		<input class="ui-ctc__input" bind:value={draft} placeholder={assistant ? `Reply, or ask @${assistant.name}…` : 'Add comment…'} aria-label="Reply" />
		<button type="submit" class="ui-ctc__send" aria-label="Send reply" disabled={!draft.trim() || thinking}>
			<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12.5v-9M4.25 7.25 8 3.5l3.75 3.75" /></svg>
		</button>
	</form>
</section>
