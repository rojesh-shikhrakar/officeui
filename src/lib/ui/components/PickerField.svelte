<!-- PickerField – shared labelled trigger button + dropdown panel for DatePicker / TimePicker / Cascader. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import FieldBox from './FieldBox.svelte';
	import './picker-field.css';

	type Props = {
		label?: string;
		hint?: string;
		error?: string;
		/** Text shown in the trigger; placeholder when empty */
		text?: string;
		placeholder?: string;
		icon?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		defaultOpen?: boolean;
		role?: 'dialog' | 'tree' | 'menu' | 'listbox' | 'grid';
		panelClass?: string;
		width?: string;
		content: Snippet<[() => void]>;
		class?: string;
	};
	let { label, hint, error, text, placeholder, icon = 'calendar', size = 'md', disabled, defaultOpen = false, role = 'dialog', panelClass, width, content, class: cls }: Props = $props();
	const id = $props.id();
	// svelte-ignore state_referenced_locally
	let open = $state(defaultOpen);
	let wrap: HTMLElement | undefined = $state();
	const close = () => (open = false);
</script>

<svelte:document
	onmousedown={(e) => {
		if (open && wrap && !wrap.contains(e.target as Node)) open = false;
	}}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') {
			open = false;
			wrap?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
		}
	}} />

<FieldBox {id} {label} {hint} {error} class={cls}>
	<span bind:this={wrap} class="ui-pkr">
		<button
			type="button"
			{id}
			{disabled}
			aria-haspopup={role}
			aria-expanded={open ? 'true' : 'false'}
			aria-controls={open ? `${id}-p` : undefined}
			onclick={() => (open = !open)}
			class={['ui-pkr__trigger', `ui-pkr__trigger--${size}`, error && 'is-error']}
			aria-describedby={error || hint ? `${id}-n` : undefined}>
			<span class={['ui-pkr__text', !text && 'is-ph']}>{text || placeholder}</span><Icon name={icon} size={16} />
		</button>
		{#if open}
			<div id="{id}-p" {role} class={['ui-pkr__panel', panelClass]} style:width>{@render content(close)}</div>
		{/if}
	</span>
</FieldBox>
