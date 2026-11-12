<!-- Text Reveal – ported from affectUI (MIT). Words or letters blur and rise into place when the text enters the view. -->
<script lang="ts" module>
	const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
	const graphemes = (s: string) => (segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : Array.from(s));
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import './text-reveal.css';

	let {
		text = 'Agents first, the rest of your app too',
		by = 'word',
		stagger = 40,
		delay = 0,
		duration = 700,
		as = 'p',
		once = true,
		class: cls
	}: {
		text?: string;
		/** Reveal word by word or letter by letter */
		by?: 'word' | 'char';
		/** Time between two pieces, in ms */
		stagger?: number;
		/** Wait before the first piece, in ms */
		delay?: number;
		/** Time each piece takes to arrive, in ms */
		duration?: number;
		as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
		/** Reveal only the first time; otherwise it plays each time it enters the view */
		once?: boolean;
		class?: string;
	} = $props();

	let el = $state<HTMLElement>();
	let shown = $state(false);
	onMount(() => {
		if (!el || typeof IntersectionObserver === 'undefined') return void (shown = true);
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						shown = true;
						if (once) io.disconnect();
					} else if (!once) shown = false;
				}
			},
			{ threshold: 0 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
	// Words and the whitespace between them; whitespace stays plain text so lines wrap normally
	const parts = $derived.by(() => {
		let i = 0;
		return text
			.split(/(\s+)/)
			.filter((p) => p !== '')
			.map((p) => (/^\s+$/.test(p) ? { space: p } : by === 'word' ? { word: p, i: i++ } : { chars: graphemes(p).map((ch) => ({ ch, i: i++ })) }));
	});
</script>

<svelte:element
	this={as}
	bind:this={el}
	class={['ui-trv', cls]}
	data-shown={shown ? '' : undefined}
	style:--ui-trv-stagger="{stagger}ms"
	style:--ui-trv-delay="{delay}ms"
	style:--ui-trv-duration="{duration}ms"
>
	<span class="ui-trv__sr">{text}</span>
	<span aria-hidden="true"
		>{#each parts as p, k (k)}{#if 'space' in p}{p.space}{:else if 'word' in p}<span class="ui-trv__p" style:--ui-trv-i={p.i}>{p.word}</span>{:else}<span class="ui-trv__w"
					>{#each p.chars as c, j (j)}<span class="ui-trv__p" style:--ui-trv-i={c.i}>{c.ch}</span>{/each}</span
				>{/if}{/each}</span
	>
</svelte:element>
