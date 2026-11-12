<!-- Testimonial Wall – ported from affectUI (MIT). Columns of quotes drifting up and down, pause on hover, drag, keyboard focus. -->
<script lang="ts" module>
	export type Testimonial = { quote: string; name: string; role?: string; company?: string; avatar?: string; rating?: number; verified?: boolean };
	type ColState = { y: number; v: number; h: number; drag: null | { id: number; lastY: number; lastT: number; moved: number; captured: boolean }; seek: number };
	const PACE = [1, -0.84, 1.12];
	const START = [0, 0.42, 0.18];
	const mod = (n: number, m: number) => (m > 0 ? ((n % m) + m) % m : 0);
	const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
	const SUFFIX = /^(jr|sr|i{1,3}|iv|v|vi|phd|md|esq)\.?,?$/i;
	const firstChar = (w: string) => Array.from(w)[0] ?? '';
	const initials = (name: string) => {
		const words = name.split(/\s+/).filter(Boolean);
		const named = words.filter((w) => /^\p{L}/u.test(w));
		const list = named.length ? named : words;
		const core = list.length > 1 ? list.filter((w, i) => i === 0 || !SUFFIX.test(w)) : list;
		const picked = core.length > 1 ? [core[0], core[core.length - 1]] : core;
		return picked.map((p) => firstChar(p).toUpperCase()).join('') || '?';
	};
	const fit = (width: number, max: number) => Math.min(max, width >= 740 ? 3 : width >= 480 ? 2 : 1);
	/** Shows the full text as a tooltip on hover, but only when it is cut off */
	function showFull(el: HTMLElement) {
		const on = () => (el.title = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 ? (el.textContent ?? '') : '');
		el.addEventListener('pointerenter', on);
		return { destroy: () => el.removeEventListener('pointerenter', on) };
	}
	/** Sample quotes from fictional people */
	export const sampleQuotes: Testimonial[] = [
		{ quote: 'Every component feels like someone obsessed over the states nobody else designs.', name: 'Ana Ruiz', role: 'Design engineer', company: 'Northwind', rating: 5, verified: true },
		{ quote: 'We shipped our agent dashboard in two days.', name: 'Ben Okafor', role: 'Founder', company: 'Lumen' },
		{ quote: 'The tool call card alone saved us a week. It handles running, failed and retried calls the way users expect, and dark mode just works.', name: 'Chen Wei', role: 'Staff engineer', company: 'Halcyon', rating: 5 },
		{ quote: 'One file, no setup. I read it, changed two colours and moved on.', name: 'Dana Fischer', role: 'Frontend lead', company: 'Quartz', verified: true },
		{ quote: 'Motion that respects reduced-motion settings out of the box. Rare.', name: 'Eli Novak', role: 'Accessibility lead', company: 'Vertex' },
		{ quote: 'Our approvals flow finally feels calm instead of alarming.', name: 'Farah Haddad', role: 'Product designer', company: 'Polaris', rating: 4 },
		{ quote: 'The Svelte versions slot right into our design system tokens.', name: 'Gus Tanaka', role: 'Engineer', company: 'Kestrel' },
		{ quote: 'I stopped building loaders. The thinking pill is perfect as it is.', name: 'Hana Kim', role: 'Indie hacker', verified: true },
		{ quote: 'Clean, quiet, and every detail is considered.', name: 'Ivo Marques', role: 'Design director', company: 'Mosaic', rating: 5 }
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './testimonial-wall.css';

	let {
		items = sampleQuotes,
		columns = 3,
		speed = 28,
		pauseOnHover = true,
		label = 'What customers say',
		class: cls
	}: {
		items?: Testimonial[];
		/** Most columns on a wide container (2 below 740px, 1 below 480px) */
		columns?: 1 | 2 | 3;
		/** Pixels per second of the first column */
		speed?: number;
		pauseOnHover?: boolean;
		label?: string;
		/** Set the height with --ui-twc-height (600px by default) */
		class?: string;
	} = $props();

	let root: HTMLDivElement;
	const cols: HTMLDivElement[] = [];
	const tracks: HTMLDivElement[] = [];
	const sets: HTMLUListElement[] = [];
	const motion: ColState[] = [];
	const hover: boolean[] = [];
	const hold: boolean[] = [];
	const focus: boolean[] = [];
	// svelte-ignore state_referenced_locally
	let fitCount = $state<number>(columns);
	const count = $derived(Math.max(1, Math.min(fitCount, items.length)));
	let copies = $state<number[]>([]);
	let reduced = $state(false);
	let failed = $state<Record<string, boolean>>({});
	// Deal the quotes into columns: 1, 2, 3, 1, 2, 3 …
	const dealt = $derived(Array.from({ length: count }, (_, c) => items.filter((_, i) => i % count === c)));

	onMount(() => {
		const mq = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});
	// Column count follows the wall's own width
	$effect(() => {
		const max = columns;
		const measure = () => (fitCount = fit(root.clientWidth, max));
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(root);
		return () => ro.disconnect();
	});
	// Measure every column: one set's height and how many copies cover it plus one wrap
	$effect(() => {
		void [count, items];
		if (reduced) return;
		const measure = () => {
			const next = dealt.map((_, i) => {
				const set = sets[i];
				const col = cols[i];
				if (!set || !col) return 2;
				const scale = col.getBoundingClientRect().height / (col.offsetHeight || 1) || 1;
				const h = set.getBoundingClientRect().height / scale;
				const s = (motion[i] ??= { y: h * (START[i] ?? 0), v: 0, h, drag: null, seek: 0 });
				if (s.h > 0 && h > 0 && s.h !== h) s.y = (s.y / s.h) * h;
				s.h = h;
				return h > 0 ? Math.min(12, Math.ceil(col.clientHeight / h) + 1) : 2;
			});
			motion.length = dealt.length;
			if (!(copies.length === next.length && copies.every((c, i) => c === next[i]))) copies = next;
		};
		measure();
		const ro = new ResizeObserver(measure);
		for (const el of [...sets.slice(0, count), ...cols.slice(0, count)]) if (el) ro.observe(el);
		return () => ro.disconnect();
	});
	// The loop: one velocity per column that eases toward its target
	$effect(() => {
		if (reduced || !root) return;
		let raf = 0;
		let last = 0;
		let visible = false;
		const frame = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			for (let i = 0; i < count; i++) {
				const s = motion[i];
				const track = tracks[i];
				if (!s || !track || s.h <= 0) continue;
				const pace = count === 1 ? 1 : PACE[i % 3];
				const stopped = hold[i] || focus[i] || (pauseOnHover && hover[i]);
				if (!s.drag) {
					const target = stopped ? 0 : speed * pace;
					const fling = Math.abs(s.v - target) > Math.max(120, speed * 2);
					const tau = fling ? 0.55 : stopped ? 0.32 : 0.7;
					s.v += (target - s.v) * (1 - Math.exp(-dt / tau));
					s.y += s.v * dt;
					if (s.seek) {
						const step = s.seek * (1 - Math.exp(-dt / 0.12));
						s.y += step;
						s.seek = Math.abs(s.seek - step) < 0.5 ? 0 : s.seek - step;
					}
				}
				s.y = focus[i] ? clamp(s.y, -s.h, s.h * 2) : mod(s.y, s.h);
				track.style.transform = `translate3d(0, ${-(s.h + s.y)}px, 0)`;
			}
			raf = visible ? requestAnimationFrame(frame) : 0;
		};
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible && !raf) {
				last = 0;
				raf = requestAnimationFrame(frame);
			}
		});
		io.observe(root);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	function down(i: number, e: PointerEvent) {
		const s = motion[i];
		if (!s) return;
		if (e.pointerType === 'touch') return void (hold[i] = true);
		if (e.button !== 0) return;
		s.drag = { id: e.pointerId, lastY: e.clientY, lastT: e.timeStamp, moved: 0, captured: false };
		s.v = 0;
	}
	function move(i: number, e: PointerEvent & { currentTarget: HTMLDivElement }) {
		const s = motion[i];
		const d = s?.drag;
		if (!s || !d || d.id !== e.pointerId) return;
		const col = e.currentTarget;
		const scale = col.getBoundingClientRect().height / (col.offsetHeight || 1) || 1;
		const dy = (e.clientY - d.lastY) / scale;
		const dt = Math.max(1, e.timeStamp - d.lastT) / 1000;
		d.moved += Math.abs(dy);
		if (!d.captured && d.moved > 4) {
			d.captured = true;
			col.setPointerCapture(e.pointerId);
			col.setAttribute('data-dragging', '');
		}
		s.y -= dy;
		s.v = s.v * 0.6 + (-dy / dt) * 0.4;
		d.lastY = e.clientY;
		d.lastT = e.timeStamp;
	}
	function up(i: number, e: PointerEvent & { currentTarget: HTMLDivElement }) {
		hold[i] = false;
		const s = motion[i];
		const d = s?.drag;
		if (!s || !d || d.id !== e.pointerId) return;
		if (e.timeStamp - d.lastT > 80) s.v = 0;
		s.v = clamp(s.v, -2400, 2400);
		s.drag = null;
		e.currentTarget.removeAttribute('data-dragging');
		if (d.captured) {
			const col = e.currentTarget;
			const stop = (ev: MouseEvent) => (ev.preventDefault(), ev.stopPropagation());
			col.addEventListener('click', stop, { capture: true, once: true });
			setTimeout(() => col.removeEventListener('click', stop, { capture: true }), 0);
		}
	}
	// A focused card stops its column and is nudged into view
	function focusCard(i: number, e: FocusEvent & { currentTarget: HTMLElement }) {
		const s = motion[i];
		const col = cols[i];
		if (reduced || !s || !col || s.h <= 0 || !e.currentTarget.matches(':focus-visible')) return;
		const li = e.currentTarget.parentElement as HTMLElement;
		const top = li.offsetTop;
		const h = e.currentTarget.offsetHeight;
		const viewH = col.clientHeight;
		const pad = Math.min(56, viewH * 0.12);
		s.y = [s.y - s.h, s.y, s.y + s.h].reduce((best, y) => (Math.abs(top - y - viewH / 2) < Math.abs(top - best - viewH / 2) ? y : best));
		const at = top - s.y;
		if (h > viewH - pad * 2 || at < pad) s.seek = at - pad;
		else if (at + h > viewH - pad) s.seek = at + h - (viewH - pad);
		else s.seek = 0;
	}
