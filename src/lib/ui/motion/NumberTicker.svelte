<!-- Number Ticker – Odometer-style digits that roll to the new value once in view. -->
<script lang="ts" module>
	type Part = { key: string; digit: number } | { key: string; char: string };
	function split(text: string): Part[] {
		const chars = Array.from(text);
		const parts: Part[] = [];
		let d = 0;
		let s = 0;
		for (let i = chars.length - 1; i >= 0; i--) {
			const c = chars[i];
			if (c >= '0' && c <= '9') parts.unshift({ key: `d${d++}`, digit: c.charCodeAt(0) - 48 });
			else parts.unshift({ key: `s${s++}`, char: c });
		}
		return parts;
	}
	const mod10 = (n: number) => ((n % 10) + 10) % 10;
	const ease = (t: number) => 1 - Math.pow(1 - t, 4);
	const place = (el: HTMLElement, pos: number) => (el.style.transform = `translateY(${(-mod10(pos) / 11) * 100}%)`);
	type Roll = { pos: number; from: number; to: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './number-ticker.css';

	let {
		value = 48240,
		format,
		locale = 'en-US',
		duration = 900,
		delay = 0,
		class: cls
	}: {
		value?: number;
		/** Intl.NumberFormat options, e.g. { style: 'currency', currency: 'USD' } */
		format?: Intl.NumberFormatOptions;
		locale?: string;
		/** Length of a roll in ms */
		duration?: number;
		/** Wait before the first count-in, in ms */
		delay?: number;
		class?: string;
	} = $props();

	const text = $derived(Number.isFinite(value) ? new Intl.NumberFormat(locale, format).format(value) : '–');
	const parts = $derived(split(text));
	let root: HTMLSpanElement;
	const rolls = new Map<string, Roll>();
	const stacks = new Map<string, HTMLElement>();
	let prev = 0;
	let up = true;
	let mounted = false;
	let seen = new Set<string>();
	let started = $state(false);
	// Columns that show up after the first render slide in (e.g. 9,999 → 10,000)
	const entering = $derived.by(() => {
		const now = new Set(parts.filter((p) => 'digit' in p).map((p) => p.key));
		const fresh = new Set([...now].filter((k) => mounted && !seen.has(k)));
		seen = now;
		return fresh;
	});
	function stack(el: HTMLElement, key: string) {
		stacks.set(key, el);
		place(el, rolls.get(key)?.pos ?? 0);
		return { destroy: () => stacks.get(key) === el && stacks.delete(key) };
	}
	onMount(() => {
		mounted = true;
		if (typeof IntersectionObserver === 'undefined') return void (started = true);
		let timer: ReturnType<typeof setTimeout>;
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return;
				io.disconnect();
				timer = setTimeout(() => (started = true), delay);
			},
			{ threshold: 0.3 }
		);
		io.observe(root);
		return () => {
			io.disconnect();
			clearTimeout(timer);
		};
	});
	// Roll every digit column to its new value
	$effect(() => {
		const ps = parts;
		const v = value;
		const dur = duration;
		if (!started) return;
		if (v !== prev) up = v > prev;
		prev = v;
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const keys = new Set<string>();
		for (const p of ps) {
			if (!('digit' in p)) continue;
			keys.add(p.key);
			const r = rolls.get(p.key) ?? { pos: 0, from: 0, to: 0 };
			const delta = up ? mod10(p.digit - r.pos) : -mod10(r.pos - p.digit);
			r.from = r.pos;
			r.to = r.pos + delta;
			if (reduce) r.pos = r.from = r.to;
			rolls.set(p.key, r);
		}
		for (const k of rolls.keys()) if (!keys.has(k)) rolls.delete(k);
		const apply = () => {
			for (const [k, r] of rolls) {
				const el = stacks.get(k);
				if (el) place(el, r.pos);
			}
		};
		if (reduce) return apply();
		let raf = 0;
		const t0 = performance.now();
		const tick = (now: number) => {
			const t = Math.min(1, (now - t0) / dur);
			const e = ease(t);
			for (const r of rolls.values()) r.pos = r.from + (r.to - r.from) * e;
			apply();
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<span bind:this={root} class={['ui-nt', cls]} aria-live="polite">
	<span class="ui-nt__sr">{text}</span>
	<span class="ui-nt__track" aria-hidden="true">
		{#each parts as p (p.key)}
			{#if 'digit' in p}
				<span class="ui-nt__col" data-enter={entering.has(p.key) || undefined}>
					<span class="ui-nt__stack" use:stack={p.key}>{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as n, i (i)}<span class="ui-nt__cell">{n}</span>{/each}</span>
				</span>
			{:else}
				<span class="ui-nt__static">{p.char}</span>
			{/if}
		{/each}
	</span>
</span>
