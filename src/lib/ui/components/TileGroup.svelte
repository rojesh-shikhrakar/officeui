<!-- TileGroup – A grid of Tiles: single (radiogroup, arrow keys) or multiple (checkbox group). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tile from './Tile.svelte';
	import './tile.css';

	type Opt = { value: string; title: string; description?: string; icon?: string | Snippet; meta?: string; disabled?: boolean };
	type Props = {
		type?: 'single' | 'multiple';
		options?: Opt[];
		/** string for single, string[] for multiple */
		value?: string | string[] | null;
		label?: string;
		hint?: string;
		columns?: number;
		class?: string;
		onchange?: (v: string | string[]) => void;
	};
	let { type = 'single', options: opts = [], value = $bindable(), label, hint, columns = 3, class: cls, onchange }: Props = $props();
	const multi = $derived(type === 'multiple');
	const lid = $props.id();
	let ref: HTMLElement | undefined = $state();
	function set(v: string | string[]) { value = v; onchange?.(v); }
	const arr = $derived((value as string[] | null | undefined) ?? []);
	const on = (o: Opt) => (multi ? arr.includes(o.value) : value === o.value);
	function toggle(o: Opt) {
		if (multi) set(arr.includes(o.value) ? arr.filter((x) => x !== o.value) : [...arr, o.value]);
		else set(o.value);
	}
	const firstOn = $derived(opts.find((o) => on(o) && !o.disabled) ?? opts.find((o) => !o.disabled));
	function key(e: KeyboardEvent, o: Opt) {
		if (multi) return;
		const en = opts.filter((x) => !x.disabled), i = en.indexOf(o);
		let j = -1;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % en.length;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + en.length) % en.length;
		if (j < 0) return;
		e.preventDefault();
		set(en[j].value);
		(ref?.querySelectorAll('[role=radio]:not([disabled])')[j] as HTMLElement | undefined)?.focus();
	}
</script>

<div class={['ui-tilegroup', cls]}>
	{#if label}<span class="ui-tilegroup__label" id={lid}>{label}</span>{/if}
	<div bind:this={ref} role={multi ? 'group' : 'radiogroup'} aria-labelledby={label ? lid : undefined} class="ui-tilegroup__grid" style:grid-template-columns="repeat({columns}, minmax(0, 1fr))">
		{#each opts as o (o.value)}
			<Tile type={multi ? 'checkbox' : 'radio'} value={o.value} title={o.title} description={o.description} icon={o.icon} meta={o.meta} disabled={o.disabled} selected={on(o)} tabindex={multi || o === firstOn ? 0 : -1} onclick={() => toggle(o)} onkeydown={(e) => key(e, o)} />
		{/each}
	</div>
	{#if hint}<span class="ui-tilegroup__hint">{hint}</span>{/if}
</div>
