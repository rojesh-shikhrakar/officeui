<!-- Lead Sourcing – A centre tile linked to two app tiles, with a shine running along the connection. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { mark, OWN_MARK, type Mark } from '../utils/marks';
	import './lead-sourcing.css';

	let {
		left = mark(3),
		right = mark(1),
		center = OWN_MARK,
		label = 'A product tile connected to two app tiles, surrounded by empty tiles',
		class: cls
	}: { left?: Mark; right?: Mark; /** Path (24×24) for the middle tile */ center?: string; label?: string; class?: string } = $props();

	const _pid = $props.id();
	const id = 'ui-ls' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const TILES = [
		['tl', 67, 27, 117, 77],
		['tr', 203, 27, 203, 77],
		['bl', 67, 163, 117, 163],
		['br', 203, 163, 203, 163]
	] as const;
	// SVG <animate> ignores CSS media queries, so reduced motion is read here
	let reducedMotion = $state(false);
	onMount(() => {
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reducedMotion = media.matches);
		sync();
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	});
</script>

{#snippet tile(x: number, y: number, size = 50, rx = 10)}
	<rect {x} {y} width={size} height={size} {rx} class="ui-ls-tile" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="0.5" filter="url(#{id}-tile)" />
{/snippet}

<div class={['ui-ls', cls]} role="img" aria-label={label}>
	<svg class="ui-ls-art" viewBox="0 0 320 240" aria-hidden="true">
		<defs>
			<filter id="{id}-tile" x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="dropBlur" />
				<feOffset in="dropBlur" dx="0" dy="3" result="dropOffset" />
				<feFlood class="ui-ls-drop" flood-color="#000000" flood-opacity="0.06" result="dropColor" />
				<feComposite in="dropColor" in2="dropOffset" operator="in" result="dropShadow" />
				<feOffset in="SourceAlpha" dx="0" dy="-4" result="alphaUp" />
				<feComposite in="SourceAlpha" in2="alphaUp" operator="out" result="bottomSliver" />
				<feFlood class="ui-ls-sliver" flood-color="#EAECEF" flood-opacity="1" result="innerColor" />
				<feComposite in="innerColor" in2="bottomSliver" operator="in" result="innerShadow" />
				<feMerge><feMergeNode in="dropShadow" /><feMergeNode in="SourceGraphic" /><feMergeNode in="innerShadow" /></feMerge>
			</filter>
			<filter id="{id}-blur" x="-100%" y="-300%" width="300%" height="700%"><feGaussianBlur stdDeviation="10" /></filter>
			<linearGradient id="{id}-blob" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#FFA0AB" stop-opacity="0.6" /><stop offset="33%" stop-color="#FFB89E" stop-opacity="0.6" /><stop offset="66%" stop-color="#C8A8E5" stop-opacity="0.6" /><stop offset="100%" stop-color="#A8B5FF" stop-opacity="0.6" />
			</linearGradient>
			<linearGradient id="{id}-edge" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop class="ui-ls-gray" offset="0%" stop-color="#E4E7EC" /><stop offset="18%" stop-color="#FFB5BC" /><stop offset="40%" stop-color="#FFC5AB" /><stop offset="60%" stop-color="#D5BBEF" /><stop offset="82%" stop-color="#B5C0FF" /><stop class="ui-ls-gray" offset="100%" stop-color="#E4E7EC" />
			</linearGradient>
			<linearGradient id="{id}-shine" gradientUnits="userSpaceOnUse" x1="-195" y1="120" x2="195" y2="120">
				<stop class="ui-ls-gray" offset="0%" stop-color="#E4E7EC" /><stop class="ui-ls-gray" offset="43%" stop-color="#E4E7EC" /><stop offset="46%" stop-color="#FF6B5C" /><stop offset="48%" stop-color="#FFB89E" /><stop offset="50%" stop-color="#C8A8E5" /><stop offset="52%" stop-color="#A8B5FF" /><stop class="ui-ls-gray" offset="56%" stop-color="#E4E7EC" /><stop class="ui-ls-gray" offset="100%" stop-color="#E4E7EC" />
				{#if !reducedMotion}
					<animate attributeName="x1" values="-195;125;125" keyTimes="0;0.3;1" dur="3.6s" repeatCount="indefinite" />
					<animate attributeName="x2" values="195;515;515" keyTimes="0;0.3;1" dur="3.6s" repeatCount="indefinite" />
				{/if}
			</linearGradient>
			{#each TILES as [corner, x, y, ix, iy] (corner)}
				<radialGradient id="{id}-fade-{corner}" gradientUnits="userSpaceOnUse" cx={ix} cy={iy} r="78"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="38%" stop-color="#FFFFFF" /><stop offset="100%" stop-color="#000000" /></radialGradient>
				<mask id="{id}-mask-{corner}" maskUnits="userSpaceOnUse" x={x - 16} y={y - 16} width="82" height="88"><rect x={x - 16} y={y - 16} width="82" height="88" fill="url(#{id}-fade-{corner})" /></mask>
			{/each}
			<linearGradient id="{id}-ends" gradientUnits="userSpaceOnUse" x1="25" y1="120" x2="295" y2="120"><stop offset="0%" stop-color="#000000" /><stop offset="22%" stop-color="#FFFFFF" /><stop offset="78%" stop-color="#FFFFFF" /><stop offset="100%" stop-color="#000000" /></linearGradient>
			<mask id="{id}-ends-mask" maskUnits="userSpaceOnUse" x="20" y="115" width="280" height="10"><rect x="20" y="115" width="280" height="10" fill="url(#{id}-ends)" /></mask>
		</defs>
		<ellipse cx="160" cy="152" rx="22" ry="8" fill="url(#{id}-blob)" filter="url(#{id}-blur)" />
		<line x1="25" y1="120" x2="295" y2="120" stroke="url(#{id}-shine)" stroke-width="1.5" mask="url(#{id}-ends-mask)" />
		{@render tile(45, 95)}
		<svg x="58" y="108" width="24" height="24" viewBox="0 0 24 24"><path fill={left.color} d={left.d} /></svg>
		{@render tile(225, 95)}
		<svg x="238" y="108" width="24" height="24" viewBox="0 0 24 24"><path class="ui-ls-mark" fill={right.color} d={right.d} /></svg>
		{#each TILES as [corner, x, y] (corner)}<g mask="url(#{id}-mask-{corner})">{@render tile(x, y)}</g>{/each}
		{@render tile(128, 88, 64, 14)}
		<path d="M128 138 A 14 14 0 0 0 142 152 L178 152 A 14 14 0 0 0 192 138" fill="none" stroke="url(#{id}-edge)" stroke-width="0.5" />
		<svg x="146" y="106" width="28" height="28" viewBox="0 0 24 24" overflow="visible"><path class="ui-ls-mark" fill="#171717" d={center} /></svg>
	</svg>
</div>
