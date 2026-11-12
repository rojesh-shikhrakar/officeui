<!-- Logo Marquee – ported from affectUI (MIT). The endless "Trusted by" strip: eases to a stop on hover, drag/fling, two rows, keyboard scrub. -->
<script lang="ts" module>
	export type MarqueeLogo = {
		/** Brand name – accessible name, and the visible label when `labels` is on */
		name: string;
		/** Mark as one SVG path on a 24×24 viewBox, drawn in currentColor */
		svg?: string;
		/** An image instead of `svg` */
		src?: string;
		/** Brand colour the mark lifts to on hover */
		color?: string;
		/** Optical size correction */
		scale?: number;
		/** Turns the logo into a link */
		href?: string;
	};
	type RowState = { x: number; v: number; w: number; drag: null | { id: number; lastX: number; lastT: number; moved: number; captured: boolean }; seek: number };
	const mod = (n: number, m: number) => (m > 0 ? ((n % m) + m) % m : 0);
	const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
	const initial = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '?';
	/** Neutral placeholder brands (simple geometric marks) */
	export const sampleLogos: MarqueeLogo[] = [
		{ name: 'Northwind', color: '#2f6bff', svg: 'M4 18 12 4l8 14H4Z' },
		{ name: 'Lumen', color: '#f59e0b', svg: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
		{ name: 'Halcyon', color: '#0f9d76', svg: 'M4 12a8 8 0 0 1 16 0H4Zm2 2h12a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4Z' },
		{ name: 'Quartz', color: '#7c5cff', svg: 'M12 3 21 12 12 21 3 12Z' },
		{ name: 'Vertex', color: '#e5484d', svg: 'M3 5h18L12 20Z' },
		{ name: 'Polaris', color: '#0ea5e9', svg: 'M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z' },
		{ name: 'Kestrel', color: '#db2777', svg: 'M6 4h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 9h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z' },
		{ name: 'Mosaic', color: '#16a34a', svg: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z' }
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './logo-marquee.css';

	let {
		logos = sampleLogos,
		speed = 40,
		direction = 'left',
		rows = 1,
		gap = 56,
		pauseOnHover = true,
		grayscale = true,
		labels = 'beside',
		label = 'Logos of companies using the product',
		class: cls
	}: {
		logos?: MarqueeLogo[];
		/** Pixels per second */
		speed?: number;
		/** Which way the first row runs; a second row runs the other way */
		direction?: 'left' | 'right';
		rows?: 1 | 2;
		/** Space between logos in px */
		gap?: number;
		/** Ease to a stop while hovered or focused */
		pauseOnHover?: boolean;
		/** Muted logos that lift to colour on hover */
		grayscale?: boolean;
		/** Brand name under each mark or beside it */
		labels?: 'none' | 'below' | 'beside';
		label?: string;
		class?: string;
	} = $props();

	let root = $state<HTMLDivElement>();
	const tracks: HTMLDivElement[] = [];
	const sets: HTMLUListElement[] = [];
	const views: HTMLDivElement[] = [];
	const motion: RowState[] = [];
	let hover = false;
	let focus = false;
	let copies = $state<number[]>([]);
	let reduced = $state(false);
	let failed = $state<Record<string, boolean>>({});

	// Two rows split the logos alternately
	const split = $derived(
		rows === 2 && logos.length > 1
			? [
					{ logos: logos.filter((_, i) => i % 2 === 0), dir: direction === 'left' ? 1 : -1 },
					{ logos: logos.filter((_, i) => i % 2 === 1), dir: direction === 'left' ? -1 : 1 }
				]
			: [{ logos, dir: direction === 'left' ? 1 : -1 }]
	);
	const hasLinks = $derived(logos.some((l) => l.href));

	onMount(() => {
		const mq = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});
	// Measure every row: one set's width and how many copies cover the viewport plus one wrap
	$effect(() => {
		void [split.length, logos, gap, labels];
		if (reduced) return;
		const measure = () => {
			const next = split.map((_, i) => {
				const set = sets[i];
				const view = views[i];
				if (!set || !view) return 2;
				const w = set.getBoundingClientRect().width;
				const s = (motion[i] ??= { x: i * w * 0.5, v: 0, w, drag: null, seek: 0 });
				if (s.w > 0 && w > 0 && s.w !== w) s.x = (s.x / s.w) * w;
				s.w = w;
				return w > 0 ? Math.ceil(view.clientWidth / w) + 1 : 2;
			});
			if (!(copies.length === next.length && copies.every((c, i) => c === next[i]))) copies = next;
		};
		measure();
		const ro = new ResizeObserver(measure);
		for (const el of [...sets, ...views]) if (el) ro.observe(el);
		return () => ro.disconnect();
	});
	// The loop: one velocity per row that eases toward its target, so stops and starts are never abrupt
	$effect(() => {
		if (reduced || !root) return;
		let raf = 0;
		let last = 0;
		let visible = false;
		const frame = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			const stopped = pauseOnHover && (hover || focus);
			split.forEach((row, i) => {
				const s = motion[i];
				const track = tracks[i];
				if (!s || !track || s.w <= 0) return;
				if (!s.drag) {
					const target = stopped ? 0 : speed * row.dir;
					const fling = Math.abs(s.v - target) > Math.max(120, speed * 2);
					const tau = fling ? 0.55 : stopped ? 0.32 : 0.7;
					s.v += (target - s.v) * (1 - Math.exp(-dt / tau));
					s.x += s.v * dt;
					if (s.seek) {
						const step = s.seek * (1 - Math.exp(-dt / 0.12));
						s.x += step;
						s.seek = Math.abs(s.seek - step) < 0.5 ? 0 : s.seek - step;
					}
				}
				s.x = mod(s.x, s.w);
				track.style.transform = `translate3d(${-s.x}px, 0, 0)`;
			});
			raf = visible ? requestAnimationFrame(frame) : 0;
		};
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible && !raf) {
				last = 0;
				raf = requestAnimationFrame(frame);
			}
		});
		io.observe(root!);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	function down(i: number, e: PointerEvent) {
		const s = motion[i];
		if (!s || (e.pointerType === 'mouse' && e.button !== 0)) return;
		s.drag = { id: e.pointerId, lastX: e.clientX, lastT: e.timeStamp, moved: 0, captured: false };
		s.v = 0;
	}
	function move(i: number, e: PointerEvent & { currentTarget: HTMLDivElement }) {
		const s = motion[i];
		const d = s?.drag;
		if (!s || !d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.lastX;
		const dt = Math.max(1, e.timeStamp - d.lastT) / 1000;
		d.moved += Math.abs(dx);
		if (!d.captured && d.moved > 4) {
			d.captured = true;
			e.currentTarget.setPointerCapture(e.pointerId);
			e.currentTarget.setAttribute('data-dragging', '');
		}
		s.x -= dx;
		s.v = s.v * 0.6 + (-dx / dt) * 0.4;
		d.lastX = e.clientX;
		d.lastT = e.timeStamp;
	}
	function up(i: number, e: PointerEvent & { currentTarget: HTMLDivElement }) {
		const s = motion[i];
		const d = s?.drag;
		if (!s || !d || d.id !== e.pointerId) return;
		if (e.timeStamp - d.lastT > 80) s.v = 0;
		s.v = clamp(s.v, -2400, 2400);
		s.drag = null;
		e.currentTarget.removeAttribute('data-dragging');
		if (d.captured) {
			const view = e.currentTarget;
			const stop = (ev: MouseEvent) => (ev.preventDefault(), ev.stopPropagation());
			view.addEventListener('click', stop, { capture: true, once: true });
			setTimeout(() => view.removeEventListener('click', stop, { capture: true }), 0);
		}
	}
	function focusItem(i: number, e: FocusEvent & { currentTarget: HTMLElement }) {
		const s = motion[i];
		const view = views[i];
		if (reduced || !s || !view) return;
		const v = view.getBoundingClientRect();
		const r = e.currentTarget.getBoundingClientRect();
		const pad = Math.min(96, v.width * 0.15);
		if (r.left < v.left + pad) s.seek = r.left - (v.left + pad);
		else if (r.right > v.right - pad) s.seek = r.right - (v.right - pad);
	}
	function keydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		const back = e.key === 'ArrowLeft';
		if (e.target instanceof HTMLAnchorElement) {
			const list = Array.from(e.target.closest('ul')?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []);
			const next = list[list.indexOf(e.target) + (back ? -1 : 1)];
			if (next) {
				e.preventDefault();
				next.focus();
			}
			return;
		}
		if (reduced || e.target !== e.currentTarget) return;
		e.preventDefault();
		for (const s of motion) if (s) s.seek += back ? -160 : 160;
	}
</script>

{#snippet body(logo: MarqueeLogo, key: string)}
	{#if logo.svg || (logo.src && !failed[key]) || labels === 'none'}
		<span class="ui-lmc__mark" aria-hidden="true">
			{#if logo.svg}<svg viewBox="0 0 24 24" fill="currentColor"><path d={logo.svg} /></svg>
			{:else if logo.src && !failed[key]}<img src={logo.src} alt="" draggable="false" onerror={() => (failed[key] = true)} />
			{:else}<span class="ui-lmc__tile">{initial(logo.name)}</span>{/if}
		</span>
	{/if}
	{#if labels !== 'none'}<span class="ui-lmc__name" title={logo.name}>{logo.name}</span>{:else}<span class="ui-lmc__sr">{logo.name}</span>{/if}
{/snippet}
{#snippet item(logo: MarqueeLogo, i: number, interactive: boolean, index: number)}
	<li class="ui-lmc__item" style:--ui-lmc-brand={logo.color} style:--ui-lmc-scale={logo.scale}>
		{#if logo.href}
			<a class="ui-lmc__link" href={logo.href} draggable="false" tabindex={interactive ? undefined : -1} onfocus={interactive ? (e) => focusItem(i, e) : undefined}>{@render body(logo, `${index}`)}</a>
		{:else}
			<span class="ui-lmc__link">{@render body(logo, `${index}`)}</span>
		{/if}
	</li>
{/snippet}

{#if logos.length}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (without links the strip is one tab stop: focus pauses it, arrows scrub it) -->
	<div
		bind:this={root}
		class={['ui-lmc', cls]}
		style:--ui-lmc-gap="{gap}px"
		role="region"
		aria-label={label}
		tabindex={!hasLinks && !reduced ? 0 : undefined}
		onkeydown={keydown}
		data-labels={labels}
		data-grayscale={grayscale || undefined}
		data-static={reduced || undefined}
		onpointerenter={(e) => e.pointerType !== 'touch' && (hover = true)}
		onpointerleave={() => (hover = false)}
		onfocusin={(e) => (focus = (e.target as Element).matches(':focus-visible'))}
		onfocusout={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && (focus = false)}
	>
		{#if reduced}
			<ul class="ui-lmc__wrap">{#each logos as l, k (k)}{@render item(l, 0, true, k)}{/each}</ul>
		{:else}
			{#each split as row, i (i)}
				<div bind:this={views[i]} class="ui-lmc__row" role="presentation" onpointerdown={(e) => down(i, e)} onpointermove={(e) => move(i, e)} onpointerup={(e) => up(i, e)} onpointercancel={(e) => up(i, e)}>
					<div bind:this={tracks[i]} class="ui-lmc__track">
						{#each { length: Math.max(2, copies[i] ?? 2) } as _, c (c)}
							{#if c === 0}
								<ul bind:this={sets[i]} class="ui-lmc__set">{#each row.logos as l, k (k)}{@render item(l, i, true, k)}{/each}</ul>
							{:else}
								<ul class="ui-lmc__set" aria-hidden="true" inert>{#each row.logos as l, k (k)}{@render item(l, i, false, k)}{/each}</ul>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
{/if}
