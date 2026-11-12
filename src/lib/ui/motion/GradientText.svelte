<!-- Gradient Text – letters cut from a flowing gradient; the colour sweeps across and settles. Use inline inside a heading. -->
<script lang="ts">
	let { text = 'feel.', colors = ['#db2777', '#a855f7', '#ec4899', '#7c3aed'], duration = 6, play = $bindable(0) }: { text?: string; colors?: string[]; duration?: number; play?: number } = $props();
</script>

{#key play}<span class="ui-gtx" style:--g="linear-gradient(90deg, {[...colors, colors[0]].join(', ')})" style:--d="{duration}s">{text}</span>{/key}

<style>
	.ui-gtx {
		background: var(--g);
		background-size: 300% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation:
			ui-gtx-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both,
			ui-gtx-flow var(--d) linear infinite;
	}
	@keyframes ui-gtx-in {
		from {
			opacity: 0;
			filter: blur(6px);
			background-position: 100% 0;
		}
	}
	@keyframes ui-gtx-flow {
		to {
			background-position: -300% 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ui-gtx {
			animation: none;
		}
	}
</style>
