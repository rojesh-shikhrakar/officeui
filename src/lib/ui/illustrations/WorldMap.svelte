<!-- World Map Continental – a world map with one highlighted continent and a pastel band running along its coast; pick the continent from the menu. -->
<script lang="ts">
	import { WORLD, type Continent } from './world-map';
	let { continent = $bindable<Continent>('Europe'), showSwitcher = true }: { continent?: Continent; showSwitcher?: boolean } = $props();
	const names = Object.keys(WORLD) as Continent[];
	const _pid = $props.id();
	const id = 'ui-wm' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
</script>

<div class="ui-wmap">
	{#if showSwitcher}
		<label class="ui-wmap__pick"><span class="ui-wmap__sr">Continent</span><select bind:value={continent}>{#each names as n (n)}<option value={n}>{n}</option>{/each}</select></label>
	{/if}
	<svg viewBox="0 0 1000 500" role="img" aria-label="World map highlighting {continent}">
		<defs>
			<linearGradient id="{id}-g" x1="0" x2="1"><stop offset="0" stop-color="#ffa0ab" /><stop offset="0.5" stop-color="#c8a8e5" /><stop offset="1" stop-color="#a8b5ff" /></linearGradient>
		</defs>
		{#each names as n (n)}<path d={WORLD[n]} class="ui-wmap__land" data-on={n === continent || undefined} />{/each}
		{#key continent}<path d={WORLD[continent]} class="ui-wmap__band" stroke="url(#{id}-g)" pathLength="1000" />{/key}
	</svg>
</div>

<style>
	.ui-wmap {
		position: relative;
		width: 680px;
		max-width: 100%;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
	}
	svg {
		width: 100%;
		display: block;
	}
	.ui-wmap__land {
		fill: #ececec;
		stroke: #fafafa;
		stroke-width: 0.5;
		transition: fill 0.4s;
	}
	.ui-wmap__land[data-on] {
		fill: #e2e2e2;
	}
	.ui-wmap__band {
		fill: none;
		stroke-width: 1.4;
		stroke-linejoin: round;
		stroke-dasharray: 1000;
		animation: ui-wmap-draw 1.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes ui-wmap-draw {
		from {
			stroke-dashoffset: 1000;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	.ui-wmap__pick {
		position: absolute;
		left: 0;
		top: 4%;
		z-index: 1;
	}
	.ui-wmap__pick select {
		font: inherit;
		font-size: 13px;
		padding: 5px 10px;
		border: 0;
		border-radius: 999px;
		background: #fff;
		color: #171717;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.08),
			0 1px 2px rgba(0, 0, 0, 0.06);
	}
	.ui-wmap__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-wmap__land {
		fill: #2a2a2a;
		stroke: #1a1a1a;
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-wmap__land[data-on] {
		fill: #3a3a3a;
	}
</style>
