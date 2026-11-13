<!-- Voice Orb – the face of a voice assistant: a sphere of dots that breathes when idle, catches sound when listening, swirls while thinking and pulses while speaking. -->
<script lang="ts" module>
	export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	let { state: mode = $bindable<OrbState>('listening'), size = 170, dots = 360, showControls = true }: { state?: OrbState; size?: number; dots?: number; showControls?: boolean } = $props();
	let canvas = $state<HTMLCanvasElement>();
	// Fibonacci sphere
	const pts = $derived(Array.from({ length: dots }, (_, i) => {
		const y = 1 - (i / (dots - 1)) * 2,
			r = Math.sqrt(1 - y * y),
			th = i * 2.399963;
		return [Math.cos(th) * r, y, Math.sin(th) * r] as const;
	}));
	const labels: Record<OrbState, string> = { idle: 'Idle', listening: 'Listening …', thinking: 'Thinking …', speaking: 'Speaking …' };
	let m = 0;
	const ptr = { x: -1e4, y: -1e4 };
	function draw(t: number) {
		const c = canvas?.getContext('2d');
		if (!c || !canvas) return;
		const dpr = devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		c.scale(dpr, dpr);
		const R = size * 0.42,
			cx = size / 2,
			cy = size / 2;
		m += ((mode === 'thinking' ? 1 : 0) - m) * 0.06; // sphere ↔ möbius morph
		const rows = 6,
			cols = Math.ceil(dots / rows);
		const spin = t * (mode === 'thinking' ? 0.0008 : 0.0003);
		const rect = canvas.getBoundingClientRect();
		const mx = ptr.x - rect.left,
			my = ptr.y - rect.top,
			reach = size * 0.28;
		const amp = mode === 'idle' ? 0.02 * Math.sin(t / 900) : mode === 'listening' ? 0.05 : mode === 'speaking' ? 0.08 * Math.abs(Math.sin(t / 160)) : 0.03;
		for (const [i, [sx, sy, sz]] of pts.entries()) {
			// möbius strip: dots flow along the band (u) across its width (v)
			const u = (Math.floor(i / rows) / cols) * Math.PI * 2 + t * 0.0006,
				v = ((i % rows) / (rows - 1)) * 2 - 1,
				w = (1 + (v / 2) * Math.cos(u / 2)) / 1.5;
			const x0 = sx + (w * Math.cos(u) - sx) * m,
				y = sy + (w * Math.sin(u) - sy) * m,
				z0 = sz + (((v / 2) * Math.sin(u / 2)) / 1.5 - sz) * m;
			const x = x0 * Math.cos(spin) - z0 * Math.sin(spin),
				z = x0 * Math.sin(spin) + z0 * Math.cos(spin);
			const wob = mode === 'listening' ? Math.sin(y * 9 + t / 120) * amp : amp;
			const k = 1 + wob;
			const front = (z + 1) / 2;
			let px = cx + x * R * k,
				py = cy + y * R * k;
			// push dots away from the cursor
			const dx = px - mx,
				dy = py - my,
				d = Math.hypot(dx, dy);
			if (d < reach && d > 0) {
				const f = (1 - d / reach) ** 2 * reach * 0.5;
				px += (dx / d) * f;
				py += (dy / d) * f;
			}
			c.beginPath();
			c.arc(px, py, 0.6 + front * 1.6, 0, Math.PI * 2);
			c.fillStyle = `rgba(${Math.round(40 + (1 - front) * 60)}, ${Math.round(90 + (1 - front) * 30)}, ${Math.round(240 - (1 - front) * 150)}, ${0.35 + front * 0.65})`;
			c.fill();
		}
	}
	onMount(() => {
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let raf = 0;
		const loop = (t: number) => (draw(t), still || (raf = requestAnimationFrame(loop)));
		raf = requestAnimationFrame(loop);
		const move = (e: PointerEvent) => ((ptr.x = e.clientX), (ptr.y = e.clientY));
		const leave = () => ((ptr.x = -1e4), (ptr.y = -1e4));
		addEventListener('pointermove', move);
		document.addEventListener('pointerleave', leave);
		return () => {
			cancelAnimationFrame(raf);
			removeEventListener('pointermove', move);
			document.removeEventListener('pointerleave', leave);
		};
	});
	$effect(() => {
		void [mode, size, pts];
		draw(performance.now());
	});
</script>

<div class="ui-vorb">
	<div role="img" aria-label="Voice assistant: {labels[mode]}"><canvas bind:this={canvas} style:width="{size}px" style:height="{size}px" aria-hidden="true"></canvas></div>
	<p aria-live="polite">{labels[mode]}</p>
	{#if showControls}
		<div class="ui-vorb__seg" role="radiogroup" aria-label="Assistant state">
			{#each ['idle', 'listening', 'thinking', 'speaking'] as const as s (s)}<button role="radio" aria-checked={mode === s} onclick={() => (mode = s)}>{s[0].toUpperCase() + s.slice(1)}</button>{/each}
		</div>
	{/if}
</div>

<style>
	.ui-vorb {
		display: grid;
		justify-items: center;
		gap: 14px;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
	}
	canvas {
		background: radial-gradient(closest-side, rgba(80, 120, 255, 0.08), transparent);
		border-radius: 50%;
	}
	p {
		margin: 0;
		font-size: 13px;
		color: #171717;
	}
	.ui-vorb__seg {
		display: flex;
		padding: 3px;
		border-radius: 10px;
		background: rgba(0, 0, 0, 0.04);
	}
	.ui-vorb__seg button {
		border: 0;
		background: none;
		font: inherit;
		font-size: 13px;
		color: #737373;
		padding: 5px 12px;
		border-radius: 8px;
		cursor: pointer;
	}
	.ui-vorb__seg button[aria-checked='true'] {
		background: #fff;
		color: #171717;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-vorb p {
		color: #ededed;
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-vorb__seg button[aria-checked='true'] {
		background: #2a2a2a;
		color: #ededed;
	}
</style>
