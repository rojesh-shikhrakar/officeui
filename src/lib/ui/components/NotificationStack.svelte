<!-- Notification Stack – ported from affectUI (MIT). Notice cards stacked behind each other; dismiss brings the next forward. -->
<script lang="ts" module>
	export type NoticePattern = 'orbit' | 'grid' | 'rays';
	export type Notice = {
		id: string;
		/** Small label in the pill, e.g. "Notice" */
		badge?: string;
		title: string;
		text: string;
		action?: { label: string; href?: string; onClick?: () => void; external?: boolean };
		/** Line art in the top-right corner */
		pattern?: NoticePattern;
	};
	const PEEK = 12;
</script>

<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { tick } from 'svelte';
	import './notification-stack.css';

	let {
		notices = [
			{ id: 'n1', badge: 'New', title: 'Agent Graph is here', text: 'See which agents call which tools, live, as a network.', action: { label: 'Take a look', href: '#', external: true }, pattern: 'orbit' },
			{ id: 'n2', badge: 'Notice', title: 'Scheduled maintenance', text: 'Runs pause for ten minutes on Sunday at 02:00 UTC.', pattern: 'grid' },
			{ id: 'n3', badge: 'Tip', title: 'Approve from your phone', text: 'Turn on push notifications in settings.', pattern: 'rays' }
		],
		ondismiss,
		class: cls
	}: { notices?: Notice[]; ondismiss?: (n: Notice) => void; class?: string } = $props();

	const removed = new Set<string>();
	// svelte-ignore state_referenced_locally
	let items = $state(notices);
	$effect.pre(() => {
		items = notices.filter((n) => !removed.has(n.id));
	});
	const leaving = new SvelteSet<string>();
	let heights = $state<Record<string, number>>({});
	const els = new Map<string, HTMLElement>();
	const visible = $derived(items.filter((n) => !leaving.has(n.id)));
	const behind = $derived(Math.min(visible.length - 1, 2));
	const front = $derived(visible[0] ? (heights[visible[0].id] ?? 0) : 0);

	function track(node: HTMLElement, id: string) {
		els.set(id, node);
		return { destroy: () => els.delete(id) };
	}
	// The front card's height sets the height of the stack
	$effect(() => {
		void items;
		const measure = () => {
			const next: Record<string, number> = {};
			els.forEach((el, id) => (next[id] = el.scrollHeight + el.offsetHeight - el.clientHeight));
			heights = next;
		};
		let ro: ResizeObserver | undefined;
		tick().then(() => {
			measure();
			ro = new ResizeObserver(measure);
			els.forEach((el) => ro!.observe(el));
		});
		return () => ro?.disconnect();
	});

	function dismiss(n: Notice) {
		leaving.add(n.id);
		ondismiss?.(n);
		setTimeout(() => {
			removed.add(n.id);
			items = items.filter((x) => x.id !== n.id);
			leaving.delete(n.id);
		}, 320);
	}
</script>

<section class={['ui-nsc', cls]} aria-label="Notifications" style:height="{visible.length ? front + behind * PEEK : 0}px">
	{#each items as notice (notice.id)}
		{@const i = visible.findIndex((n) => n.id === notice.id)}
		{@const gone = i === -1}
		{@const depth = Math.max(0, i)}
		{#if gone || depth <= 3}
			{@const isBehind = !gone && depth > 0}
			{@const y = gone || depth === 0 ? 0 : front - Math.min(heights[notice.id] ?? front, front) + Math.min(depth, 2) * PEEK}
			{@const scale = gone ? 1 : 1 - Math.min(depth, 2) * 0.05}
			<article
				use:track={notice.id}
				class="ui-nsc__card"
				data-depth={gone ? undefined : depth}
				data-leaving={gone || undefined}
				aria-labelledby="{notice.id}-title"
				aria-hidden={isBehind || undefined}
				inert={isBehind || gone}
				style:z-index={gone ? 10 : 10 - depth}
				style:transform={gone ? undefined : `translateY(${y}px) scale(${scale})`}
				style:opacity={depth > 2 ? 0 : undefined}
				style:max-height={isBehind && front ? `${front}px` : undefined}
			>
				<svg class="ui-nsc__pattern" viewBox="0 0 220 160" fill="none" aria-hidden="true">
					{#if (notice.pattern ?? 'orbit') === 'orbit'}
						<circle cx="190" cy="10" r="46" /><circle cx="190" cy="10" r="86" /><circle cx="190" cy="10" r="128" />
						<path d="M60 160 220 0M0 58h220M150 0v160" /><circle cx="150" cy="58" r="3.5" class="ui-nsc__dot" />
					{:else if notice.pattern === 'grid'}
						{#each [30, 60, 90, 120, 150, 180, 210] as x (x)}<path d="M{x} 0v160" />{/each}
						{#each [20, 50, 80, 110, 140] as y (y)}<path d="M0 {y}h220" />{/each}
						<rect x="150" y="50" width="30" height="30" class="ui-nsc__fill" /><circle cx="180" cy="50" r="3.5" class="ui-nsc__dot" />
					{:else}
						{#each [0, 1, 2, 3, 4, 5, 6, 7] as r (r)}<path d="M210 6 L{210 - Math.cos((r * Math.PI) / 16) * 230} {6 + Math.sin((r * Math.PI) / 16) * 230}" />{/each}
						<path d="M120 6a90 90 0 0 0 90 90" /><circle cx="146" cy="70" r="3.5" class="ui-nsc__dot" />
					{/if}
				</svg>
				<div class="ui-nsc__body">
					<div class="ui-nsc__top">
						{#if notice.badge}<span class="ui-nsc__badge" dir="auto" title={notice.badge}>{notice.badge}</span>{:else}<span></span>{/if}
						<button
							type="button"
							class="ui-nsc__close"
							aria-label="Dismiss {notice.title}"
							onclick={(e) => {
								e.stopPropagation();
								dismiss(notice);
							}}
						>
							<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
						</button>
					</div>
					<h3 id="{notice.id}-title" class="ui-nsc__title" dir="auto">{notice.title}</h3>
					<p class="ui-nsc__text" dir="auto">{notice.text}</p>
					{#if notice.action}
						{#if notice.action.href}
							<a class="ui-nsc__btn" dir="auto" href={notice.action.href} onclick={notice.action.onClick} target={notice.action.external ? '_blank' : undefined} rel={notice.action.external ? 'noreferrer' : undefined}>
								{notice.action.label}
								{#if notice.action.external}<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>{/if}
							</a>
						{:else}
							<button type="button" class="ui-nsc__btn" dir="auto" onclick={notice.action.onClick}>{notice.action.label}</button>
						{/if}
					{/if}
				</div>
			</article>
		{/if}
	{/each}
</section>
