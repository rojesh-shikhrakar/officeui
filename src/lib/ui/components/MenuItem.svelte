<!-- MenuItem – one row of a Menu (item, checkbox, radio or submenu trigger). Used by Menu. -->
<script lang="ts">
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';
	import Menu, { type MenuEntry } from './Menu.svelte';
	import './menu.css';
	import './popover.css';

	let { it, onpick, onclose }: { it: MenuEntry; onpick?: (it: MenuEntry) => void; onclose?: () => void } = $props();
	let sub = $state(false);
	let kb = $state(false);
	let btn: HTMLButtonElement | undefined = $state();
	const checkable = $derived(it.type === 'checkbox' || it.type === 'radio');
	const role = $derived(it.type === 'checkbox' ? 'menuitemcheckbox' : it.type === 'radio' ? 'menuitemradio' : 'menuitem');
</script>

{#snippet button()}
	<button
		bind:this={btn}
		type="button"
		{role}
		disabled={it.disabled}
		aria-checked={checkable ? (it.checked ? 'true' : 'false') : undefined}
		aria-haspopup={it.items ? 'menu' : undefined}
		aria-expanded={it.items ? (sub ? 'true' : 'false') : undefined}
		class={['ui-menu__item', it.danger && 'ui-menu__item--danger']}
		onclick={() => {
			if (it.items) {
				sub = true;
				return;
			}
			it.onSelect?.();
			onpick?.(it);
		}}
		onkeydown={(e) => {
			if (it.items && e.key === 'ArrowRight') {
				e.preventDefault();
				e.stopPropagation();
				kb = true;
				sub = true;
			}
		}}>
		<span class="ui-menu__lead">
			{#if checkable}
				{#if it.checked}<Icon name={it.type === 'radio' ? 'circle-check' : 'check'} size={14} />{/if}
			{:else if typeof it.icon === 'string'}
				<Icon name={it.icon} />
			{:else if it.icon}
				{@render it.icon()}
			{/if}
		</span>
		<span class="ui-menu__text">{it.label}{#if it.description}<span class="ui-menu__desc">{it.description}</span>{/if}</span>
		{#if it.shortcut}<span class="ui-menu__short">{it.shortcut}</span>{/if}
		{#if it.items}<Icon name="chevron-right" size={14} class="ui-menu__arrow" />{/if}
		{#if it.external}<Icon name="external" size={14} class="ui-menu__arrow" />{/if}
	</button>
{/snippet}

{#if !it.items}
	{@render button()}
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ui-menu__subwrap" onmouseenter={() => (sub = true)} onmouseleave={() => (sub = false)}>
		{@render button()}
		{#if sub}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="ui-pop__panel ui-menu__sub"
				onkeydown={(e) => {
					if (e.key === 'ArrowLeft') {
						e.preventDefault();
						e.stopPropagation();
						sub = false;
						tick().then(() => btn?.focus());
					}
				}}>
				<Menu items={it.items} autoFocus={kb} {onpick} {onclose} bare />
			</div>
		{/if}
	</div>
{/if}
