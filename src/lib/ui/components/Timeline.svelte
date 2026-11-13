<!-- Timeline – A vertical event list with tone-coded marks, time, description and meta. -->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	export type TimelineItem = { title: string; time?: string; description?: string; tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent'; current?: boolean; icon?: Snippet | string; meta?: Snippet | string };
</script>

<script lang="ts">
	import './timeline.css';
	let { items = [], compact = false, class: cls }: { items?: TimelineItem[]; compact?: boolean; class?: string } = $props();
</script>

<ol class={['ui-tl', compact && 'ui-tl--compact', cls]}>
	{#each items as it, i (i)}
		<li class={['ui-tl__item', `ui-tl__item--${it.tone || 'neutral'}`, it.current && 'is-current']}>
			<span class="ui-tl__mark" aria-hidden="true">{#if typeof it.icon === 'function'}{@render it.icon()}{:else}{it.icon ?? ''}{/if}</span>
			<div class="ui-tl__body">
				<div class="ui-tl__head"><b class="ui-tl__title">{it.title}</b>{#if it.time}<time class="ui-tl__time">{it.time}</time>{/if}</div>
				{#if it.description}<p class="ui-tl__desc">{it.description}</p>{/if}
				{#if it.meta}<div class="ui-tl__meta">{#if typeof it.meta === 'function'}{@render it.meta()}{:else}{it.meta}{/if}</div>{/if}
			</div>
		</li>
	{/each}
</ol>
