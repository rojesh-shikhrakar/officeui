<!-- Region Map – A region map with fading neighbours and a pastel band travelling along the border; a pill menu morphs open to switch regions. -->
<script lang="ts" module>
	import { MAPS, type Region } from './region-maps';
	export type { Region };
	const OPTIONS: { value: Region; name: string; label: string }[] = [
		{ value: 'dach', name: 'DACH', label: 'Map of the DACH region: Germany, Austria and Switzerland' },
		{ value: 'us', name: 'United States', label: 'Map of the United States' },
		{ value: 'cn', name: 'China', label: 'Map of China' },
		{ value: 'in', name: 'India', label: 'Map of India' },
		{ value: 'br', name: 'Brazil', label: 'Map of Brazil' },
		{ value: 'jp', name: 'Japan', label: 'Map of Japan' }
	];
	type Phase = 'idle' | 'enter' | 'exit';
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import './region-dach.css';

	let {
		region = $bindable('dach'),
		onregionchange,
		showSwitcher = true,
		label,
		class: cls
	}: { region?: Region; onregionchange?: (r: Region) => void; /** The region menu in the top-left corner */ showSwitcher?: boolean; label?: string; class?: string } = $props();

	const _pid = $props.id();
	const id = 'ui-rd' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const option = $derived(OPTIONS.find((o) => o.value === region) ?? OPTIONS[0]);
	// The shown map plus any map that is still fading out
	// svelte-ignore state_referenced_locally
	let layers = $state<{ key: number; region: Region; phase: Phase }[]>([{ key: 0, region, phase: 'idle' }]);
	$effect.pre(() => {
		const r = region;
		const top = layers[layers.length - 1];
		if (top.region === r) return;
		layers = [...layers.map((l) => ({ ...l, phase: 'exit' as Phase })), { key: top.key + 1, region: r, phase: 'enter' }];
	});
	$effect(() => {
		if (!layers.some((l) => l.phase === 'exit')) return;
		const t = setTimeout(() => (layers = layers.filter((l) => l.phase !== 'exit')), 480);
		return () => clearTimeout(t);
	});
	let root: HTMLDivElement;
	let scale = $state(1);
	onMount(() => {
		const fit = () => (scale = Math.min(1, Math.max(0.62, root.clientWidth / 540)));
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(root);
		return () => ro.disconnect();
	});

	// Region menu: a pill that morphs open into a listbox
	let trigger = $state<HTMLButtonElement>();
	let panel = $state<HTMLDivElement>();
	const rows: HTMLDivElement[] = [];
	let open = $state(false);
	let active = $state(0);
	let from = $state({ w: 0, h: 0 });
	let fill = $state({ y: 0, h: 0, glide: false });
	let shown = $state(false);
	let wasShown = false;
	const selected = $derived(Math.max(0, OPTIONS.findIndex((o) => o.value === region)));
	$effect(() => {
		void [region, open];
		if (trigger) from = { w: trigger.offsetWidth, h: trigger.offsetHeight };
	});
	$effect(() => {
		if (open) tick().then(() => panel?.focus({ preventScroll: true }));
	});
	$effect(() => {
		void [active, open, shown];
		const row = rows[active];
		if (row) fill = { y: row.offsetTop, h: row.offsetHeight, glide: wasShown && shown };
		wasShown = shown;
	});
	function show() {
		active = selected;
		shown = false;
		open = true;
	}
	function close(refocus: boolean) {
		open = false;
		if (refocus) trigger?.focus();
	}
	function pick(i: number) {
		const next = OPTIONS[i].value;
		if (next !== region) onregionchange?.(next);
		region = next;
		close(true);
	}
	function keydown(e: KeyboardEvent) {
		const last = OPTIONS.length - 1;
		const moves: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last };
		if (e.key in moves) {
			e.preventDefault();
			active = moves[e.key];
			shown = true;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			pick(active);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			close(true);
		} else if (e.key === 'Tab') close(false);
	}
</script>

<svelte:document
	onpointerdown={(e) => {
		if (!open) return;
		const t = e.target as Node;
		if (panel?.contains(t) || trigger?.contains(t)) return;
		close(false);
	}}
/>

