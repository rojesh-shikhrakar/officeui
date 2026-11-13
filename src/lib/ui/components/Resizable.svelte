<!-- Resizable – two panes with a draggable, keyboard-operable separator (arrows, Shift = bigger, Home/End, Enter/double-click reset). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './resizable.css';

	type Props = {
		first?: Snippet;
		second?: Snippet;
		orientation?: 'horizontal' | 'vertical';
		/** % bounds of the first pane */
		minSize?: number;
		maxSize?: number;
		defaultSize?: number;
		/** First pane size in % (bindable) */
		size?: number;
		height?: string;
		label?: string;
		class?: string;
	};
	let { first, second, orientation, minSize = 15, maxSize = 85, defaultSize = 50, size = $bindable(), height, label, class: cls }: Props = $props();
	const vert = $derived(orientation === 'vertical');
	let cur = $state<number>(); // uncontrolled fallback
	const sz = $derived(size ?? cur ?? defaultSize);
	let root: HTMLElement | undefined = $state();
	let drag = $state(false);
	const clamp = (v: number) => Math.max(minSize, Math.min(maxSize, v));
	function set(v: number) { size = cur = clamp(v); }
	function setFrom(e: PointerEvent) {
		const r = root!.getBoundingClientRect();
		set((vert ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width) * 100);
	}
	function onkeydown(e: KeyboardEvent) {
		const s = e.shiftKey ? 10 : 2, dec = vert ? 'ArrowUp' : 'ArrowLeft', inc = vert ? 'ArrowDown' : 'ArrowRight';
		if (e.key === dec) set(sz - s); else if (e.key === inc) set(sz + s); else if (e.key === 'Home') set(minSize); else if (e.key === 'End') set(maxSize); else if (e.key === 'Enter') set(defaultSize); else return;
		e.preventDefault();
	}
	const tpl = $derived(`${sz}% 9px minmax(0, 1fr)`);
</script>

<div bind:this={root} class={['ui-rsz', vert && 'ui-rsz--v', drag && 'is-drag', cls]} style:grid-template-rows={vert ? tpl : undefined} style:grid-template-columns={vert ? undefined : tpl} style:height>
	<div class="ui-rsz__pane">{@render first?.()}</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div role="separator" tabindex="0" aria-orientation={vert ? 'horizontal' : 'vertical'} aria-valuenow={Math.round(sz)} aria-valuemin={minSize} aria-valuemax={maxSize} aria-label={label ?? 'Resize panels'} class="ui-rsz__handle"
		onpointerdown={(e) => { drag = true; e.currentTarget.setPointerCapture(e.pointerId); setFrom(e); }}
		onpointermove={(e) => { if (drag) setFrom(e); }}
		onpointerup={(e) => { drag = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
		ondblclick={() => set(defaultSize)} {onkeydown}><span class="ui-rsz__grip" aria-hidden="true"></span></div>
	<div class="ui-rsz__pane">{@render second?.()}</div>
</div>
