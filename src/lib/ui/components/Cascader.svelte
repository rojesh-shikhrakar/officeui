<!-- Cascader – labelled field that opens multi-column panel to pick a path through a tree of options. -->
<script module lang="ts">
	export type CascaderOption = { value: string | number; label: string; disabled?: boolean; children?: CascaderOption[] };
</script>

<script lang="ts">
	import PickerField from './PickerField.svelte';
	import CascaderPanel from './CascaderPanel.svelte';

	type Path = (string | number)[];
	type Props = {
		options?: CascaderOption[];
		/** The chosen path of values, root first */
		value?: Path;
		label?: string;
		hint?: string;
		error?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		defaultOpen?: boolean;
		expandTrigger?: 'click' | 'hover';
		onchange?: (v: Path) => void;
		class?: string;
	};
	let { options = [], value = $bindable([]), label, hint, error, placeholder, size, disabled, defaultOpen, expandTrigger, onchange, class: cls }: Props = $props();
	const labels = $derived.by(() => {
		let lv = options;
		const out: string[] = [];
		for (const v of value ?? []) {
			const n = lv.find((o) => o.value === v);
			if (!n) break;
			out.push(n.label);
			lv = n.children || [];
		}
		return out;
	});
</script>

<PickerField {label} {hint} {error} {size} {disabled} {defaultOpen} class={cls} role="tree" icon="chevron-down" width="auto" text={labels.join(' / ')} placeholder={placeholder || 'Select'}>
	{#snippet content(close)}
		<CascaderPanel {options} value={value ?? []} {expandTrigger} onselect={(p) => { value = p; onchange?.(p); close(); }} />
	{/snippet}
</PickerField>
