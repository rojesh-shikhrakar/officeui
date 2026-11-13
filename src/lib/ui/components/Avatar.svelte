<!-- Avatar – A photo or initials in a circle (or rounded square). -->
<script lang="ts">
	import './avatar.css';

	type Props = { name?: string; src?: string; size?: 'sm' | 'md' | 'lg'; tone?: 'neutral' | 'brand' | 'accent'; shape?: 'square'; class?: string };
	let { name = '?', src, size = 'md', tone = 'neutral', shape, class: cls }: Props = $props();
	const initials = $derived(name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase());
</script>

<span class={['ui-avt', `ui-avt--${size}`, `ui-avt--${tone}`, shape === 'square' && 'ui-avt--square', cls]} role="img" aria-label={name}>{#if src}<img {src} alt="" />{:else}{initials}{/if}</span>
