<!-- ContextMenu – right-click anywhere in the area to open a Menu at the pointer; bind `position` to control it. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Menu, { type MenuEntry } from './Menu.svelte';
	import './menu.css';
	import './popover.css';

	type Props = {
		items?: MenuEntry[];
		/** Where the menu is open (viewport px), or null when closed */
		position?: { x: number; y: number } | null;
		onselect?: (it: MenuEntry) => void;
		class?: string;
		children?: Snippet;
	};
	let { items = [], position = $bindable(null), onselect, class: cls, children }: Props = $props();
	let el: HTMLElement | undefined = $state();
	const initial = position; // a preset position skips autofocus
	// Keep the menu inside the viewport
	$effect(() => {
		if (!position || !el) return;
		const r = el.getBoundingClientRect();
		let { x, y } = position;
		if (x + r.width > window.innerWidth - 8) x = window.innerWidth - r.width - 8;
		if (y + r.height > window.innerHeight - 8) y = window.innerHeight - r.height - 8;
		if (x !== position.x || y !== position.y) position = { x: Math.max(8, x), y: Math.max(8, y) };
	});
	$effect(() => {
		if (!position) return;
		const d = (e: MouseEvent) => {
			if (el && !el.contains(e.target as Node)) position = null;
		};
		const k = (e: KeyboardEvent) => {
			if (e.key === 'Escape') position = null;
		};
		const c = () => (position = null);
		document.addEventListener('mousedown', d);
		document.addEventListener('keydown', k);
		window.addEventListener('scroll', c, true);
		window.addEventListener('resize', c);
		return () => {
			document.removeEventListener('mousedown', d);
			document.removeEventListener('keydown', k);
			window.removeEventListener('scroll', c, true);
			window.removeEventListener('resize', c);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={['ui-ctx', cls]}
	oncontextmenu={(e) => {
		e.preventDefault();
		position = { x: e.clientX, y: e.clientY };
	}}>
	{@render children?.()}
	{#if position}
		<div bind:this={el} class="ui-pop__panel ui-pop__panel--menu ui-ctx__panel" style:left="{position.x}px" style:top="{position.y}px">
			<Menu
				{items}
				autoFocus={!initial}
				bare
				onclose={() => (position = null)}
				onpick={(it) => {
					onselect?.(it);
					position = null;
				}} />
		</div>
	{/if}
</div>
