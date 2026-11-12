<!-- Switch – ported from affectUI (MIT). A real checkbox with role="switch", label, second line, start or end placement. -->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './switch.css';

	type Props = Omit<HTMLInputAttributes, 'type' | 'size' | 'role'> & {
		/** Shown next to the switch; clicking it toggles */
		label?: string;
		/** A quiet second line under the label */
		description?: string;
		/** start: the switch before the text · end: after it, across the row */
		placement?: 'start' | 'end';
		/** sm 16 · md 20 high */
		size?: 'sm' | 'md';
	};
	let { label, description, placement = 'start', size = 'md', class: cls, id, disabled, checked = $bindable(false), 'aria-describedby': describedBy, ...rest }: Props = $props();
	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const descId = `${uid}-desc`;
</script>

<div class={['ui-swc', cls]} data-placement={placement === 'end' ? 'end' : 'start'} data-size={size === 'sm' ? 'sm' : 'md'} data-disabled={disabled || undefined}>
	<label class="ui-swc__row" for={inputId}>
		<span class="ui-swc__control">
			<input
				{...rest}
				bind:checked
				id={inputId}
				type="checkbox"
				role="switch"
				class="ui-swc__input"
				{disabled}
				aria-describedby={[describedBy, description ? descId : null].filter(Boolean).join(' ') || undefined}
			/>
			<span class="ui-swc__track" aria-hidden="true"><span class="ui-swc__thumb"></span></span>
		</span>
		{#if label != null || description != null}
			<span class="ui-swc__text">
				{#if label != null}<span class="ui-swc__label">{label}</span>{/if}
				{#if description != null}<span class="ui-swc__desc" id={descId}>{description}</span>{/if}
			</span>
		{/if}
	</label>
</div>
