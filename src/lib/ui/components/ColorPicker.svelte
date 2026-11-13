<!-- ColorPicker – saturation/brightness area, hue slider, hex field and swatches; inline or in a popover. -->
<script lang="ts" module>
	type HSV = { h: number; s: number; v: number };
	function hsv2hex(hh: number, s: number, v: number) {
		const c = v * s,
			x = c * (1 - Math.abs(((hh / 60) % 2) - 1)),
			m = v - c;
		let r = 0,
			g = 0,
			b = 0;
		if (hh < 60) (r = c), (g = x);
		else if (hh < 120) (r = x), (g = c);
		else if (hh < 180) (g = c), (b = x);
		else if (hh < 240) (g = x), (b = c);
		else if (hh < 300) (r = x), (b = c);
		else (r = c), (b = x);
		return '#' + [r, g, b].map((k) => Math.round((k + m) * 255).toString(16).padStart(2, '0')).join('');
	}
	function hex2hsv(hex: string): HSV | null {
		const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
		if (!m) return null;
		const n = parseInt(m[1], 16),
			r = (n >> 16) / 255,
			g = ((n >> 8) & 255) / 255,
			b = (n & 255) / 255;
		const mx = Math.max(r, g, b),
			mn = Math.min(r, g, b),
			d = mx - mn;
		let hh = 0;
		if (d) {
			hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
			hh *= 60;
			if (hh < 0) hh += 360;
		}
		return { h: hh, s: mx ? d / mx : 0, v: mx };
	}
	function lum(hex: string) {
		const n = parseInt(hex.slice(1), 16),
			f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
		return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
	}
	const SWATCHES = ['#111827', '#6b7280', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f3f4f6'];
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import Popover from './Popover.svelte';
	import './color-picker.css';

	type Props = { value?: string; swatches?: string[]; label?: string; /** Render the panel in place (default) or behind a trigger button */ inline?: boolean; class?: string; onchange?: (hex: string) => void };
	let { value = $bindable('#3b82f6'), swatches: sw = SWATCHES, label, inline = true, class: cls, onchange }: Props = $props();
	const id = $props.id();
	const val = $derived(value.toLowerCase());
	// svelte-ignore state_referenced_locally
	let hsv: HSV = $state(hex2hsv(value.toLowerCase()) ?? { h: 0, s: 0, v: 0 });
	let text: string | null = $state(null);
	let area: HTMLElement | undefined = $state();

	// sync from external value changes
	$effect(() => {
		const n = hex2hsv(val);
		if (n && hsv2hex(hsv.h, hsv.s, hsv.v) !== val) hsv = { h: n.s === 0 ? hsv.h : n.h, s: n.s, v: n.v };
	});
	function emit(n: HSV) {
		hsv = n;
		value = hsv2hex(n.h, n.s, n.v);
		onchange?.(value);
	}
	function setHex(hx: string) {
		const n = hex2hsv(hx);
		if (!n) return;
		value = hx.toLowerCase();
		hsv = { h: n.s === 0 ? hsv.h : n.h, s: n.s, v: n.v };
		onchange?.(value);
	}
	function fromPtr(e: PointerEvent) {
		if (!area) return;
		const r = area.getBoundingClientRect();
		emit({ h: hsv.h, s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v: 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) });
	}
	function areaKey(e: KeyboardEvent) {
		const st = e.shiftKey ? 0.1 : 0.01,
			k = e.key;
		if (k === 'ArrowRight') emit({ ...hsv, s: Math.min(1, hsv.s + st) });
		else if (k === 'ArrowLeft') emit({ ...hsv, s: Math.max(0, hsv.s - st) });
		else if (k === 'ArrowUp') emit({ ...hsv, v: Math.min(1, hsv.v + st) });
		else if (k === 'ArrowDown') emit({ ...hsv, v: Math.max(0, hsv.v - st) });
		else return;
		e.preventDefault();
	}
</script>

{#snippet panel()}
	<div class={['ui-cpk', cls]}>
		<div
			bind:this={area}
			role="slider"
			tabindex="0"
			aria-label="Saturation and brightness"
			aria-valuenow={Math.round(hsv.s * 100)}
			aria-valuetext="Saturation {Math.round(hsv.s * 100)} percent, brightness {Math.round(hsv.v * 100)} percent"
			class="ui-cpk__area"
			style="background-color: {hsv2hex(hsv.h, 1, 1)}"
			onpointerdown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPtr(e); }}
			onpointermove={(e) => { if (e.currentTarget.hasPointerCapture?.(e.pointerId)) fromPtr(e); }}
			onkeydown={areaKey}>
			<span class="ui-cpk__knob" style="left: {hsv.s * 100}%; top: {(1 - hsv.v) * 100}%"></span>
		</div>
		<input type="range" min="0" max="360" value={Math.round(hsv.h)} class="ui-cpk__hue" aria-label="Hue" oninput={(e) => emit({ ...hsv, h: +e.currentTarget.value })} />
		<div class="ui-cpk__row">
			<span class="ui-cpk__chip" style="background: {val}" aria-hidden="true"></span>
			<input
				{id}
				class="ui-cpk__hex"
				aria-label="Hex value"
				spellcheck={false}
				maxlength={7}
				value={text != null ? text : val}
				oninput={(e) => {
					const t = e.currentTarget.value;
					text = t;
					if (/^#?[0-9a-f]{6}$/i.test(t)) setHex(t[0] === '#' ? t : '#' + t);
				}}
				onblur={() => (text = null)} />
		</div>
		{#if sw.length > 0}
			<div class="ui-cpk__sw" role="group" aria-label="Swatches">
				{#each sw as c (c)}
					{@const on = c.toLowerCase() === val}
					<button type="button" class={['ui-cpk__s', on && 'is-on']} style="background: {c}; color: {lum(c) > 0.4 ? '#111827' : '#ffffff'}" aria-label={c} aria-pressed={on ? 'true' : 'false'} onclick={() => setHex(c)}>{#if on}<Icon name="check" size={14} />{/if}</button>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#if inline}
	{@render panel()}
{:else}
	<Popover placement="bottom-start">
		{#snippet trigger(tp)}
			<button type="button" class="ui-cpk__trig" {...tp}>
				<span class="ui-cpk__chip" style="background: {val}" aria-hidden="true"></span>
				<span>{label ? label + ' ' : ''}<span class="ui-cpk__mono">{val}</span></span>
				<Icon name="chevron-down" size={16} />
			</button>
		{/snippet}
		{@render panel()}
	</Popover>
{/if}
