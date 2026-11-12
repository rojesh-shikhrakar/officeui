<!-- Glass Folder – a glassy blue folder with documents behind a frosted pocket that tips open on hover or focus. -->
<script lang="ts">
	let { open = $bindable(false), label = 'Folder with documents', color = '#5ab4ec' }: { open?: boolean; label?: string; color?: string } = $props();
</script>

<button class="ui-gfd" data-open={open || undefined} style:--c={color} aria-label={label} aria-pressed={open} onclick={() => (open = !open)}>
	<span class="ui-gfd__back"></span>
	<span class="ui-gfd__doc" style:--r="-4deg" style:--x="-6%"></span>
	<span class="ui-gfd__doc" style:--r="3deg" style:--x="8%"></span>
	<span class="ui-gfd__doc" style:--r="0deg" style:--x="0%"></span>
	<span class="ui-gfd__front"></span>
</button>

<style>
	.ui-gfd {
		all: unset;
		position: relative;
		width: 224px;
		height: 186px;
		cursor: pointer;
		perspective: 600px;
	}
	.ui-gfd:focus-visible {
		outline: 2px solid var(--c);
		outline-offset: 8px;
		border-radius: 16px;
	}
	.ui-gfd__back {
		position: absolute;
		inset: 0;
		border-radius: 14px;
		background: linear-gradient(180deg, color-mix(in srgb, var(--c) 95%, white), color-mix(in srgb, var(--c) 85%, #1e5f99));
		clip-path: path('M0 14 Q0 0 14 0 H64 Q72 0 78 8 L84 15 H210 Q224 15 224 29 V172 Q224 186 210 186 H14 Q0 186 0 172 Z');
		box-shadow: 0 16px 30px -12px rgba(40, 110, 170, 0.45);
	}
	.ui-gfd__doc {
		position: absolute;
		left: 10%;
		right: 10%;
		top: 22px;
		height: 120px;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
		transform: translateX(var(--x)) rotate(var(--r));
		transition: transform 0.5s cubic-bezier(0.2, 0.85, 0.25, 1);
	}
	.ui-gfd[data-open] .ui-gfd__doc,
	.ui-gfd:hover .ui-gfd__doc {
		transform: translateX(var(--x)) translateY(-18px) rotate(calc(var(--r) * 2));
	}
	.ui-gfd__front {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 146px;
		border-radius: 14px;
		background: linear-gradient(180deg, color-mix(in srgb, var(--c) 40%, rgba(255, 255, 255, 0.7)), color-mix(in srgb, var(--c) 75%, transparent) 70%, color-mix(in srgb, var(--c) 90%, #1e5f99));
		backdrop-filter: blur(8px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.7),
			inset 0 0 0 1px rgba(255, 255, 255, 0.3);
		transform-origin: bottom center;
		transition: transform 0.5s cubic-bezier(0.2, 0.85, 0.25, 1);
	}
	.ui-gfd[data-open] .ui-gfd__front,
	.ui-gfd:hover .ui-gfd__front {
		transform: rotateX(-22deg);
	}
</style>
