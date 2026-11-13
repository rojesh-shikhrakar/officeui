<!-- TimeColumns – hour / minute / AM-PM listbox columns that edit the time of a Date. -->
<script lang="ts">
	import './time-columns.css';

	type Props = { value?: Date; hour12?: boolean; minuteStep?: number; onchange: (d: Date) => void; class?: string };
	let { value, hour12 = true, minuteStep = 5, onchange, class: cls }: Props = $props();
	const d = $derived(value ?? new Date());
	const hr = $derived(d.getHours());
	const pm = $derived(hr >= 12);
	const hours = $derived(Array.from({ length: hour12 ? 12 : 24 }, (_, i) => (hour12 ? (i === 0 ? 12 : i) : i)));
	const mins = $derived(Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep));
	const curH = $derived(hour12 ? (hr % 12 === 0 ? 12 : hr % 12) : hr);
	const curM = $derived(Math.floor(d.getMinutes() / minuteStep) * minuteStep);
	function setH(v: number) {
		const n = new Date(d);
		n.setHours(hour12 ? (v % 12) + (pm ? 12 : 0) : v);
		onchange(n);
	}
	function setM(v: number) {
		const n = new Date(d);
		n.setMinutes(v);
		onchange(n);
	}
	function setP(isPm: boolean) {
		const n = new Date(d);
		n.setHours((hr % 12) + (isPm ? 12 : 0));
		onchange(n);
	}
</script>

{#snippet col(label: string, items: number[], cur: number, fn: (v: number) => void, pad: boolean)}
	<div class="ui-tcol" role="listbox" aria-label={label}>
		{#each items as v (v)}
			<button type="button" role="option" aria-selected={v === cur ? 'true' : 'false'} class={['ui-tcol__cell', v === cur && 'is-on']} onclick={() => fn(v)}>{pad ? String(v).padStart(2, '0') : v}</button>
		{/each}
	</div>
{/snippet}
<div class={['ui-tcols', cls]}>
	{@render col('Hour', hours, curH, setH, !hour12)}
	{@render col('Minute', mins, curM, setM, true)}
	{#if hour12}
		<div class="ui-tcol ui-tcol--ampm" role="listbox" aria-label="AM or PM">
			{#each ['AM', 'PM'] as v (v)}
				{@const on = (v === 'PM') === pm}
				<button type="button" role="option" aria-selected={on ? 'true' : 'false'} class={['ui-tcol__cell', on && 'is-on']} onclick={() => setP(v === 'PM')}>{v}</button>
			{/each}
		</div>
	{/if}
</div>
