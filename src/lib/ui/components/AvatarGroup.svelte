<!-- AvatarGroup – overlapping Avatars with a "+N" overflow chip. -->
<script lang="ts">
	import Avatar from './Avatar.svelte';
	import './avatar.css';

	type Person = { name?: string; src?: string; tone?: 'neutral' | 'brand' | 'accent'; shape?: 'square' };
	let { people = [], max = 4, size = 'md' }: { people?: Person[]; max?: number; size?: 'sm' | 'md' | 'lg' } = $props();
	const shown = $derived(people.slice(0, max));
	const extra = $derived(people.length - shown.length);
</script>

<span class="ui-avts">
	{#each shown as a, i (i)}<Avatar {size} {...a} />{/each}
	{#if extra > 0}<span class="ui-avt ui-avt--{size} ui-avt--neutral" role="img" aria-label="{extra} more">+{extra}</span>{/if}
</span>
