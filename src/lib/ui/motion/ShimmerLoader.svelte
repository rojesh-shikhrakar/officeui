<!-- Shimmer Loader – a loading card built from Skeleton and ShimmerText (-->
<script lang="ts">
	import Skeleton from './Skeleton.svelte';
	import ShimmerText from './ShimmerText.svelte';
	let { label = 'Generating your report…', lines = 3 }: { label?: string; lines?: number } = $props();
</script>

<div class="ui-shm-demo" aria-busy="true">
	<div class="ui-shm-demo__head">
		<Skeleton width={36} circle />
		<div class="ui-shm-demo__who"><Skeleton width="45%" height={12} /><Skeleton width="30%" height={10} /></div>
	</div>
	{#each { length: lines } as _, i (i)}<Skeleton width={i === lines - 1 ? '60%' : '100%'} height={12} />{/each}
	<ShimmerText text={label} />
</div>

<style>
	.ui-shm-demo {
		width: 320px;
		max-width: 100%;
		display: grid;
		gap: 10px;
		padding: 16px;
		border-radius: var(--aui-radius-lg, 14px);
		background: var(--aui-surface, #fff);
		box-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05));
		font: 13px/1.4 var(--aui-font, Inter, ui-sans-serif, system-ui, sans-serif);
	}
	.ui-shm-demo__head {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-bottom: 4px;
	}
	.ui-shm-demo__who {
		flex: 1;
		display: grid;
		gap: 6px;
	}
	:global(:where(.dark, [data-theme='dark'])) .ui-shm-demo {
		background: var(--aui-surface, #1c1c1e);
	}
</style>
