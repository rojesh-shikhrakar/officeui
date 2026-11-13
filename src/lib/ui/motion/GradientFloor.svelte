<!-- Gradient Floor – a blurred colour gradient glowing in from an edge (anchor = bottom | top | left | right) or from the cursor itself (anchor = 'cursor', unbounded); two layers drift against each other so it never looks still. -->
<script lang="ts">
	type Anchor = 'bottom' | 'top' | 'left' | 'right' | 'cursor';
	let {
		colors = ['#fcd9b6', '#f0abbd', '#b79cf5', '#6d7cf0', '#3b4cca'],
		height = 360,
		speed = 1,
		anchor = 'bottom',
		class: cls
	}: { colors?: string[]; height?: number; speed?: number; anchor?: Anchor; class?: string } = $props();

	const INSET: Record<Anchor, string> = {
		bottom: '20% -10% -30%',
		top: '-30% -10% 20%',
		left: '-10% 20% -10% -30%',
		right: '-10% -30% -10% 20%',
		cursor: '-10%'
	};

	// every blob gets its own wobble vars (--{k}{i}x/y, set per frame in tick) so the glow keeps flowing even when the cursor is still
	function build(cs: string[], a: Anchor, k: string) {
		const n = Math.max(1, cs.length - 1);
		return cs
			.map((c, i) => {
				const p = 10 + (i * 80) / n;
				const wx = `var(--${k}${i}x, 0) * 1%`;
				const wy = `var(--${k}${i}y, 0) * 1%`;
				const at =
					a === 'bottom' ? `calc(${p}% + ${wx}) calc(100% + ${wy})`
					: a === 'top' ? `calc(${p}% + ${wx}) calc(0% + ${wy})`
					: a === 'left' ? `calc(0% + ${wx}) calc(${p}% + ${wy})`
					: a === 'right' ? `calc(100% + ${wx}) calc(${p}% + ${wy})`
					: `calc(var(--cx) * 1% + ${(i / n - 0.5) * 30}% + ${wx}) calc(var(--cy) * 1% + ${wy})`;
				const size = a === 'left' || a === 'right' ? '70% 40%' : a === 'cursor' ? '35% 50%' : '40% 70%';
				return `radial-gradient(${size} at ${at}, ${c}, transparent 70%)`;
			})
			.join(',');
	}
	const stopsA = $derived(build(colors, anchor, 'a'));
	const stopsB = $derived(build([...colors].reverse(), anchor, 'b'));

	let el: HTMLElement;
	let mx = $state(0); // -1..1 parallax, clamped
	let my = $state(0);
	let cx = $state(50); // % of the box, unclamped so the glow can follow the cursor outside it
	let cy = $state(50);
	let tx = 50;
	let ty = 50;
	const clamp = (v: number) => Math.max(-1, Math.min(1, v));
	function move(e: PointerEvent) {
		const r = el.getBoundingClientRect();
		tx = ((e.clientX - r.left) / r.width) * 100;
		ty = ((e.clientY - r.top) / r.height) * 100;
	}
	const leave = () => (tx = ty = 50);

	// one rAF loop: ease the cursor point (tight, 0.35/frame) and swirl each blob on its own slow orbit
	$effect(() => {
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let raf = 0;
		const tick = (now: number) => {
			cx += (tx - cx) * 0.35;
			cy += (ty - cy) * 0.35;
			mx = clamp(cx / 50 - 1);
			my = clamp(cy / 50 - 1);
			if (!still) {
				const t = (now / 1000) * speed;
				const [ax, ay] = anchor === 'cursor' ? [10, 16] : [8, 8];
				for (let i = 0; i < colors.length; i++)
					for (const [k, ph] of [['a', 0], ['b', 2.1]] as const) {
						const f = 0.45 + i * 0.17 + (k === 'b' ? 0.11 : 0);
						el.style.setProperty(`--${k}${i}x`, String(Math.cos(t * f + i * 1.7 + ph) * ax));
						el.style.setProperty(`--${k}${i}y`, String(Math.sin(t * f * 1.3 + i * 2.3 + ph) * ay));
					}
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<svelte:window onpointermove={move} />
<svelte:document onpointerleave={leave} />

<div
	bind:this={el}
	class={['ui-gfl', cls]}
	data-a={anchor}
	style:height="{height}px"
	style:--s={speed}
	style:--mx={mx}
	style:--my={my}
	style:--cx={cx}
	style:--cy={cy}
	aria-hidden="true"
>
	<i style:background={stopsA} style:inset={INSET[anchor]}></i>
	<i style:background={stopsB} style:inset={INSET[anchor]}></i>
	<b></b>
</div>

<style>
	.ui-gfl {
		--ux: 1; /* unit vector along the anchored edge: drift runs this way */
		--uy: 0;
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 16px;
		background: #fafafa;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
	}
	.ui-gfl:is([data-a='left'], [data-a='right']) {
		--ux: 0;
		--uy: 1;
	}
	i {
		position: absolute;
		filter: blur(40px) saturate(1.05);
		opacity: 0.85;
		animation: ui-gfl-a calc(14s / var(--s)) ease-in-out infinite alternate;
		/* cursor parallax; `translate` composes with the animated `transform` */
		translate: calc(var(--mx) * 12%) calc(var(--my) * 8%);
	}
	i + i {
		opacity: 0.5;
		translate: calc(var(--mx) * -8%) calc(var(--my) * 5%);
		animation-name: ui-gfl-b;
		animation-duration: calc(19s / var(--s));
	}
	/* cursor mode: the glow itself follows the pointer, so no parallax on top */
	[data-a='cursor'] i {
		translate: none;
	}
	b {
		position: absolute;
		background: radial-gradient(closest-side, #fff, transparent);
		filter: blur(10px);
	}
	[data-a='bottom'] b,
	[data-a='top'] b {
		left: 25%;
		right: 25%;
		height: 90px;
		translate: calc(var(--mx) * 120%) 0;
	}
	[data-a='bottom'] b {
		bottom: -40px;
	}
	[data-a='top'] b {
		top: -40px;
	}
	[data-a='left'] b,
	[data-a='right'] b {
		top: 25%;
		bottom: 25%;
		width: 90px;
		translate: 0 calc(var(--my) * 120%);
	}
	[data-a='left'] b {
		left: -40px;
	}
	[data-a='right'] b {
		right: -40px;
	}
	[data-a='cursor'] b {
		width: 200px;
		height: 90px;
		left: calc(var(--cx) * 1% - 100px);
		top: calc(var(--cy) * 1% - 45px);
	}
	@keyframes ui-gfl-a {
		to {
			transform: translate(calc(6% * var(--ux)), calc(6% * var(--uy))) scale(calc(1 + 0.1 * var(--uy)), calc(1 + 0.1 * var(--ux)));
		}
	}
	@keyframes ui-gfl-b {
		to {
			transform: translate(calc(-8% * var(--ux)), calc(-8% * var(--uy))) scale(calc(1 - 0.1 * var(--uy)), calc(1 - 0.1 * var(--ux)));
		}
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-gfl {
		background: #0a0a0a;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-gfl b {
		opacity: 0.2;
	}
	@media (prefers-reduced-motion: reduce) {
		i {
			animation: none;
		}
	}
</style>
