<!-- Glow Cloud – ported from affectUI (MIT). A glowing coloured cloud with white-glow edges and eyes that floats, looks around, follows the pointer and blinks. -->
<script lang="ts" module>
	const PUFFS = [
		{ cx: 115, cy: 93, r: 43 },
		{ cx: 163, cy: 111, r: 39 },
		{ cx: 156, cy: 155, r: 31 },
		{ cx: 107, cy: 155, r: 35 },
		{ cx: 72, cy: 126, r: 34 }
	];
	const CORE = { x: 80, y: 100, width: 80, height: 65 };
	const EYES = { y: 106, w: 18, h: 31, left: 96.5, right: 127.5 };
	const CX = 120;
	const CY = 120;
	const BOTTOM = 180;
	const GLANCES = [
		{ x: 0, y: 0 },
		{ x: -1, y: 0.05 },
		{ x: 1, y: -0.05 },
		{ x: 0, y: 0 },
		{ x: 0.65, y: -0.55 },
		{ x: -0.7, y: 0.35 }
	];
	const about = (x: number, y: number, t: string) => `translate(${x} ${y}) ${t} translate(${-x} ${-y})`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './glow-cloud.css';

	let {
		background = true,
		color = 'orange',
		followPointer = true,
		label = 'A glowing cloud with eyes that floats, looks around and blinks',
		class: cls
	}: {
		/** Fill the illustration with the sky gradient */
		background?: boolean;
		/** blue: a blue-to-cyan sky · orange: a red-to-orange sky */
		color?: 'blue' | 'orange';
		/** The eyes follow the pointer while it's over the illustration */
		followPointer?: boolean;
		label?: string;
		class?: string;
	} = $props();

	const _pid = $props.id();
	const uid = _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const id = (name: string) => `gc${uid}-${name}`;
	let root: HTMLDivElement;
	let floatEl: SVGGElement;
	let turnEl: SVGGElement;
	let eyesEl: SVGGElement;
	let leftEye = $state<SVGGElement>();
	let rightEye = $state<SVGGElement>();
	let shineEl: SVGEllipseElement;
	let shadowEl: SVGEllipseElement;

	onMount(() => {
		const el = root;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const look = { x: 0, y: 0, vx: 0, vy: 0 };
		const target = { x: 0, y: 0 };
		const squish = { p: 0, v: 0 };
		let pointer = false;
		let nextGlance = 1.2;
		let nextBlink = 1.8;
		let blinkAt = -1;
		let blinkTwice = false;
		let winkAt = -1;
		let frame = 0;
		let last = 0;
		let time = 0;
		const blinkScale = (since: number, length = 0.16) => (since < 0 || since > length ? 1 : 1 - 0.9 * Math.sin((since / length) * Math.PI));
		const draw = () => {
			const float = still ? 0 : Math.sin(time * 1.1) * 5;
			const breathe = still ? 0 : Math.sin(time * 1.1 + Math.PI / 2) * 0.012;
			const sy = 1 + breathe - squish.p * 0.12;
			const sx = 1 - breathe + squish.p * 0.1;
			floatEl?.setAttribute('transform', `translate(0 ${float.toFixed(2)}) ${about(CX, BOTTOM, `scale(${sx.toFixed(4)} ${sy.toFixed(4)})`)}`);
			turnEl?.setAttribute('transform', `translate(${(look.x * 4).toFixed(2)} ${(look.y * 2).toFixed(2)}) ${about(CX, CY, `rotate(${(look.x * 2.5).toFixed(2)}) scale(${(1 - Math.abs(look.x) * 0.025).toFixed(4)} 1)`)}`);
			eyesEl?.setAttribute('transform', `translate(${(look.x * 12).toFixed(2)} ${(look.y * 7).toFixed(2)})`);
			shineEl?.setAttribute('transform', `translate(${(-look.x * 7).toFixed(2)} ${(-look.y * 3).toFixed(2)})`);
			const both = blinkAt < 0 ? 1 : Math.min(blinkScale(time - blinkAt), blinkTwice ? blinkScale(time - blinkAt - 0.26) : 1);
			const wink = blinkScale(time - winkAt, 0.34);
			const eyeY = EYES.y + EYES.h / 2;
			leftEye?.setAttribute('transform', about(EYES.left + EYES.w / 2, eyeY, `scale(1 ${both.toFixed(3)})`));
			rightEye?.setAttribute('transform', about(EYES.right + EYES.w / 2, eyeY, `scale(1 ${Math.min(both, wink).toFixed(3)})`));
			const lift = (float + 5) / 10;
			shadowEl?.setAttribute('transform', about(CX, 210, `scale(${(1 - lift * 0.12).toFixed(3)} 1)`));
			shadowEl?.setAttribute('opacity', (0.34 - lift * 0.1).toFixed(3));
		};
		const tick = (now: number) => {
			const dt = Math.min(0.05, (now - (last || now)) / 1000);
			last = now;
			time += dt;
			if (!pointer && time > nextGlance) {
				const g = GLANCES[Math.floor(Math.random() * GLANCES.length)];
				target.x = g.x;
				target.y = g.y;
				nextGlance = time + 1.4 + Math.random() * 2.2;
			}
			if (time > nextBlink) {
				blinkAt = time;
				blinkTwice = Math.random() < 0.25;
				nextBlink = time + 2.4 + Math.random() * 3;
			}
			look.vx += ((target.x - look.x) * 70 - look.vx * 13) * dt;
			look.vy += ((target.y - look.y) * 70 - look.vy * 13) * dt;
			look.x += look.vx * dt;
			look.y += look.vy * dt;
			squish.v += (-squish.p * 220 - squish.v * 9) * dt;
			squish.p += squish.v * dt;
			draw();
			frame = requestAnimationFrame(tick);
		};
		const start = () => {
			if (frame || still) return;
			last = 0;
			frame = requestAnimationFrame(tick);
		};
		const stop = () => {
			cancelAnimationFrame(frame);
			frame = 0;
		};
		const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
		io.observe(el);
		const onMove = (e: PointerEvent) => {
			if (!followPointer) return;
			const r = el.getBoundingClientRect();
			pointer = true;
			target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2.4));
			target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2.4));
		};
		const onLeave = () => {
			pointer = false;
			target.x = 0;
			target.y = 0;
			nextGlance = time + 1.2;
		};
		const onDown = () => {
			squish.p = 0.9;
			squish.v = 0;
			winkAt = time + 0.12;
			if (still) {
				start();
				setTimeout(stop, 1200);
			}
		};
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('pointerdown', onDown);
		draw();
		return () => {
			stop();
			io.disconnect();
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('pointerdown', onDown);
		};
	});
