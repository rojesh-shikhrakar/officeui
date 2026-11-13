<!-- Mark – a small neutral app or model logo (geometric placeholder), by index into the shared marks. -->
<script lang="ts">
	import { mark } from '../utils/marks';
	let { i = 0, size = 13, label }: { i?: number; size?: number; label?: string } = $props();
	const m = $derived(mark(i));
</script>

<svg class="ui-ag-mark" viewBox="0 0 24 24" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}><path d={m.d} fill={m.color} fill-rule="evenodd" /></svg>

<style>
	.ui-ag-mark {
		flex: none;
		display: inline-block;
		vertical-align: middle;
	}
</style>
