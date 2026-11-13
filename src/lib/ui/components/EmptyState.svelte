<!-- EmptyState – A centered "nothing here yet" block with icon, text and actions. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './empty-state.css';
	type Props = { title: string; description?: string; icon?: Snippet | string; variant?: 'plain' | 'card' | 'dashed'; size?: 'sm' | 'md'; actions?: Snippet; children?: Snippet; class?: string };
	let { title, description, icon, variant = 'plain', size = 'md', actions, children, class: cls }: Props = $props();
</script>

<div class={['ui-emp', `ui-emp--${variant}`, size === 'sm' && 'ui-emp--sm', cls]}>
	{#if icon}<span class="ui-emp__icon">{#if typeof icon === 'string'}<Icon name={icon} size={22} />{:else}{@render icon()}{/if}</span>{/if}
	<h3 class="ui-emp__title">{title}</h3>
	{#if description}<p class="ui-emp__desc">{description}</p>{/if}
	{@render children?.()}
	{#if actions}<div class="ui-emp__act">{@render actions()}</div>{/if}
</div>
