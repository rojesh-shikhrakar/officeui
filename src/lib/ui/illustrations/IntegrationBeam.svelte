<!-- Integration Beam – ported from affectUI (MIT). Your product between the tools it connects: pulses travel in and out, tap a tool to pause it, layout morphs when it stacks. -->
<script lang="ts" module>
	export type BeamTool = { name: string; /** A path on a 24×24 viewBox */ d: string; color?: string };
	export type BeamCenter = { name: string };
	const TRAVEL = 1500;
	const STAGGER = 280;
	const REST = 1500;
	const MORPH = 460;
	const FLASH = 1400;
	const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
	const easeOut = (t: number) => 1 - (1 - t) ** 5;
	const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
	type Point = { x: number; y: number };
	type Curve = number[];
	const PETAL = 'M24 24C17.6 19.6 16.4 9.4 24 3.5C31.6 9.4 30.4 19.6 24 24Z';
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { MARKS } from './marks';
	import './integration-beam.css';

	const toTool = (i: number): BeamTool => ({ name: MARKS[i].name, d: MARKS[i].d, color: MARKS[i].color });
	let {
		left = [0, 2, 4].map(toTool),
		right = [1, 6, 8].map(toTool),
		center = { name: 'Acme' },
		label,
		class: cls
	}: {
		/** Tools that send data in (left, or above when narrow) – three look best */
		left?: BeamTool[];
		/** Tools that receive data (right, or below) */
		right?: BeamTool[];
		center?: BeamCenter;
		label?: string;
		class?: string;
	} = $props();

	const _pid = $props.id();
	const uid = 'ui-ibm' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const tools = $derived([...left, ...right]);
	const n = $derived(tools.length);
	const nLeft = $derived(left.length);
	const off = new SvelteSet<number>();
	let focus = $state<number | null>(null);
	let flash = $state<number | null>(null);
	let syncing = $state(false);
	let announce = $state('');
	let rootEl: HTMLDivElement;
	let sceneEl: HTMLDivElement;
	let svgEl: SVGSVGElement;
	let centerEl: HTMLDivElement;
	let centerRing: HTMLSpanElement;
	let chip: HTMLSpanElement;
	let chipInner = $state<HTMLSpanElement>();
	const toolEls: HTMLButtonElement[] = [];
	const ringEls: HTMLSpanElement[] = [];
	const lineEls: SVGPathElement[] = [];
	const pulseEls: SVGGElement[] = [];
	const gradEls: SVGLinearGradientElement[] = [];
	let flashTimer: ReturnType<typeof setTimeout>;
	const connected = $derived(n - off.size);
	const status = $derived(connected === 0 ? 'All paused' : syncing ? 'Syncing…' : `${connected} connected`);

	onMount(() => {
		const root = rootEl;
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let shown: Curve[] = [];
		let from: Curve[] = [];
		let to: Curve[] = [];
		let morphStart = 0;
		let lastPos: Point[] | null = null;
		let lastStack: boolean | null = null;
		const lengths: number[] = [];
		const centerOf = (el: HTMLElement): Point => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });
		const curve = (a: Point, b: Point, stack: boolean): Curve => {
			if (stack) {
				const my = (a.y + b.y) / 2;
				return [a.x, a.y, a.x, my, b.x, my, b.x, b.y];
			}
			const mx = (a.x + b.x) / 2;
			return [a.x, a.y, mx, a.y, mx, b.y, b.x, b.y];
		};
		const draw = (curves: Curve[]) => {
			shown = curves;
			curves.forEach((c, i) => {
				const d = `M${c[0]} ${c[1]}C${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]}`;
				const line = lineEls[i];
				if (!line) return;
				line.setAttribute('d', d);
				pulseEls[i]?.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
				lengths[i] = line.getTotalLength();
			});
		};
		const measure = () => {
			svgEl.setAttribute('viewBox', `0 0 ${root.clientWidth} ${root.clientHeight}`);
			const stack = getComputedStyle(sceneEl).getPropertyValue('--ui-ibm-stack').trim() === '1';
			const els = [...toolEls.slice(0, n), centerEl];
			if (els.some((el) => !el)) return;
			const pos = els.map((el) => centerOf(el));
			const c = pos[n];
			const target = pos.slice(0, n).map((p, i) => (i < nLeft ? curve(p, c, stack) : curve(c, p, stack)));
			if (lastPos && lastStack !== null && stack !== lastStack && !reduce) {
				els.forEach((el, i) => {
					const dx = lastPos![i].x - pos[i].x;
					const dy = lastPos![i].y - pos[i].y;
					if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: MORPH, easing: EASE });
				});
				from = shown.length === n ? shown : target;
				to = target;
				morphStart = performance.now();
				kick();
			} else if (morphStart) to = target;
			else draw(target);
			lastPos = pos;
			lastStack = stack;
		};
		// Pulses: one per beam at a time, from a schedule rebuilt every sync cycle
		const pulseStart: (number | null)[] = Array(n).fill(null);
		let queue: { beam: number; at: number }[] = [];
		let nextCycle = 0;
		let syncFrom = 0;
		let syncTo = 0;
		let wasSyncing = false;
		let visible = false;
		let raf = 0;
		const hide = (i: number) => {
			pulseStart[i] = null;
			if (pulseEls[i]) pulseEls[i].style.opacity = '0';
		};
		const ring = (el: HTMLElement | undefined) =>
			el?.animate(
				[
					{ opacity: 0, transform: 'scale(0.96)' },
					{ opacity: 1, transform: 'scale(1)', offset: 0.3 },
					{ opacity: 0, transform: 'scale(1.14)' }
				],
				{ duration: 760, easing: 'ease-out' }
			);
		const planCycle = (now: number) => {
			const ins = Array.from({ length: nLeft }, (_, i) => i).filter((i) => !off.has(i));
			const outs = Array.from({ length: n - nLeft }, (_, i) => nLeft + i).filter((i) => !off.has(i));
			if (!ins.length && !outs.length) return void (nextCycle = now + REST);
			const tOut = ins.length ? now + TRAVEL : now;
			queue = [...ins.map((beam, k) => ({ beam, at: now + k * STAGGER })), ...outs.map((beam, k) => ({ beam, at: tOut + k * STAGGER }))];
			const end = Math.max(...queue.map((q) => q.at)) + TRAVEL;
			syncFrom = ins.length ? tOut : now;
			syncTo = end;
			nextCycle = end + REST;
		};
		const paint = (i: number, t: number) => {
			const line = lineEls[i];
			const g = pulseEls[i];
			const grad = gradEls[i];
			if (!line || !g || !grad) return;
			const L = lengths[i] || 0;
			const seg = Math.min(84, L * 0.42);
			const head = easeInOut(t) * (L + seg);
			g.querySelectorAll('path').forEach((p) => {
				p.style.strokeDasharray = `${seg} ${L + seg}`;
				p.style.strokeDashoffset = `${seg - head}`;
			});
			const a = line.getPointAtLength(Math.max(0, Math.min(L, head - seg)));
			const b = line.getPointAtLength(Math.max(0, Math.min(L, head)));
			grad.setAttribute('x1', `${a.x}`);
			grad.setAttribute('y1', `${a.y}`);
			grad.setAttribute('x2', `${b.x + (b.x === a.x && b.y === a.y ? 0.01 : 0)}`);
			grad.setAttribute('y2', `${b.y}`);
			g.style.opacity = '1';
		};
		const frame = (now: number) => {
			raf = 0;
			if (morphStart) {
				const t = Math.min(1, (now - morphStart) / MORPH);
				const e = easeOut(t);
				draw(to.map((c, i) => c.map((v, k) => (from[i]?.[k] ?? v) + (v - (from[i]?.[k] ?? v)) * e)));
				if (t >= 1) morphStart = 0;
			}
			if (visible && !reduce) {
				if (now >= nextCycle) planCycle(now);
				queue = queue.filter((q) => {
					if (q.at > now) return true;
					if (!off.has(q.beam) && pulseStart[q.beam] === null) pulseStart[q.beam] = q.at;
					return false;
				});
				for (let i = 0; i < n; i++) {
					const start = pulseStart[i];
					if (start === null) continue;
					if (off.has(i)) {
						hide(i);
						continue;
					}
					const t = (now - start) / TRAVEL;
					if (t >= 1) {
						hide(i);
						ring(i < nLeft ? centerRing : ringEls[i]);
						continue;
					}
					paint(i, t);
				}
				const isSyncing = now >= syncFrom && now < syncTo;
				if (isSyncing !== wasSyncing) syncing = wasSyncing = isSyncing;
			}
			if (morphStart || (visible && !reduce)) raf = requestAnimationFrame(frame);
		};
		const kick = () => {
			if (!raf) raf = requestAnimationFrame(frame);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(root);
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible) {
				nextCycle = performance.now() + 400;
				kick();
			} else {
				queue = [];
				for (let i = 0; i < n; i++) hide(i);
				syncTo = 0;
				if (wasSyncing) syncing = wasSyncing = false;
			}
		});
		io.observe(root);
		return () => {
			ro.disconnect();
			io.disconnect();
			cancelAnimationFrame(raf);
			clearTimeout(flashTimer);
		};
	});
	// The status chip glides to the width of its new text
	$effect(() => {
		void status;
		tick().then(() => chip && chipInner && (chip.style.width = `${chipInner.offsetWidth}px`));
	});
	function toggle(i: number) {
		const pausing = !off.has(i);
		if (pausing) off.add(i);
		else off.delete(i);
		announce = `${tools[i].name} ${pausing ? 'paused' : 'connected'}. ${n - off.size} of ${n} connected.`;
		flash = i;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => (flash = null), FLASH);
	}
