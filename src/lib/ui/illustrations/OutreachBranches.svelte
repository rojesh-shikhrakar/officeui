<!-- Outreach Branches – lines branch out from one point to three app tiles with coloured pulses flowing down them; hover a tile to light its branch. -->
<script lang="ts">
	import { mark, type Mark } from '../utils/marks';
	let { apps = [mark(9), mark(3), mark(11)] as Mark[] }: { apps?: Mark[] } = $props();
	let hot = $state(1);
	const xs = [60, 180, 300];
	const colors = ['#ff6a6a', '#a78bfa', '#60a5fa'];
</script>

<div class="ui-obr">
	<svg viewBox="0 0 360 200" aria-hidden="true">
		{#each xs as x, i (i)}
			{@const d = `M180,10 C180,${i === 1 ? 60 : 50} ${x},60 ${x},${i === 1 ? 120 : 130}`}
			<path {d} class="ui-obr__line" />
			<path {d} class="ui-obr__pulse" style:stroke={colors[i]} style:animation-delay="{i * 0.6}s" data-hot={hot === i || undefined} pathLength="100" />
		{/each}
	</svg>
	<div class="ui-obr__tiles">
		{#each apps as a, i (i)}
			<button class="ui-obr__tile" data-hot={hot === i || undefined} style:--g={colors[i]} aria-label={a.name} onpointerenter={() => (hot = i)} onfocus={() => (hot = i)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={a.d} fill={a.color} fill-rule="evenodd" /></svg></button>
		{/each}
	</div>
</div>

<style>
	.ui-obr {
		position: relative;
		width: 360px;
		height: 230px;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.ui-obr > svg {
		position: absolute;
		inset: 0;
	}
	.ui-obr__line {
		fill: none;
		stroke: #e6e6e6;
		stroke-width: 1.5;
	}
	.ui-obr__pulse {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-dasharray: 12 88;
		opacity: 0.6;
		animation: ui-obr-flow 1.8s linear infinite;
	}
	.ui-obr__pulse[data-hot] {
		opacity: 1;
		stroke-width: 2.5;
	}
	@keyframes ui-obr-flow {
		from {
			stroke-dashoffset: 100;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	.ui-obr__tiles {
		position: absolute;
		left: 0;
		right: 0;
		top: 116px;
		display: flex;
		justify-content: space-between;
		padding: 0 16px;
		align-items: center;
	}
	.ui-obr__tile {
		width: 88px;
		height: 82px;
		border: 0;
		border-radius: 14px;
		background: #fff;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.05),
			0 4px 10px -4px rgba(0, 0, 0, 0.1);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition:
			transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 0.3s;
	}
	.ui-obr__tile svg {
		width: 40px;
	}
	.ui-obr__tile[data-hot] {
		transform: translateY(-8px) scale(1.08);
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.05),
			0 18px 26px -12px var(--g);
	}
</style>
