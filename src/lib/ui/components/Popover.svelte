<!-- Popover – A trigger plus a floating panel; closes on outside click and Escape. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import './popover.css';

	type Props = {
		open?: boolean;
		/** ARIA role of the panel (also aria-haspopup on the trigger) */
		role?: string;
		placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
		width?: string;
		class?: string;
		panelClass?: string;
		/** Spread the given props onto the trigger element */
		trigger: Snippet<[Record<string, any>]>;
		children?: Snippet<[{ close: () => void }]>;
	};
	let { open = $bindable(false), role = 'dialog', placement = 'bottom-start', width, class: cls, panelClass, trigger, children }: Props = $props();
	const id = $props.id();
	let root: HTMLElement | undefined = $state();
	const close = () => (open = false);
	const triggerProps = $derived({ 'aria-haspopup': role, 'aria-expanded': open ? 'true' : 'false', 'aria-controls': open ? id : undefined, onclick: () => (open = !open) });
</script>

<svelte:document
	onmousedown={(e) => {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') {
			open = false;
			root?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
		}
	}} />

<span bind:this={root} class={['ui-pop', cls]}>
	{@render trigger(triggerProps)}
	{#if open}
		<div {id} role={role === 'menu' ? undefined : role} class={['ui-pop__panel', `ui-pop__panel--${placement}`, panelClass]} style:width>{@render children?.({ close })}</div>
	{/if}
</span>
