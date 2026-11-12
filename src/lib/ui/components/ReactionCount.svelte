<!-- The count glides to its new width; each changed digit rolls in from below -->
<script lang="ts">
	let { text }: { text: string } = $props();
	let outer: HTMLSpanElement;
	let inner: HTMLSpanElement;
	let first = true;
	$effect.pre(() => {
		void text;
		queueMicrotask(() => {
			if (!outer || !inner) return;
			outer.style.width = `${inner.offsetWidth}px`;
			if (first) {
				first = false;
				requestAnimationFrame(() => outer.setAttribute('data-smooth', ''));
			}
		});
	});
</script>

<span class="ui-rbc__count" bind:this={outer} aria-hidden="true">
	<span class="ui-rbc__digits" bind:this={inner}>
		{#each text.split('') as d, i (`${text.length - i}-${d}`)}<span class="ui-rbc__digit">{d}</span>{/each}
	</span>
</span>
