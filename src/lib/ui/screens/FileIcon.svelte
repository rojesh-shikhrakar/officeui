<!-- File Icon – a page with a coloured type tag (PDF, DOC, XLS), used by the folder screens. -->
<script lang="ts">
	let { kind = 'DOC', size = 40 }: { kind?: 'PDF' | 'DOC' | 'XLS' | string; size?: number } = $props();
	const color = $derived(({ PDF: '#ef4444', DOC: '#3b82f6', XLS: '#10b981' } as Record<string, string>)[kind] ?? '#737373');
</script>

<span class="ui-fic" style:--s="{size}px" style:--c={color} aria-hidden="true"><i></i><i></i><i></i><b>{kind}</b></span>

<style>
	.ui-fic {
		position: relative;
		width: calc(var(--s) * 0.8);
		height: var(--s);
		border-radius: 4px;
		background: #fff;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.08),
			0 2px 4px rgba(0, 0, 0, 0.06);
		display: grid;
		align-content: start;
		gap: calc(var(--s) * 0.06);
		padding: calc(var(--s) * 0.18) calc(var(--s) * 0.14);
		box-sizing: border-box;
	}
	i {
		height: 2px;
		background: #e8e8e8;
		border-radius: 1px;
	}
	b {
		position: absolute;
		left: calc(var(--s) * -0.08);
		bottom: calc(var(--s) * 0.16);
		font-size: calc(var(--s) * 0.16);
		line-height: 1;
		padding: 2px 3px;
		border-radius: 2px;
		background: var(--c);
		color: #fff;
		font-weight: 600;
	}
</style>
