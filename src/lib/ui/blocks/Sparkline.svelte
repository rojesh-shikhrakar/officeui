<!-- Sparkline – a tiny trend line with an end dot, used by the dashboard blocks. -->
<script lang="ts">
	import { linePath, areaPath } from '../agents/chart';
	let { values, width = 60, height = 22, color = 'var(--ag-blue, #0070d6)', area = false, label }: { values: number[]; width?: number; height?: number; color?: string; area?: boolean; label?: string } = $props();
	const max = $derived(Math.max(...values) * 1.05);
	const last = $derived(height - 2 - (values[values.length - 1] / max) * (height - 4));
	const _pid = $props.id();
	const gid = 'sp' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
</script>

<svg viewBox="0 0 {width} {height}" width={width} height={height} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} style:overflow="visible">
	{#if area}<defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color={color} stop-opacity="0.18" /><stop offset="1" stop-color={color} stop-opacity="0" /></linearGradient></defs><path d={areaPath(values, width, height, max)} fill="url(#{gid})" />{/if}
	<path d={linePath(values, width, height, max)} fill="none" stroke={color} stroke-width="1.3" vector-effect="non-scaling-stroke" />
	{#if !area}<circle cx={width} cy={last} r="2" fill="var(--ag-surface, #fff)" stroke={color} stroke-width="1.2" />{/if}
</svg>
