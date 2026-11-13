<!-- Breadcrumb – A trail of links ending in the current page. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import './breadcrumb.css';

	type Props = { items?: { label: string; href?: string; onclick?: (e: MouseEvent) => void }[]; class?: string };
	let { items = [], class: cls }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class={['ui-crumb', cls]}>
	<ol>
		{#each items as it, i (i)}
			<li>
				{#if i === items.length - 1}<span aria-current="page" class="ui-crumb__cur">{it.label}</span>
				{:else}<a href={it.href ?? '#'} onclick={it.onclick}>{it.label}</a><Icon name="chevron-right" size={12} class="ui-crumb__sep" />{/if}
			</li>
		{/each}
	</ol>
</nav>
