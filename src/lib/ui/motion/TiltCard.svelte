<!-- Tilt Card – tilts in 3D towards the pointer with a glare that follows it, and springs back when the pointer leaves. Default content is a member card. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { max = 12, glare = true, name = 'Alex Morgan', since = '10/26', last4 = '4821', brand = 'OfficeUI', tier = 'Pro', children }: { max?: number; glare?: boolean; name?: string; since?: string; last4?: string; brand?: string; tier?: string; children?: Snippet } = $props();
	let rx = $state(0),
		ry = $state(0),
		gx = $state(50),
		gy = $state(50),
		active = $state(false);
	function move(e: PointerEvent) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
			y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
		ry = (x - 0.5) * 2 * max;
		rx = -(y - 0.5) * 2 * max;
		gx = x * 100;
		gy = y * 100;
		active = true;
	}
	const leave = () => ((rx = ry = 0), (active = false));
</script>

<div class="ui-tlt" role="presentation" onpointermove={move} onpointerleave={leave}>
	<div class="ui-tlt__card" data-active={active || undefined} style:transform="rotateX({rx}deg) rotateY({ry}deg) scale({active ? 1.02 : 1})">
		{#if children}{@render children()}{:else}
			<div class="ui-tlt__row"><b>{brand} <span>{tier}</span></b><span aria-hidden="true">)))</span></div>
			<span class="ui-tlt__chip" aria-hidden="true"></span>
			<div class="ui-tlt__num">•••• •••• •••• {last4}</div>
			<div class="ui-tlt__row ui-tlt__meta"><span><small>Member</small>{name}</span><span><small>Since</small>{since}</span><i></i></div>
		{/if}
		{#if glare}<span class="ui-tlt__glare" style:background="radial-gradient(circle at {gx}% {gy}%, rgba(255,255,255,0.35), transparent 55%)" style:opacity={active ? 1 : 0}></span>{/if}
	</div>
</div>

<style>
	.ui-tlt {
		perspective: 900px;
		display: inline-block;
	}
	.ui-tlt__card {
		position: relative;
		width: 340px;
		aspect-ratio: 1.6;
		box-sizing: border-box;
		padding: 22px 24px;
		border-radius: 18px;
		color: #fff;
		background: linear-gradient(135deg, #3b5bff 0%, #4f5bff 45%, #7c4dff 100%);
		box-shadow:
			0 20px 40px -18px rgba(59, 91, 255, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
		transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
		transform-style: preserve-3d;
		overflow: hidden;
	}
	.ui-tlt__card[data-active] {
		transition: transform 0.08s linear;
	}
	.ui-tlt__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.ui-tlt__row b {
		font-weight: 500;
		font-size: 15px;
	}
	.ui-tlt__row b span {
		opacity: 0.7;
	}
	.ui-tlt__chip {
		width: 40px;
		height: 30px;
		border-radius: 6px;
		background:
			linear-gradient(90deg, transparent 32%, rgba(0, 0, 0, 0.18) 33% 35%, transparent 36% 64%, rgba(0, 0, 0, 0.18) 65% 67%, transparent 68%),
			linear-gradient(0deg, transparent 45%, rgba(0, 0, 0, 0.18) 46% 54%, transparent 55%),
			linear-gradient(135deg, #f6d27a, #d4a546);
	}
	.ui-tlt__num {
		font-size: 17px;
		letter-spacing: 0.12em;
		font-weight: 500;
	}
	.ui-tlt__meta {
		justify-content: flex-start;
		gap: 28px;
		font-size: 13px;
	}
	.ui-tlt__meta span {
		display: grid;
		gap: 2px;
	}
	.ui-tlt__meta small {
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.65;
	}
	.ui-tlt__glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition: opacity 0.3s;
		mix-blend-mode: overlay;
	}
</style>
