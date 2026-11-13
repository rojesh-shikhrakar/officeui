<!-- LaunchScreen – A splash: mark, title, tagline and a loading bar. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './launch-screen.css';

	type Props = { variant?: 'brand' | 'plain'; title?: string; tagline?: string; /** Accessible name (default "Loading <title>") */ label?: string; loading?: boolean; mark?: Snippet; footer?: string; class?: string };
	let { variant = 'brand', title, tagline, label, loading = true, mark, footer, class: cls }: Props = $props();
</script>

<div class={['ui-lnc', `ui-lnc--${variant}`, cls]} role="status" aria-label={label || 'Loading ' + (title || '')}>
	<div class="ui-lnc__core">
		<span class="ui-lnc__mark">
			{#if mark}{@render mark()}{:else}
				<svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true"><rect x="1" y="1" width="54" height="54" rx="14" stroke="currentColor" stroke-width="1.5" /><path d="M16 19h24M16 28h24M16 37h14" stroke="currentColor" stroke-width="2" stroke-linecap="square" /></svg>
			{/if}
		</span>
		{#if title}<p class="ui-lnc__title">{title}</p>{/if}
		<span class="ui-lnc__rule" aria-hidden="true"></span>
		{#if tagline}<p class="ui-lnc__tag">{tagline}</p>{/if}
	</div>
	{#if loading}<span class="ui-lnc__load" aria-hidden="true"><i></i></span>{/if}
	{#if footer}<p class="ui-lnc__foot">{footer}</p>{/if}
</div>
