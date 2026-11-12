<!-- Model Wheel – ported from affectUI (MIT). Model names on a turning 3D drum: auto-turns, drag and fling with detents, springs onto a row. -->
<script lang="ts" module>
	export type WheelModel = { name: string; viewBox?: string; color: string; d: string };
	const ROW = 44;
	const STEP = 20;
	const RADIUS = ROW / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
	const VISIBLE = 4;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { MARKS } from './marks';
	import './model-wheel.css';

	const NAMES = ['Fable 5.1', 'Sol 6', 'Flash 3.8', 'Atlas 2', 'Echo Pro', 'Nimbus', 'Orion 4', 'Quill'];
	let {
		models: given = NAMES.map((name, i) => ({ name, color: MARKS[i].color, d: MARKS[i].d })),
		hold = 1500,
		label = 'AI models on a turning wheel, one after another lands in the middle',
		class: cls
	}: { /** At least 7 keep the drum full (fewer are repeated) */ models?: WheelModel[]; /** ms a model stays selected */ hold?: number; label?: string; class?: string } = $props();

	const models = $derived.by(() => {
		let out = given;
		while (out.length < 7) out = [...out, ...given];
		return out;
	});
	let root: HTMLDivElement;
	const rows: HTMLDivElement[] = [];

	onMount(() => {
		const el = root;
		const n = models.length;
		let offset = 0;
		const place = () => {
			rows.forEach((row, i) => {
				if (!row) return;
				let rel = (((i - offset) % n) + n) % n;
				if (rel > n / 2) rel -= n;
				const angle = rel * STEP;
				const hidden = Math.abs(rel) > VISIBLE;
				row.style.transform = `translateZ(${-RADIUS}px) rotateX(${-angle}deg) translateZ(${RADIUS}px)`;
				row.style.opacity = hidden ? '0' : String(Math.max(0, Math.cos((angle * Math.PI) / 180)) ** 1.6);
				const active = Math.abs(rel) < 0.5;
				if (active && !row.hasAttribute('data-active')) el.style.setProperty('--ui-mw-fill-w', `${row.querySelector('.ui-mw-label')!.getBoundingClientRect().width + 28}px`);
				row.toggleAttribute('data-active', active);
			});
		};
		place();
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		// One spring moves the drum; dragging sets the offset directly, letting go keeps the swing going
		let vel = 0;
		let target = 0;
		let stiffness = 0;
		let damping = 0;
		let frame = 0;
		let last = 0;
		let timer: ReturnType<typeof setTimeout>;
		let visible = false;
		let hovered = false;
		let drag: { y: number; offset: number; t: number } | null = null;
		const spring = (k: number, ratio: number) => {
			stiffness = k;
			damping = 2 * Math.sqrt(k) * ratio;
		};
		const loop = (now: number) => {
			const dt = Math.min(0.032, (now - last) / 1000);
			last = now;
			if (!drag) {
				const force = stiffness * (target - offset) - damping * vel;
				vel += force * dt;
				offset += vel * dt;
				if (Math.abs(target - offset) < 0.0005 && Math.abs(vel) < 0.01) {
					offset = target = ((target % n) + n) % n;
					vel = 0;
					place();
					frame = 0;
					schedule();
					return;
				}
			}
			place();
			frame = requestAnimationFrame(loop);
		};
		const run = () => {
			if (frame) return;
			last = performance.now();
			frame = requestAnimationFrame(loop);
		};
		const schedule = () => {
			clearTimeout(timer);
			if (still || !visible || hovered || drag) return;
			timer = setTimeout(() => {
				target = Math.round(offset) - 1;
				spring(70, 0.66);
				run();
			}, hold);
		};
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			e.preventDefault();
			clearTimeout(timer);
			el.setPointerCapture(e.pointerId);
			el.setAttribute('data-dragging', '');
			drag = { y: e.clientY, offset, t: performance.now() };
			vel = 0;
			run();
		};
		const onMove = (e: PointerEvent) => {
			if (!drag) return;
			if (e.buttons === 0) return onUp();
			const now = performance.now();
			const raw = drag.offset + (drag.y - e.clientY) / ROW;
			const next = raw - Math.sin(2 * Math.PI * raw) * 0.07;
			const instant = (next - offset) / Math.max(0.008, (now - drag.t) / 1000);
			vel = vel * 0.6 + instant * 0.4;
			offset = next;
			drag.t = now;
		};
		const onUp = () => {
			if (!drag) return;
			drag = null;
			el.removeAttribute('data-dragging');
			if (still) {
				offset = target = ((Math.round(offset) % n) + n) % n;
				vel = 0;
				cancelAnimationFrame(frame);
				frame = 0;
				place();
				return;
			}
			target = Math.round(offset + vel * 0.22);
			spring(140, 0.68);
			run();
		};
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible) schedule();
			else clearTimeout(timer);
		});
		io.observe(el);
		const enter = () => {
			hovered = true;
			clearTimeout(timer);
		};
		const leave = () => {
			hovered = false;
			schedule();
		};
		el.addEventListener('pointerenter', enter);
		el.addEventListener('pointerleave', leave);
		el.addEventListener('pointerdown', onDown);
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerup', onUp);
		el.addEventListener('pointercancel', onUp);
		el.addEventListener('lostpointercapture', onUp);
		addEventListener('pointerup', onUp);
		addEventListener('blur', onUp);
		return () => {
			io.disconnect();
			cancelAnimationFrame(frame);
			clearTimeout(timer);
			el.removeEventListener('pointerenter', enter);
			el.removeEventListener('pointerleave', leave);
			el.removeEventListener('pointerdown', onDown);
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerup', onUp);
			el.removeEventListener('pointercancel', onUp);
			el.removeEventListener('lostpointercapture', onUp);
			removeEventListener('pointerup', onUp);
			removeEventListener('blur', onUp);
		};
	});
</script>

<div bind:this={root} class={['ui-mw', cls]} role="img" aria-label={label}>
	<div class="ui-mw-fill" aria-hidden="true"></div>
	<div class="ui-mw-drum" aria-hidden="true">
		{#each models as m, i (`${m.name}:${i}`)}
			<div bind:this={rows[i]} class="ui-mw-row">
				<span class="ui-mw-label"><svg viewBox={m.viewBox ?? '0 0 24 24'} style:color={m.color === 'currentColor' ? undefined : m.color}><path d={m.d} fill="currentColor" /></svg>{m.name}</span>
			</div>
		{/each}
	</div>
</div>