<div bind:this={root} class={['ui-rd', cls]} style:--ui-rd-s={scale}>
	<div class="ui-rd-map" role="img" aria-label={label ?? option.label}>
		<svg class="ui-rd-art" viewBox="0 0 540 440" aria-hidden="true">
			<defs>
				<filter id="{id}-shadow" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow class="ui-rd-drop" dx="0" dy="3" stdDeviation="3.5" flood-color="#1F2128" flood-opacity="0.07" /></filter>
				<linearGradient id="{id}-shine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="540" y2="220"><stop offset="0%" stop-color="#FFA0AB" /><stop offset="33%" stop-color="#FFB89E" /><stop offset="66%" stop-color="#C8A8E5" /><stop offset="100%" stop-color="#A8B5FF" /></linearGradient>
				<filter id="{id}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
			</defs>
			{#each layers as l (l.key)}
				{@const map = MAPS[l.region]}
				{@const lid = `${id}-${l.key}`}
				<g class="ui-rd-layer" data-phase={l.phase}>
					<defs>
						<mask id="{lid}-outside" maskUnits="userSpaceOnUse" x="0" y="0" width="540" height="440">
							<rect x="0" y="0" width="540" height="440" fill="#FFFFFF" />
							{#each map.land as d, i (i)}<path {d} fill="#000000" />{/each}
						</mask>
						<radialGradient id="{lid}-fade" cx={map.fade[0]} cy={map.fade[1]} r={map.fade[2]} gradientUnits="userSpaceOnUse">
							<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" /><stop offset="65%" stop-color="#FFFFFF" stop-opacity="0.6" /><stop offset="90%" stop-color="#FFFFFF" stop-opacity="0.18" /><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
						</radialGradient>
						<mask id="{lid}-neighbors" maskUnits="userSpaceOnUse" x="0" y="0" width="540" height="440"><rect x="0" y="0" width="540" height="440" fill="url(#{lid}-fade)" /></mask>
					</defs>
					<g mask="url(#{lid}-neighbors)" class="ui-rd-neighbors" fill="none" stroke="#A6ABB3" stroke-width="0.7" stroke-linejoin="round" stroke-linecap="round">
						{#each map.neighbors as d, i (i)}<path {d} />{/each}
					</g>
					<g class="ui-rd-land" filter="url(#{id}-shadow)" fill="#F8F8F8" stroke="#D6D9DE" stroke-width="0.9" stroke-linejoin="round">
						{#each map.land as d, i (i)}<path {d} />{/each}
					</g>
					<g fill="none" stroke="url(#{id}-shine)" stroke-linecap="round" stroke-linejoin="round">
						<path class="ui-rd-band" d={map.perimeter} pathLength="1000" stroke-width="6" stroke-dasharray="180 820" filter="url(#{id}-blur)" mask="url(#{lid}-outside)" opacity="0.45" />
						<path class="ui-rd-band" d={map.perimeter} pathLength="1000" stroke-width="1.4" stroke-dasharray="200 800" opacity="0.32" />
						<path class="ui-rd-band ui-rd-band--1" d={map.perimeter} pathLength="1000" stroke-width="1.4" stroke-dasharray="140 860" stroke-dashoffset="-30" opacity="0.55" />
						<path class="ui-rd-band ui-rd-band--2" d={map.perimeter} pathLength="1000" stroke-width="1.4" stroke-dasharray="80 920" stroke-dashoffset="-60" />
					</g>
				</g>
			{/each}
		</svg>
	</div>
	{#if showSwitcher}
		<div class="ui-rd-switch">
			<button
				bind:this={trigger}
				type="button"
				class="ui-rd-trigger"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls="{id}-list"
				aria-label="Region: {OPTIONS[selected].name}"
				onclick={() => (open ? close(false) : show())}
				onkeydown={(e) => {
					if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
						e.preventDefault();
						show();
					}
				}}
			>
				<span>{OPTIONS[selected].name}</span>
				<svg class="ui-rd-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"
					><path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" class="ui-rd-chevron-ink" stroke="#737373" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg
				>
			</button>
			<div class="ui-rd-menu" data-open={open} style:--from-w="{from.w}px" style:--from-h="{from.h}px" inert={!open}>
				<div bind:this={panel} id="{id}-list" class="ui-rd-panel" role="listbox" tabindex="-1" aria-label="Select a region" aria-activedescendant="{id}-{active}" onkeydown={keydown} onpointerleave={() => (shown = false)}>
					<span class="ui-rd-fill" aria-hidden="true" data-glide={fill.glide} style:transform="translateY({fill.y}px)" style:height="{fill.h}px" style:opacity={shown ? 1 : 0}></span>
					{#each OPTIONS as o, i (o.value)}
						<div
							bind:this={rows[i]}
							id="{id}-{i}"
							role="option"
							tabindex="-1"
							aria-selected={i === selected}
							class="ui-rd-option"
							onpointerenter={() => {
								active = i;
								shown = true;
							}}
							onclick={() => pick(i)}
							onkeydown={() => {}}
						>
							<span class="ui-rd-option-name">{o.name}</span>
							<span class="ui-rd-check" aria-hidden="true"
								><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 14L8.5 17.5L19 6.5" /></svg></span
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
