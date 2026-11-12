<!-- Text that changes without a jump: the old one fades out underneath while the new one fades in (Message Actions helper) -->
<script lang="ts">
	let { text, tick = false, class: cls }: { text: string; tick?: boolean; class?: string } = $props();
	// svelte-ignore state_referenced_locally
	let shown = $state(text);
	let out = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout>;
	$effect.pre(() => {
		if (text === shown) return;
		out = shown;
		shown = text;
		clearTimeout(timer);
		timer = setTimeout(() => (out = null), 300);
	});
</script>

<span class={['ui-mac__swap', cls]}>
	{#if out !== null}{#key out}<span class="ui-mac__swap-item" data-out="" aria-hidden="true">{out}</span>{/key}{/if}
	{#key shown}<span class="ui-mac__swap-item"
			>{#if tick}<svg viewBox="0 0 16 16" class="ui-mac__glyph" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" /></svg>{/if}{shown}</span
		>{/key}
</span>
