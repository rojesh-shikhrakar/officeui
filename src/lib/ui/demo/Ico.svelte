<script lang="ts">
	type IconName = 'trash' | 'plus' | 'arrow' | 'dots' | 'copy' | 'upload' | 'settings' | 'search';

	type Props = {
		name: IconName;
		size?: number;
	};

	let { name, size = 18 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'trash'}
		<path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'arrow'}
		<path d="M5 12h14m-7-7 7 7-7 7" />
	{:else if name === 'dots'}
		<circle cx="5" cy="12" r="1" />
		<circle cx="12" cy="12" r="1" />
		<circle cx="19" cy="12" r="1" />
	{:else if name === 'copy'}
		<rect x="8" y="8" width="13" height="13" rx="2" />
		<path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
	{:else if name === 'upload'}
		<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" />
	{:else if name === 'settings'}
		<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
		<path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3H3.8a1.8 1.8 0 1 1 0-3.6H4a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 1 1 3.6 0V2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" />
	{:else}
		<circle cx="10.8" cy="10.8" r="6.8" />
		<path d="m16 16 4.5 4.5" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		flex: none;
	}
</style>
