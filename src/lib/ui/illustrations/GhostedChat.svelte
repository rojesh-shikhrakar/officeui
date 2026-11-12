<!-- Ghosted Chat – ported from affectUI (MIT). Unanswered messages marked as read, with a thumbs-down reply on hover. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import './ghosted-chat.css';
	let {
		messages = ['Hi team!', 'Are you by any chance looking for a recruiter?', 'Hello?'],
		label = 'A chat with three unanswered messages marked as read',
		class: cls
	}: { messages?: string[]; label?: string; class?: string } = $props();
	const W = 360;
	let root: HTMLDivElement;
	let scale = $state(0);
	let play = $state(false);
	onMount(() => {
		// The messages arrive one by one once the scene scrolls into view
		const io = new IntersectionObserver(([e]) => e.isIntersecting && ((play = true), io.disconnect()), { threshold: 0.35 });
		io.observe(root);
		// Scale the artboard to the container width
		const fit = () => (scale = root.clientWidth / W);
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(root);
		return () => (io.disconnect(), ro.disconnect());
	});
</script>

<div bind:this={root} class={['ui-gc', cls]} role="img" aria-label={label}>
	<div class="ui-gc-stage" aria-hidden="true" data-play={play || undefined} style:transform="scale({scale})" style:visibility={scale > 0 ? 'visible' : 'hidden'}>
		<div class="ui-gc-content">
			<span class="ui-gc-status">No new messages</span>
			<div class="ui-gc-bubbles">
				{#each messages as m, i (i)}
					<div class={['ui-gc-bubble', i === messages.length - 1 && 'ui-gc-bubble-last']}>
						{#if i === messages.length - 1}<span class="ui-gc-alert">{m}</span>{:else}<span>{m}</span>{/if}
					</div>
				{/each}
				<span class="ui-gc-read">Read</span>
			</div>
			<div class="ui-gc-bubble ui-gc-reply"><span>👎</span></div>
		</div>
	</div>
</div>