</script>

{#snippet card(t: Testimonial, i: number, interactive: boolean, key: string)}
	{@const meta = [t.role?.trim(), t.company?.trim()].filter(Boolean).join(' · ')}
	{@const stars = t.rating ? clamp(Math.round(t.rating), 1, 5) : 0}
	<li class="ui-twc__item">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<figure class="ui-twc__card" tabindex={interactive ? 0 : undefined} onfocus={interactive ? (e) => focusCard(i, e) : undefined}>
			{#if stars}
				<div class="ui-twc__stars" role="img" aria-label="Rated {stars} out of 5">
					{#each { length: 5 } as _, n (n)}<svg viewBox="0 0 16 16" aria-hidden="true" data-on={n < stars || undefined}><path d="M8 1.6l1.9 3.95 4.35.6-3.17 3.03.78 4.32L8 11.43 4.14 13.5l.78-4.32L1.75 6.15l4.35-.6L8 1.6z" /></svg>{/each}
				</div>
			{/if}
			{#if t.quote.trim()}<blockquote class="ui-twc__quote"><p dir="auto" use:showFull>{t.quote.trim()}</p></blockquote>{/if}
			<figcaption class="ui-twc__who">
				{#if t.avatar && !failed[t.avatar]}
					<img class="ui-twc__avatar" src={t.avatar} alt="" width="32" height="32" loading="lazy" decoding="async" draggable="false" onerror={() => (failed[t.avatar!] = true)} />
				{:else}
					<span class="ui-twc__avatar ui-twc__avatar--initials" aria-hidden="true">{initials(t.name)}</span>
				{/if}
				<span class="ui-twc__id">
					<span class="ui-twc__name">
						<span class="ui-twc__name-text" dir="auto" use:showFull>{t.name.trim()}</span>
						{#if t.verified}
							<svg class="ui-twc__verified" viewBox="0 0 16 16" role="img" aria-label="Verified customer"
								><circle cx="8" cy="8" r="7" /><path d="M5.2 8.1l1.9 1.9 3.7-3.8" fill="none" stroke="var(--ui-twc-card)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg
							>
						{/if}
					</span>
					{#if meta}<span class="ui-twc__meta" dir="auto" use:showFull>{meta}</span>{/if}
				</span>
			</figcaption>
		</figure>
	</li>
{/snippet}

<div bind:this={root} class={['ui-twc', cls]} role="region" aria-label={label} data-cols={count} data-static={reduced || undefined} style:--ui-twc-cols={count} data-empty={items.length === 0 || undefined}>
	{#if items.length === 0}<p class="ui-twc__empty">No quotes yet</p>{/if}
	{#if items.length > 0}
		{#each dealt as list, i (i)}
			{#if reduced}
				<div class="ui-twc__col"><ul class="ui-twc__set">{#each list as t, n (n)}{@render card(t, i, true, String(n))}{/each}</ul></div>
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions (pointer drag and hover pause on a decorative column; cards stay keyboard-focusable) -->
				<div
					bind:this={cols[i]}
					class="ui-twc__col"
					role="presentation"
					onpointerenter={(e) => e.pointerType !== 'touch' && (hover[i] = true)}
					onpointerleave={() => (hover[i] = false)}
					onpointerdown={(e) => down(i, e)}
					onpointermove={(e) => move(i, e)}
					onpointerup={(e) => up(i, e)}
					onpointercancel={(e) => up(i, e)}
					onfocusin={(e) => (focus[i] = (e.target as Element).matches(':focus-visible'))}
					onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && (focus[i] = false)}
				>
					<div bind:this={tracks[i]} class="ui-twc__track">
						{#each { length: 1 + Math.max(2, copies[i] ?? 2) } as _, c (c)}
							{#if c === 1}
								<ul bind:this={sets[i]} class="ui-twc__set">{#each list as t, n (n)}{@render card(t, i, true, `${c}-${n}`)}{/each}</ul>
							{:else}
								<ul class="ui-twc__set" aria-hidden="true" inert>{#each list as t, n (n)}{@render card(t, i, false, `${c}-${n}`)}{/each}</ul>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>