</script>

{#snippet tile(t: BeamTool, i: number)}
	<button
		bind:this={toolEls[i]}
		type="button"
		class="ui-ibm__tool"
		aria-pressed={!off.has(i)}
		aria-label="{t.name}, {off.has(i) ? 'paused' : 'connected'}"
		data-off={off.has(i) || undefined}
		data-tip={focus === i || flash === i || undefined}
		onclick={() => toggle(i)}
		onpointerenter={(e) => e.pointerType === 'mouse' && (focus = i)}
		onpointerleave={() => (focus = null)}
		onfocus={(e) => e.currentTarget.matches(':focus-visible') && (focus = i)}
		onblur={() => (focus = null)}
	>
		<span class="ui-ibm__ring" bind:this={ringEls[i]}></span>
		<span class="ui-ibm__logo" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(2 2) scale(0.833)" fill={t.color ?? 'currentColor'} d={t.d} /></svg></span>
		<span class="ui-ibm__tip" aria-hidden="true">{t.name}{#if off.has(i)}<span class="ui-ibm__tip-state"> · Paused</span>{/if}</span>
	</button>
{/snippet}

<div bind:this={rootEl} class={['ui-ibm', cls]} role="group" aria-label={label ?? `${center.name} connected to ${tools.map((t) => t.name).join(', ')}`} data-focus={focus !== null || undefined}>
	<svg bind:this={svgEl} class="ui-ibm__beams" aria-hidden="true">
		<defs>
			<filter id="{uid}-blur" filterUnits="userSpaceOnUse" x="-100" y="-100" width="10000" height="10000"><feGaussianBlur stdDeviation="3" /></filter>
			{#each tools as _, i (i)}
				<linearGradient id="{uid}-g{i}" gradientUnits="userSpaceOnUse" bind:this={gradEls[i]}>
					<stop offset="0" class="ui-ibm__stop-tail" /><stop offset="0.6" class="ui-ibm__stop-mid" /><stop offset="1" class="ui-ibm__stop-head" />
				</linearGradient>
			{/each}
		</defs>
		{#each tools as _, i (i)}<path class="ui-ibm__line" data-off={off.has(i) || undefined} data-focus={focus === i || undefined} bind:this={lineEls[i]} />{/each}
		{#each tools as _, i (i)}
			<g class="ui-ibm__pulse" data-focus={focus === i || undefined} bind:this={pulseEls[i]}>
				<path class="ui-ibm__glow" stroke="url(#{uid}-g{i})" filter="url(#{uid}-blur)" />
				<path class="ui-ibm__core" stroke="url(#{uid}-g{i})" />
			</g>
		{/each}
	</svg>
	<div bind:this={sceneEl} class="ui-ibm__scene">
		<div class="ui-ibm__group ui-ibm__group--in">{#each left as t, i (i)}{@render tile(t, i)}{/each}</div>
		<div bind:this={centerEl} class="ui-ibm__center" data-syncing={(syncing && connected > 0) || undefined}>
			<span class="ui-ibm__ring ui-ibm__ring--center" bind:this={centerRing}></span>
			<span class="ui-ibm__mark" aria-hidden="true">
				<svg viewBox="0 0 48 48" aria-hidden="true">
					<g opacity="0.36">{#each [45, 135, 225, 315] as r (r)}<path d={PETAL} transform="rotate({r} 24 24)" />{/each}</g>
					{#each [0, 90, 180, 270] as r (r)}<path d={PETAL} transform="rotate({r} 24 24)" />{/each}
				</svg>
			</span>
			<span bind:this={chip} class="ui-ibm__chip">
				<span bind:this={chipInner} class="ui-ibm__chip-inner">
					<span class="ui-ibm__dot" data-idle={connected === 0 || undefined}></span>
					{#key status}<span class="ui-ibm__status">{status}</span>{/key}
				</span>
			</span>
		</div>
		<div class="ui-ibm__group ui-ibm__group--out">{#each right as t, i (i)}{@render tile(t, nLeft + i)}{/each}</div>
	</div>
	<span class="ui-ibm__sr" aria-live="polite">{announce}</span>
</div>
