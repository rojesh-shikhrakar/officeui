<!-- Thinking Loader – ported from affectUI (MIT). A small working pill that walks through phases and finishes with a check. -->
<script lang="ts" module>
	const DEFAULT_PHASES = ['Thinking', 'Searching the web', 'Reading sources', 'Writing response'];
	const RAYS = Array.from({ length: 8 }, (_, i) => i);
	const took = (s: number) => {
		if (s < 60) return `${s}s`;
		const m = Math.floor(s / 60);
		if (m < 60) return `${m}m ${s % 60}s`;
		const h = Math.floor(m / 60);
		return h < 24 ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${Math.floor(h / 24)}d ${h % 24}h`;
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import './thinking-loader.css';

	let {
		phases: phasesProp = DEFAULT_PHASES,
		interval: intervalProp = 2200,
		phase,
		loop = false,
		done = false,
		doneLabel = (s: number) => `Thought for ${took(s)}`,
		size = 'md',
		variant = 'pill',
		class: cls
	}: {
		/** Labels to walk through, one after another */
		phases?: string[];
		/** Time per phase, in ms */
		interval?: number;
		/** Show a specific phase instead of advancing on a timer */
		phase?: number;
		/** Start over after the last phase instead of holding it */
		loop?: boolean;
		/** Finished: the spinner turns into a check and the label into doneLabel */
		done?: boolean;
		/** Label once done – a string, or a function of the seconds since start */
		doneLabel?: string | ((seconds: number) => string);
		size?: 'sm' | 'md';
		/** pill = bordered capsule, plain = just the spinner and label */
		variant?: 'pill' | 'plain';
		class?: string;
	} = $props();

	const phases = $derived(phasesProp?.length ? phasesProp.map(String) : DEFAULT_PHASES.slice(0, 1));
	const interval = $derived(Number.isFinite(intervalProp) && intervalProp > 0 ? Math.max(intervalProp, 200) : 2200);
	let step = $state(0);
	let started = Date.now();
	let seconds = $state<number | null>(null);

	// Freeze the clock when done; restart it when work starts again
	$effect.pre(() => {
		if (done && seconds === null) seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
		if (!done && seconds !== null) {
			seconds = null;
			started = Date.now();
			step = 0;
		}
	});
	$effect(() => {
		if (done || (phase !== undefined && Number.isFinite(phase)) || phases.length < 2) return;
		const n = phases.length;
		const id = setInterval(() => (step = step + 1 < n ? step + 1 : loop ? 0 : step), interval);
		return () => clearInterval(id);
	});

	const index = $derived(Math.min(Math.max(phase !== undefined && Number.isFinite(phase) ? Math.floor(phase) : step, 0), Math.max(phases.length - 1, 0)));
	const label = $derived(String(done ? (typeof doneLabel === 'function' ? doneLabel(seconds ?? 1) : doneLabel) : phases[index]));

	// The label on screen and the one rolling out
	// svelte-ignore state_referenced_locally
	let shown = $state({ key: 0, text: label });
	let leaving = $state<{ key: number; text: string } | null>(null);
	$effect.pre(() => {
		if (label !== shown.text) {
			leaving = shown;
			shown = { key: shown.key + 1, text: label };
		}
	});

	let root: HTMLSpanElement;
	let box: HTMLSpanElement;
	let current = $state<HTMLSpanElement>();
	let measured = false;
	// Width of the label, capped by the room next to the spinner – a label that doesn't fit ends in "…"
	function fit() {
		const c = current;
		if (!root || !box || !c) return;
		const full = c.scrollWidth + 1;
		const parent = root.parentElement;
		const was = { width: box.style.width, transition: box.style.transition };
		box.style.transition = 'none';
		box.style.width = `${full}px`;
		const pad = parent ? getComputedStyle(parent) : null;
		const inner = parent && pad ? parent.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight) : 0;
		const room = parent ? Math.floor(inner - (root.offsetWidth - box.offsetWidth)) : full;
		box.style.width = was.width;
		box.getBoundingClientRect();
		box.style.transition = was.transition;
		const cut = room > 0 && full > room;
		root.toggleAttribute('data-cut', cut);
		box.style.width = `${cut ? room : full}px`;
	}
	$effect(() => {
		void shown.key;
		tick().then(() => {
			if (!box) return;
			if (!measured) box.style.transition = 'none';
			fit();
			if (!measured) {
				box.getBoundingClientRect();
				box.style.transition = '';
				measured = true;
			}
		});
	});
	onMount(() => {
		const parent = root.parentElement;
		if (!parent || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(() => fit());
		ro.observe(parent);
		return () => ro.disconnect();
	});
</script>

<span bind:this={root} class={['ui-tlc', cls]} data-size={size} data-variant={variant} data-done={done || undefined} role="status" aria-live="polite">
	<span class="ui-tlc__icon" aria-hidden="true">
		<svg class="ui-tlc__spinner" viewBox="0 0 16 16">
			{#each RAYS as i (i)}<line x1="8" y1="1.75" x2="8" y2="4.75" transform="rotate({i * 45} 8 8)" style:animation-delay="{(i - 8) * 100}ms" />{/each}
		</svg>
		<svg class="ui-tlc__check" viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength="1" /></svg>
	</span>
	<span bind:this={box} class="ui-tlc__text">
		{#if leaving}
			{#key leaving.key}
				<span class="ui-tlc__label ui-tlc__label--out" aria-hidden="true" dir="auto" onanimationend={() => (leaving = null)}>{leaving.text}</span>
			{/key}
		{/if}
		{#key shown.key}
			<span
				bind:this={current}
				class={['ui-tlc__label', shown.key > 0 && 'ui-tlc__label--in', !done && 'ui-tlc__shine']}
				data-text={shown.text}
				title={shown.text}
				dir="auto">{shown.text}</span
			>
		{/key}
	</span>
</span>
