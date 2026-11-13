<!-- RadioGroup – A fieldset of native radios with labels and descriptions, vertical or in a row. -->
<script lang="ts">
	import './radio-group.css';

	type Option = { value: string; label: string; description?: string; disabled?: boolean };
	type Props = {
		options?: Option[];
		value?: string;
		legend?: string;
		orientation?: 'horizontal' | 'vertical';
		disabled?: boolean;
		onchange?: (v: string) => void;
		class?: string;
	};
	let { options = [], value = $bindable(), legend, orientation = 'vertical', disabled = false, onchange, class: cls }: Props = $props();
	const name = $props.id();
</script>

<fieldset class={['ui-rdg', orientation === 'horizontal' && 'ui-rdg--row', cls]} {disabled}>
	{#if legend}<legend class="ui-rdg__legend">{legend}</legend>{/if}
	{#each options as o (o.value)}
		{@const id = `${name}-${o.value}`}
		<div class="ui-rdg__item">
			<input class="ui-rdg__input" type="radio" {id} {name} value={o.value} checked={value === o.value} disabled={o.disabled} aria-describedby={o.description ? `${id}-d` : undefined} onchange={() => { value = o.value; onchange?.(o.value); }} />
			<label class="ui-rdg__label" for={id}>
				<span class="ui-rdg__text">{o.label}</span>
				{#if o.description}<span class="ui-rdg__desc" id="{id}-d">{o.description}</span>{/if}
			</label>
		</div>
	{/each}
</fieldset>
