<!-- Cover Flow – ported from affectUI (MIT). Browse covers in 3D: spring motion, drag and flick, wheel scrub, keyboard, reflection, caption and ticks. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type CoverFlowItem = {
		id: string | number;
		title?: string;
		subtitle?: string;
		/** Image URL */
		image?: string;
		alt?: string;
		/** CSS background used when there is no image (placeholder art) */
		art?: string;
	};
	const VISIBLE = 7;
	const DRAG_PX = 110;
	const HUES = [12, 200, 280, 150, 40, 330, 230, 100, 0];
	export const sampleCovers: CoverFlowItem[] = ['Night Drive', 'Glass Garden', 'Low Tide', 'Paper Moons', 'Static Bloom', 'Northern Lines', 'Soft Machines', 'Field Notes', 'Afterglow'].map((title, i) => ({
		id: i,
		title,
		subtitle: ['Mira Kova', 'The Lanterns', 'Oslo Drift', 'Hana & Co', 'Velvet Room'][i % 5],
		art: `radial-gradient(120% 90% at 20% 15%, hsl(${HUES[i]} 85% 72%), transparent 60%), radial-gradient(90% 90% at 85% 90%, hsl(${(HUES[i] + 60) % 360} 70% 45%), transparent 70%), hsl(${(HUES[i] + 30) % 360} 45% 22%)`
	}));
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './cover-flow.css';

	let {
		items = sampleCovers,
		index = $bindable(),
		onselect,
		itemWidth = 280,
		itemHeight = 280,
		angle = 50,
		reflection = true,
		caption = true,
		captionContent,
		controls = true,
		ticks = true,
		sound = false,
		'aria-label': ariaLabel = 'Cover flow',
		class: cls
	}: {
		items?: CoverFlowItem[];
		/** Front cover (defaults to the middle one) */
		index?: number;
		/** Clicking (or Enter on) the cover in front */
		onselect?: (item: CoverFlowItem, index: number) => void;
		itemWidth?: number;
		itemHeight?: number;
		/** How far the side covers turn away, in degrees */
		angle?: number;
		reflection?: boolean;
		caption?: boolean;
		/** Replaces the default caption */
		captionContent?: Snippet<[CoverFlowItem, number]>;
		controls?: boolean;
		ticks?: boolean;
		/** A soft click each time a new cover reaches the front */
		sound?: boolean;
		'aria-label'?: string;
		class?: string;
	} = $props();

	const count = $derived(items.length);
	const last = $derived(Math.max(count - 1, 0));
	const clampI = (v: number) => Math.min(Math.max(v, 0), last);
	// svelte-ignore state_referenced_locally
	const start = clampI(index ?? Math.floor(last / 2));
	let active = $state(start);
	let dir = $state(1);
	let scale = $state(1);
	let root: HTMLDivElement;
	const cards: HTMLDivElement[] = [];
	const m = { pos: start, target: start, vel: 0, raf: 0, last: 0, active: start };
	let reduced = false;
	let audio: AudioContext | null = null;

	function tickSound() {
		const ctx = audio;
		if (!ctx || ctx.state !== 'running') return;
		const t = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.setValueAtTime(2200, t);
		osc.frequency.exponentialRampToValueAtTime(900, t + 0.03);
		gain.gain.setValueAtTime(0.0001, t);
		gain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
		osc.connect(gain).connect(ctx.destination);
		osc.start(t);
		osc.stop(t + 0.05);
	}
	function wakeAudio() {
		if (!sound) return;
		if (!audio && window.AudioContext) audio = new AudioContext();
		if (audio?.state === 'suspended') void audio.resume();
	}
	// Place every cover for the current (fractional) position
	function paint() {
		const { pos } = m;
		const gap = itemWidth * 0.78 * scale;
		const step = itemWidth * 0.27 * scale;
		const depth = itemWidth * 0.7 * scale;
		cards.forEach((el, i) => {
			if (!el) return;
			const d = i - pos;
			const ad = Math.abs(d);
			if (ad > VISIBLE + 1) return void (el.style.visibility = 'hidden');
			const t = Math.min(ad, 1);
			const sgn = Math.sign(d);
			const x = sgn * (t * gap + Math.max(ad - 1, 0) * step);
			el.style.visibility = '';
			const k = 1 - t * 0.08 - Math.min(Math.max(ad - 1, 0), 4) * 0.015;
			el.style.transform = `translate3d(${x}px, 0, ${-t * depth}px) rotateY(${-sgn * t * angle}deg) scale(${k.toFixed(4)})`;
			el.style.zIndex = String(1000 - Math.round(ad * 10));
			el.style.setProperty('--ui-cf-t', t.toFixed(3));
			el.style.setProperty('--ui-cf-d', Math.min(Math.max(d, -1.5), 1.5).toFixed(3));
			el.dataset.side = d < 0 ? 'left' : 'right';
		});
		const now = Math.round(Math.min(Math.max(pos, 0), count - 1));
		if (now !== m.active) {
			dir = now > m.active ? 1 : -1;
			m.active = now;
			active = now;
			index = now;
			tickSound();
		}
	}
	// Spring toward the target; stops itself once settled
	function run() {
		if (m.raf) return;
		m.last = performance.now();
		const frame = (now: number) => {
			const dt = Math.min(now - m.last, 32) / 1000;
			m.last = now;
			const k = 190;
			const c = 2 * Math.sqrt(k) * 0.92;
			m.vel += (k * (m.target - m.pos) - c * m.vel) * dt;
			m.pos += m.vel * dt;
			if (Math.abs(m.target - m.pos) < 0.0006 && Math.abs(m.vel) < 0.002) {
				m.pos = m.target;
				m.vel = 0;
				m.raf = 0;
				paint();
				return;
			}
			paint();
			m.raf = requestAnimationFrame(frame);
		};
		m.raf = requestAnimationFrame(frame);
	}
	function goTo(i: number) {
		m.target = Math.min(Math.max(Math.round(i), 0), count - 1);
		if (reduced) {
			m.pos = m.target;
			m.vel = 0;
			paint();
		} else run();
	}
	// Outside changes of the front cover
	$effect(() => {
		if (index !== undefined && index !== Math.round(m.target)) goTo(index);
	});
	$effect(() => {
		void [scale, angle, itemWidth, items];
		if (m.target > last) goTo(last);
		else paint();
	});

	let snapTimer: ReturnType<typeof setTimeout>;
	onMount(() => {
		const q = matchMedia('(prefers-reduced-motion: reduce)');
		reduced = q.matches;
		const on = () => (reduced = q.matches);
		q.addEventListener('change', on);
		const fit = () => (scale = Math.min(1, Math.max(0.5, root.clientWidth / (itemWidth * 3.2))));
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(root);
		// Trackpad / horizontal wheel scrubs; vertical scrolling stays with the page
		const onWheel = (e: WheelEvent) => {
			const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
			if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return;
			e.preventDefault();
			wakeAudio();
			const unit = DRAG_PX * scale * 1.4;
			m.target = Math.min(Math.max(m.target + dx / unit, -0.35), count - 1 + 0.35);
			run();
			clearTimeout(snapTimer);
			snapTimer = setTimeout(() => goTo(m.target + Math.sign(dx) * 0.3), 110);
		};
		root.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			q.removeEventListener('change', on);
			ro.disconnect();
			root.removeEventListener('wheel', onWheel);
			clearTimeout(snapTimer);
			cancelAnimationFrame(m.raf);
			void audio?.close();
		};
	});

	// Drag and flick: the row follows the finger 1:1, a flick carries on, then it settles on a cover
	let drag: { id: number; x: number; from: number; moved: boolean; hit: number | null; samples: { x: number; t: number }[] } | null = null;
	function pointerdown(e: PointerEvent) {
		if (e.button !== 0) return;
		wakeAudio();
		const hit = (e.target as HTMLElement).closest<HTMLElement>('[data-cf-index]');
		drag = { id: e.pointerId, x: e.clientX, from: m.pos, moved: false, hit: hit ? Number(hit.dataset.cfIndex) : null, samples: [{ x: e.clientX, t: performance.now() }] };
	}
	function pointermove(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		const d = drag;
		if (!d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.x;
		if (!d.moved) {
			if (Math.abs(dx) < 6) return;
			d.moved = true;
			e.currentTarget.setPointerCapture(e.pointerId);
			e.currentTarget.dataset.dragging = '';
		}
		cancelAnimationFrame(m.raf);
		m.raf = 0;
		let p = d.from - dx / (DRAG_PX * scale);
		const max = count - 1;
		if (p < 0) p = p * 0.3;
		if (p > max) p = max + (p - max) * 0.3;
		m.pos = m.target = p;
		m.vel = 0;
		d.samples.push({ x: e.clientX, t: performance.now() });
		if (d.samples.length > 6) d.samples.shift();
		paint();
	}
	function pointerup(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		const d = drag;
		if (!d || d.id !== e.pointerId) return;
		drag = null;
		delete e.currentTarget.dataset.dragging;
		if (!d.moved) {
			if (d.hit === null) return;
			if (d.hit === Math.round(m.target)) onselect?.(items[d.hit], d.hit);
			else goTo(d.hit);
			return;
		}
		const first = d.samples[0];
		const lastS = d.samples[d.samples.length - 1];
		const dt = Math.max(lastS.t - first.t, 1);
		const v = (-((lastS.x - first.x) / dt) * 1000) / (DRAG_PX * scale);
		m.vel = reduced ? 0 : v;
		let to = Math.round(m.pos + v * 0.18);
		if (Math.abs(v) > 0.8 && to === Math.round(d.from)) to += Math.sign(v);
		goTo(to);
	}
	function keydown(e: KeyboardEvent) {
		const cur = Math.round(m.target);
		const keys: Record<string, number> = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: last };
		if (e.key in keys) {
			e.preventDefault();
			wakeAudio();
			goTo(keys[e.key]);
		} else if ((e.key === 'Enter' || e.key === ' ') && onselect && e.target === e.currentTarget) {
			e.preventDefault();
			onselect(items[cur], cur);
		}
	}
	const current = $derived(items[active]);
