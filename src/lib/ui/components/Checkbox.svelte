<!-- Checkbox – label, second line, indeterminate, error and a card variant. -->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './checkbox.css';

	type Props = Omit<HTMLInputAttributes, 'type' | 'size'> & {
		/** Shown next to the box; clicking it toggles */
		label?: string;
		/** A quiet second line under the label */
		description?: string;
		/** "Some of them" – a dash instead of the check */
		indeterminate?: boolean;
		/** Marks it invalid and shows this under it */
		error?: string;
		/** plain: the box and its text · card: a bordered row clickable as a whole */
		variant?: 'plain' | 'card';
	};
	let {
		label,
		description,
		indeterminate = $bindable(false),
		error,
		variant = 'plain',
		class: cls,
		id,
		disabled,
		checked = $bindable(false),
		'aria-describedby': describedBy,
		...rest
	}: Props = $props();
	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const descId = `${uid}-desc`;
	const errorId = `${uid}-error`;
</script>

<div class={['ui-chkc', cls]} data-variant={variant === 'card' ? 'card' : 'plain'} data-invalid={error ? true : undefined} data-disabled={disabled || undefined}>
	<label class="ui-chkc__row" for={inputId}>
		<span class="ui-chkc__control">
			<input
				{...rest}
				bind:checked
				bind:indeterminate
				id={inputId}
				type="checkbox"
				class="ui-chkc__input"
				{disabled}
				aria-invalid={error ? true : undefined}
				aria-describedby={[describedBy, description ? descId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
				data-indeterminate={indeterminate || undefined}
			/>
			<span class="ui-chkc__box" aria-hidden="true">
				<svg class="ui-chkc__mark" viewBox="0 0 16 16" width="16" height="16">
					<path class="ui-chkc__tick" d="M4 8.5 6.75 11.25 12 5" pathLength="1" />
					<path class="ui-chkc__dash" d="M4.5 8h7" pathLength="1" />
				</svg>
			</span>
		</span>
		{#if label != null || description != null}
			<span class="ui-chkc__text">
				{#if label != null}<span class="ui-chkc__label">{label}</span>{/if}
				{#if description != null}<span class="ui-chkc__desc" id={descId}>{description}</span>{/if}
			</span>
		{/if}
	</label>
	{#if error}<p class="ui-chkc__error" id={errorId} aria-live="polite">{error}</p>{/if}
</div>
