<!-- TableOfContents – in-page anchor links with up to three levels; spy highlights the section in view. -->
<script lang="ts">
	import './table-of-contents.css';

	type Item = { id: string; label: string; level?: number };
	type Props = { items?: Item[]; activeId?: string; label?: string; /** false hides the heading */ title?: string | false; variant?: 'rail' | 'plain'; /** Track scrolling with IntersectionObserver */ spy?: boolean; class?: string; onselect?: (id: string) => void };
	let { items = [], activeId = $bindable(), label, title, variant = 'rail', spy = false, class: cls, onselect }: Props = $props();
	const active = $derived(activeId ?? items[0]?.id);

	$effect(() => {
		if (!spy || typeof IntersectionObserver === 'undefined') return;
		const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
		if (!els.length) return;
		const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activeId = e.target.id; }), { rootMargin: '0px 0px -70% 0px' });
		els.forEach((e) => io.observe(e));
		return () => io.disconnect();
	});
</script>

<nav aria-label={label || 'On this page'} class={['ui-toc', `ui-toc--${variant}`, cls]}>
	{#if title !== false}<p class="ui-toc__title">{title || 'On this page'}</p>{/if}
	<ol>
		{#each items as it (it.id)}
			<li class="ui-toc__l{it.level || 1}"><a href="#{it.id}" aria-current={it.id === active ? 'location' : undefined} class={it.id === active ? 'is-on' : ''} onclick={() => { activeId = it.id; onselect?.(it.id); }}>{it.label}</a></li>
		{/each}
	</ol>
</nav>