</script>

{#snippet face(item: CoverFlowItem, decorative: boolean)}
	<div class="ui-cf__media" style:background={item.image ? undefined : item.art}>
		{#if item.image}<img src={item.image} alt={decorative ? '' : (item.alt ?? item.title ?? '')} draggable="false" loading="lazy" decoding="async" onerror={(e) => (e.currentTarget.style.visibility = 'hidden')} />{/if}
	</div>
{/snippet}

<div class={['ui-cf', cls]} style:--ui-cf-w="{Math.round(itemWidth * scale)}px" style:--ui-cf-h="{Math.round(itemHeight * scale)}px" data-reflection={reflection || undefined}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (a carousel region: arrows, Home/End and Enter drive it) -->
	<div
		bind:this={root}
		class="ui-cf__viewport"
		role="region"
		aria-roledescription="carousel"
		aria-label={ariaLabel}
		tabindex="0"
		onkeydown={keydown}
		onpointerdown={pointerdown}
		onpointermove={pointermove}
		onpointerup={pointerup}
		onpointercancel={pointerup}
		data-selectable={onselect ? '' : undefined}
	>
		<div class="ui-cf__stage" style:perspective="{Math.round(1000 * scale)}px">
			{#each items as item, i (item.id)}
				<div
					bind:this={cards[i]}
					class="ui-cf__item"
					data-cf-index={i}
					data-active={i === active || undefined}
					role="group"
					aria-roledescription="slide"
					aria-label="{i + 1} of {count}{item.title ? `: ${item.title}` : ''}"
					aria-hidden={i !== active || undefined}
				>
					<div class="ui-cf__ground" aria-hidden="true"></div>
					<div class="ui-cf__card">{@render face(item, false)}</div>
					{#if reflection}<div class="ui-cf__reflection" aria-hidden="true" inert><div class="ui-cf__card">{@render face(item, true)}</div></div>{/if}
				</div>
			{/each}
		</div>
	</div>
	{#if caption || controls || ticks}
		<div class="ui-cf__footer">
			<div class="ui-cf__row">
				{#if controls}
					<button type="button" class="ui-cf__nav" aria-label="Previous" disabled={active === 0} onclick={() => goTo(Math.round(m.target) - 1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg></button>
				{/if}
				{#if caption}
					<div class="ui-cf__caption" aria-live="polite">
						{#key current?.id}
							<div class="ui-cf__caption-in" data-dir={dir > 0 ? 'next' : 'prev'}>
								{#if current}
									{#if captionContent}{@render captionContent(current, active)}{:else}
										{#if current.title}<div class="ui-cf__title">{current.title}</div>{/if}
										{#if current.subtitle}<div class="ui-cf__subtitle">{current.subtitle}</div>{/if}
									{/if}
								{/if}
							</div>
						{/key}
					</div>
				{/if}
				{#if controls}
					<button type="button" class="ui-cf__nav" aria-label="Next" disabled={active === last} onclick={() => goTo(Math.round(m.target) + 1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg></button>
				{/if}
			</div>
			{#if ticks && count > 15}<div class="ui-cf__counter" aria-hidden="true">{active + 1} / {count}</div>{/if}
			{#if ticks && count > 1 && count <= 15}
				<div class="ui-cf__ticks">
					{#each items as item, i (item.id)}<button type="button" tabindex="-1" class="ui-cf__tick" aria-label="Show {item.title ?? `cover ${i + 1}`}" aria-current={i === active || undefined} onclick={() => goTo(i)}></button>{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