</script>

{#snippet puffs()}{#each PUFFS as p, i (i)}<circle {...p} />{/each}<rect {...CORE} />{/snippet}
{#snippet stop(offset: number, c: string, opacity?: number)}<stop {offset} style:stop-color="var(--ui-glw-{c})" style:stop-opacity={opacity} />{/snippet}
{#snippet eye(x: number, side: string)}
	{@const pill = { x, y: EYES.y, width: EYES.w, height: EYES.h, rx: EYES.w / 2 }}
	<rect {...pill} fill="url(#{id('eye')})" />
	<clipPath id={id(`clip-${side}`)}><rect {...pill} /></clipPath>
	<rect {...pill} y={EYES.y + 2.5} class="ui-glw__eye-shade" fill="none" stroke-width="5" filter="url(#{id('edge')})" clip-path="url(#{id(`clip-${side}`)})" />
{/snippet}

<div bind:this={root} class={['ui-glw', cls]} data-bg={background || undefined} data-color={color} role="img" aria-label={label}>
	<svg viewBox="0 0 240 240" aria-hidden="true">
		<defs>
			<filter id={id('goo')} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="3.5" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" /></filter>
			<filter id={id('soft')} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="7" /></filter>
			<filter id={id('halo')} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id={id('edge')} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1.6" /></filter>
			<filter id={id('shade')} x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="5" /></filter>
			<g id={id('shape')} filter="url(#{id('goo')})">{@render puffs()}</g>
			<mask id={id('mask')} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240"><use href="#{id('shape')}" fill="#fff" /></mask>
			<linearGradient id={id('rim')} x1="0" y1="56" x2="0" y2="182" gradientUnits="userSpaceOnUse">{@render stop(0, 'rim')}{@render stop(1, 'white')}</linearGradient>
			<radialGradient id={id('body')} cx="120" cy="108" r="78" gradientUnits="userSpaceOnUse">{@render stop(0, 'body-1')}{@render stop(0.6, 'body-2')}{@render stop(1, 'body-3')}</radialGradient>
			<linearGradient id={id('eye')} x1="0" y1="0" x2="0" y2="1">{@render stop(0, 'white')}{@render stop(1, 'eye')}</linearGradient>
		</defs>
		<ellipse bind:this={shadowEl} class="ui-glw__shadow" cx={CX} cy="210" rx="54" ry="7" filter="url(#{id('shade')})" />
		<g bind:this={floatEl}>
			<g bind:this={turnEl}>
				<use href="#{id('shape')}" class="ui-glw__halo" filter="url(#{id('halo')})" />
				<use href="#{id('shape')}" class="ui-glw__edge" filter="url(#{id('edge')})" />
				<g mask="url(#{id('mask')})">
					<rect width="240" height="240" fill="url(#{id('rim')})" />
					<g filter="url(#{id('soft')})" fill="url(#{id('body')})" transform="translate(0 2) {about(CX, CY, 'scale(0.9 0.87)')}">{@render puffs()}</g>
					<ellipse bind:this={shineEl} cx="104" cy="80" rx="30" ry="12" fill="#fff" opacity="0.32" filter="url(#{id('shade')})" />
				</g>
				<g bind:this={eyesEl}>
					<g bind:this={leftEye}>{@render eye(EYES.left, 'l')}</g>
					<g bind:this={rightEye}>{@render eye(EYES.right, 'r')}</g>
				</g>
			</g>
		</g>
	</svg>
</div>
