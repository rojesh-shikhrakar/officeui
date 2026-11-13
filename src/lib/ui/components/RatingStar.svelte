<!-- RatingStar – the star glyph used by Rating (outline, or filled with currentColor). -->
<script lang="ts">
	let { size, fill = false }: { size: number; fill?: boolean } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style="display: block"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
