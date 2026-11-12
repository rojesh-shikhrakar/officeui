<!-- Integration Grid – ported from affectUI (MIT). A honeycomb-like wall of integration tiles around a bright centre tile, fading to the edges. -->
<script lang="ts" module>
	export type IntegrationGridLogo = { name: string; /** One path on a 24×24 viewBox */ path: string; color?: string; darkColor?: string };
	const STEP = 160;
	const MID_Y = 280;
	const widthFor = (columns: number) => columns * STEP + 80;
	function slotsFor(columns: number) {
		const midX = widthFor(columns) / 2;
		return [columns - 2, columns, columns - 2].flatMap((count, row) =>
			Array.from({ length: count }, (_, i) => {
				const x = midX + (i - (count - 1) / 2) * STEP;
				const y = MID_Y + (row - 1) * STEP;
				return { x, y, center: row === 1 && i === (count - 1) / 2, d: Math.hypot((x - midX) / STEP, (y - MID_Y) / STEP) };
			})
		);
	}
	const PETAL = 'M24 24C17.6 19.6 16.4 9.4 24 3.5C31.6 9.4 30.4 19.6 24 24Z';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MARKS } from './marks';
	import './integration-grid.css';

	let {
		logos = MARKS.map((m) => ({ name: m.name, path: m.d, color: m.color === '#171717' ? undefined : m.color })),
		mark,
		columns = 9,
		label,
		class: cls
	}: {
		/** Up to 22 logos, filled row by row around the centre tile; they repeat if fewer */
		logos?: IntegrationGridLogo[];
		/** Content of the centre tile – defaults to a neutral product mark */
		mark?: Snippet;
		/** Tiles in the middle row; rows above and below get two fewer */
		columns?: 5 | 7 | 9;
		label?: string;
		class?: string;
	} = $props();

	const slots = $derived(slotsFor(columns));
	const outer = $derived(slots.filter((s) => !s.center).length);
	const tiles = $derived.by(() => {
		let n = 0;
		return slots.map((s) => (s.center ? { ...s, logo: null } : { ...s, logo: logos[n++ % logos.length] }));
	});
</script>

<div class={['ui-ig', cls]} style:--ui-ig-w={columns === 9 ? undefined : widthFor(columns)} role="img" aria-label={label ?? `Integrates with ${logos.slice(0, outer).map((l) => l.name).join(', ')}`}>
	{#each tiles as s, i (i)}
		{#if s.center}
			<span class="ui-ig-tile ui-ig-tile--center" style:--x={s.x} style:--y={s.y} aria-hidden="true">
				{#if mark}{@render mark()}{:else}
					<svg class="ui-ig-mark" viewBox="0 0 48 48" aria-hidden="true">
						<g class="ui-ig-mark-soft">{#each [45, 135, 225, 315] as r (r)}<path d={PETAL} transform="rotate({r} 24 24)" />{/each}</g>
						{#each [0, 90, 180, 270] as r (r)}<path d={PETAL} transform="rotate({r} 24 24)" />{/each}
						<circle class="ui-ig-mark-core" cx="24" cy="24" r="3.4" />
					</svg>
				{/if}
			</span>
		{:else if s.logo}
			<span
				class="ui-ig-tile"
				style:--x={s.x}
				style:--y={s.y}
				style:--ui-ig-a={Math.max(0.22, 0.64 - 0.095 * s.d).toFixed(3)}
				style:--ui-ig-k={Math.max(0.35, 1 - 0.16 * s.d).toFixed(3)}
				style:--ui-ig-c={s.logo.color}
				style:--ui-ig-cd={s.logo.darkColor}
				aria-hidden="true"
			>
				<svg class="ui-ig-logo" viewBox="0 0 24 24" aria-hidden="true"><path d={s.logo.path} /></svg>
			</span>
		{/if}
	{/each}
</div>
