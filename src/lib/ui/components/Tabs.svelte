<!-- Tabs – an ARIA tab list with a sliding ink, underline or segmented look, arrow-key navigation and a panel per tab. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick, untrack } from 'svelte';
	import './tabs.css';

	type Tab = { id: string; label: string; count?: number | string; content?: Snippet };
	type Props = { tabs?: Tab[]; /** Id of the selected tab (default: the first) */ active?: string; variant?: 'underline' | 'segmented'; onchange?: (id: string) => void; class?: string };
	let { tabs = [], active = $bindable(), variant, onchange, class: cls }: Props = $props();
	const uid = $props.id();
	const cur = $derived(active ?? tabs[0]?.id);
	const curTab = $derived(tabs.find((t) => t.id === cur));
	let pos = $state({ x: 0, w: 0, ready: false });

	function measure(ready: boolean) {
		const el = document.getElementById(`${uid}-t-${cur}`);
		if (el) pos = { x: el.offsetLeft, w: el.offsetWidth, ready };
	}
	function select(id: string) { active = id; onchange?.(id); }
	$effect(() => {
		cur; // track
		untrack(() => measure(pos.ready));
		const t = requestAnimationFrame(() => measure(true));
		const onR = () => measure(true);
		window.addEventListener('resize', onR);
		return () => { cancelAnimationFrame(t); window.removeEventListener('resize', onR); };
	});
	async function onkey(e: KeyboardEvent) {
		const i = tabs.findIndex((t) => t.id === cur);
		let n = -1;
		if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
		else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
		else if (e.key === 'Home') n = 0;
		else if (e.key === 'End') n = tabs.length - 1;
		if (n < 0) return;
		e.preventDefault();
		select(tabs[n].id);
		await tick();
		document.getElementById(`${uid}-t-${tabs[n].id}`)?.focus();
	}
</script>

<div class={['ui-tabs', variant === 'segmented' && 'ui-tabs--segmented', cls]}>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div class="ui-tabs__list" role="tablist" onkeydown={onkey}>
		<span class={['ui-tabs__ink', pos.ready && 'ui-tabs__ink--ready']} aria-hidden="true" style="transform: translateX({pos.x}px); width: {pos.w}px"></span>
		{#each tabs as t (t.id)}
			<button id="{uid}-t-{t.id}" role="tab" type="button" class="ui-tabs__tab" aria-selected={t.id === cur ? 'true' : 'false'} aria-controls="{uid}-p" tabindex={t.id === cur ? 0 : -1} onclick={() => select(t.id)}>{t.label}{#if t.count != null}<span class="ui-tabs__count">{t.count}</span>{/if}</button>
		{/each}
	</div>
	{#key cur}
		<div class="ui-tabs__panel" role="tabpanel" id="{uid}-p" aria-labelledby="{uid}-t-{cur}">{@render curTab?.content?.()}</div>
	{/key}
</div>
