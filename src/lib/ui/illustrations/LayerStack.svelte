<!-- Layer Stack – An isometric stack of five layers with a list beside it; the chosen layer lifts off. -->
<script lang="ts" module>
	export type LayerIcon = 'bolt' | 'database' | 'plug' | 'spark' | 'pulse';
	export type LayerStackItem = { title: string; hint?: string; icon?: LayerIcon };
	const SIZE = 104;
	const STEP = 26;
	const GAP = 34;
	const ABOVE = 24;
	const THICK = 9;
	const CX = 168;
	const TOP = 109;
	const ICONS: Record<LayerIcon, string> = {
		bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
		database: 'M5 6a7 3 0 1 0 14 0 7 3 0 1 0-14 0M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
		plug: 'M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8ZM12 16.5V21',
		spark: 'M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7ZM18.5 15.5c.2 1.5.8 2.1 2.3 2.3-1.5.2-2.1.8-2.3 2.3-.2-1.5-.8-2.1-2.3-2.3 1.5-.2 2.1-.8 2.3-2.3Z',
		pulse: 'M3 12h4l2.5-6 5 12 2.5-6h4'
	};
</script>

<script lang="ts">
	import './layer-stack.css';
	let {
		items = [
			{ title: 'Triggered by events', hint: 'Webhooks', icon: 'bolt' },
			{ title: 'Grounded in your data', hint: 'Context', icon: 'database' },
			{ title: 'Connected to your apps', hint: 'APIs', icon: 'plug' },
			{ title: 'Works with any model', hint: 'Routing', icon: 'spark' },
			{ title: 'Traced at every step', hint: 'Logs', icon: 'pulse' }
		],
		defaultIndex = 0,
		interval = 2600,
		onchange,
		class: cls
	}: { /** Up to five entries, top layer first */ items?: LayerStackItem[]; defaultIndex?: number; /** ms per entry while it plays */ interval?: number; onchange?: (index: number) => void; class?: string } = $props();

	const _pid = $props.id();
	const id = 'ui-lyr' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const list = $derived(items.slice(0, 5));
	// svelte-ignore state_referenced_locally
	let active = $state(Math.min(defaultIndex, items.length - 1));
	let paused = $state(false);
	let touched = $state(false);
	// Step through the entries on its own until someone interacts; never with reduced motion
	$effect(() => {
		if (paused || touched || list.length < 2) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const n = list.length;
		const t = setInterval(() => (active = (active + 1) % n), interval);
		return () => clearInterval(t);
	});
	function pick(i: number) {
		touched = true;
		active = i;
		onchange?.(i);
	}
	const last = $derived(list.length - 1);
	const yOf = (i: number) => TOP + i * STEP - (i < active ? GAP + ABOVE : i === active && active < last ? GAP : 0);
	const order = $derived(list.map((item, i) => ({ item, i })).reverse());
</script>

<div class={['ui-lyr', cls]} role="presentation" onmouseenter={() => (paused = true)} onmouseleave={() => (paused = false)} onfocusin={() => (paused = true)} onfocusout={() => (paused = false)}>
	<svg class="ui-lyr-stack" viewBox="0 0 600 400" aria-hidden="true">
		<defs><filter id="{id}-glow" x="-60%" y="-120%" width="220%" height="340%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		{#each order as { item, i } (i)}
			<g class="ui-lyr-layer" data-active={i === active ? '' : undefined} data-above={i < active ? '' : undefined} style:transform="translate({CX}px, {yOf(i)}px)">
				<ellipse class="ui-lyr-glow" cx="0" cy={SIZE / 2 + THICK + 18} rx="70" ry="24" filter="url(#{id}-glow)" />
				<g transform="translate(0 {THICK}) matrix(1 0.5 -1 0.5 0 0)">
					<rect class="ui-lyr-side" width={SIZE} height={SIZE} rx="9" /><rect class="ui-lyr-side-on" width={SIZE} height={SIZE} rx="9" />
				</g>
				<g transform="matrix(1 0.5 -1 0.5 0 0)">
					<rect class="ui-lyr-face" width={SIZE} height={SIZE} rx="9" /><rect class="ui-lyr-face-on" width={SIZE} height={SIZE} rx="9" />
					<g class="ui-lyr-icon" transform="translate({SIZE / 2 - 18} {SIZE / 2 - 18}) scale(1.5)"><path d={ICONS[item.icon ?? 'bolt']} /></g>
				</g>
			</g>
		{/each}
	</svg>
	<div class="ui-lyr-menu" role="tablist" aria-label="Layers" aria-orientation="vertical">
		<span class="ui-lyr-pill" aria-hidden="true" style:transform="translateY(calc({active} * var(--ui-lyr-row)))"></span>
		{#each list as item, i (i)}
			<button
				type="button"
				role="tab"
				aria-selected={i === active}
				tabindex={i === active ? 0 : -1}
				class="ui-lyr-row"
				onclick={() => pick(i)}
				onkeydown={(e) => {
					const next = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : null;
					if (next === null) return;
					e.preventDefault();
					const n = (next + list.length) % list.length;
					pick(n);
					(e.currentTarget.parentElement?.children[n + 1] as HTMLElement | undefined)?.focus();
				}}
			>
				<span class="ui-lyr-title">{item.title}</span>
				{#if item.hint}<span class="ui-lyr-hint">{item.hint}</span>{/if}
			</button>
		{/each}
	</div>
</div>
