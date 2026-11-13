<!-- Fab – floating action button: single action or a speed-dial of actions; extended (with label) or round. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './fab.css';

	type Action = { label: string; icon?: Snippet | string; onSelect?: () => void };
	type Props = {
		actions?: Action[];
		label?: string;
		/** Show the label next to the icon */
		extended?: boolean;
		variant?: 'primary' | 'secondary';
		size?: 'sm' | 'md' | 'lg';
		position?: 'bottom-right' | 'bottom-left';
		/** Pin to the viewport corner given by position */
		fixed?: boolean;
		disabled?: boolean;
		icon?: Snippet;
		onclick?: (e: MouseEvent) => void;
		'aria-label'?: string;
		class?: string;
	};
	let { actions = [], label, extended = false, variant = 'primary', size = 'md', position, fixed = false, disabled, icon, onclick, 'aria-label': ariaLabel, class: cls }: Props = $props();
	let open = $state(false);
	let root: HTMLElement | undefined = $state();
</script>

<svelte:document
	onmousedown={(e) => {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') open = false;
	}} />

<div bind:this={root} class={['ui-fab-wrap', position && `ui-fab-wrap--${position}`, fixed && 'is-fixed', cls]}>
	{#if actions.length > 0 && open}
		<ul class="ui-fab__actions" role="menu">
			{#each actions as a, i (i)}
				<li role="none" style:transition-delay="{i * 30}ms">
					<button type="button" role="menuitem" class="ui-fab__act" onclick={() => { a.onSelect?.(); open = false; }}>
						<span class="ui-fab__act-label">{a.label}</span>
						<span class="ui-fab__act-icon">{#if typeof a.icon === 'string'}<Icon name={a.icon} />{:else if a.icon}{@render a.icon()}{/if}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	<button
		type="button"
		aria-label={label && !extended ? label : ariaLabel}
		aria-haspopup={actions.length ? 'menu' : undefined}
		aria-expanded={actions.length ? (open ? 'true' : 'false') : undefined}
		{disabled}
		class={['ui-fab', `ui-fab--${variant}`, `ui-fab--${size}`, extended && 'ui-fab--ext', open && 'is-open']}
		onclick={(e) => {
			if (actions.length) open = !open;
			onclick?.(e);
		}}>
		<span class="ui-fab__icon">{#if icon}{@render icon()}{:else}<Icon name="plus" size={20} />{/if}</span>{#if extended}<span class="ui-fab__label">{label}</span>{/if}
	</button>
</div>
