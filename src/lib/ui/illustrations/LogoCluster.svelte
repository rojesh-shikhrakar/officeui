<!-- Logo Cluster – Your mark on a white disc with app logos bouncing out around it. -->
<script lang="ts" module>
	/** One bubble: mark, offset from the middle and diameter – in a 320 × 320 frame */
	export type ClusterSlot = { color: string; d: string; x: number; y: number; size: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { mark, OWN_MARK } from '../utils/marks';
	import './logo-cluster.css';
	const POS: [number, number, number][] = [
		[-29, -97, 56],
		[82, -67, 48],
		[96, -14, 72],
		[53, 86, 60],
		[-63, 70, 42],
		[-88, 64, 20],
		[-93, -1, 72]
	];
	let {
		slots = POS.map(([x, y, size], i) => ({ ...mark(i), x, y, size })),
		center = OWN_MARK,
		label = 'Your mark with app logos bouncing out around it',
		class: cls
	}: { slots?: ClusterSlot[]; /** Path (24×24) for the middle disc */ center?: string; label?: string; class?: string } = $props();

	let root: HTMLDivElement;
	let shown = $state(false);
	onMount(() => {
		if (typeof IntersectionObserver === 'undefined') return void (shown = true);
		// Plays the entrance once; the turning ring pauses whenever the cluster is off screen
		const io = new IntersectionObserver(
			([e]) => {
				root.toggleAttribute('data-paused', !e.isIntersecting);
				if (e.isIntersecting) shown = true;
			},
			{ threshold: 0.35 }
		);
		io.observe(root);
		return () => io.disconnect();
	});
</script>

<div bind:this={root} class={['ui-lc', cls]} data-shown={shown || undefined} role="img" aria-label={label}>
	<div class="ui-lc-frame" aria-hidden="true">
		<div class="ui-lc-orbit">
			{#each slots as s, i (i)}
				<span class="ui-lc-bubble" style:--x={s.x} style:--y={s.y} style:--s={s.size} style:--delay="{0.18 + i * 0.045}s" style:color={s.color === 'currentColor' ? undefined : s.color}>
					<span class="ui-lc-face"><svg viewBox="0 0 24 24"><path d={s.d} fill="currentColor" /></svg></span>
				</span>
			{/each}
		</div>
		<span class="ui-lc-mid"><svg viewBox="0 0 24 24"><path d={center} fill="currentColor" /></svg></span>
	</div>
</div>
