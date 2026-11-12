<!-- Segmented Control – ported from affectUI (MIT). Two to six options as buttons, a tray with a raised pill, or underline tabs; drag across, keyboard, scroll fades. -->
<script lang="ts" module>
	export type SegmentOption = {
		value: string;
		label?: string;
		/** A small gray number after the label */
		count?: number | string;
		/** A small tinted tag after the label, e.g. "Save 20%" */
		badge?: string;
		disabled?: boolean;
		/** Accessible name – needed when the option only shows an icon */
		ariaLabel?: string;
		/** With kind="tabs": the id of the panel this tab shows */
		controls?: string;
	};
	const countText = (c: number | string | undefined) => (typeof c === 'number' ? (Number.isFinite(c) ? c.toLocaleString('en-US') : null) : c);
</script>

<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import './segmented-control.css';

	let {
		options: rawOptions = [
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' },
			{ value: 'year', label: 'Year' }
		],
		value = $bindable(),
		onchange,
		size: sizeProp = 'md',
		variant: variantProp = 'buttons',
		fullWidth = false,
		kind = 'radio',
		disabled = false,
		icon,
		'aria-label': ariaLabel = 'Range',
		'aria-labelledby': ariaLabelledby,
		class: cls
	}: {
		options?: SegmentOption[];
		value?: string;
		onchange?: (value: string) => void;
		size?: 'sm' | 'md' | 'lg';
		/** buttons = separate chips · tray = light track with a raised pill · underline = text tabs with a sliding line */
		variant?: 'buttons' | 'tray' | 'underline';
		/** Fill the container with equal segments */
		fullWidth?: boolean;
		/** radio (a radiogroup) or tabs (a tablist that switches panels) */
		kind?: 'radio' | 'tabs';
		disabled?: boolean;
		/** Optional icon per option */
		icon?: Snippet<[SegmentOption]>;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		class?: string;
	} = $props();

	const options = $derived.by(() => {
		const seen = new Set<string>();
		return rawOptions.filter((o) => {
			if (!o || o.value == null || seen.has(String(o.value))) return false;
			seen.add(String(o.value));
			return true;
		});
	});
	const size = $derived(sizeProp === 'sm' || sizeProp === 'lg' ? sizeProp : 'md');
	const variant = $derived(variantProp === 'tray' || variantProp === 'underline' ? variantProp : 'buttons');
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = options.find((o) => !o.disabled)?.value;

	let root: HTMLDivElement;
	let scroller: HTMLDivElement;
	let track: HTMLDivElement;
	let pill: HTMLSpanElement;
	let gliding = false;
	let glideTimer: ReturnType<typeof setTimeout>;
	let placed: string | undefined;
	let press: { id: number; touch: boolean; drag: boolean; x: number; moved: boolean } | null = null;
	const buttons = () => Array.from(track?.querySelectorAll<HTMLElement>(':scope > .ui-segc__opt') ?? []);
	const activeIndex = $derived(options.findIndex((o) => o.value === value));
	const tabbable = $derived(activeIndex >= 0 ? activeIndex : options.findIndex((o) => !o.disabled));
	const isTabs = $derived(kind === 'tabs');

	function select(v: string) {
		const opt = options.find((o) => o.value === v);
		if (!opt || opt.disabled || disabled || v === value) return;
		value = v;
		onchange?.(v);
	}
	// Buttons get the width of their content, so a changed label glides to the new size
	function measure() {
		const els = buttons();
		if (!els.length || !track) return;
		const cs = getComputedStyle(els[0]);
		const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
		const widths = els.map((b) => (b.firstElementChild as HTMLElement).offsetWidth + pad);
		if (fullWidth) {
			track.style.setProperty('--ui-segc-min', `${Math.max(...widths)}px`);
			els.forEach((b) => (b.style.width = ''));
		} else els.forEach((b, i) => (b.style.width = `${widths[i]}px`));
	}
	// Moves the pill (or line) under the active option
	function place(animate: boolean) {
		if (!track || !pill) return;
		const btn = track.querySelector<HTMLElement>(':scope > .ui-segc__opt[data-active]');
		if (!btn || !btn.offsetWidth) return void (pill.style.opacity = '0');
		let x = btn.offsetLeft;
		let w = btn.offsetWidth;
		if (variant === 'underline') {
			const content = btn.firstElementChild as HTMLElement;
			x += content.offsetLeft;
			w = content.offsetWidth;
		}
		const instant = !pill.dataset.ready || (!animate && !gliding);
		const prev = parseFloat(pill.style.left) || 0;
		if (!instant && x !== prev) pill.dataset.dir = x > prev ? 'right' : 'left';
		if (instant) pill.style.transition = 'none';
		pill.style.opacity = '1';
		pill.style.left = `${x}px`;
		pill.style.right = `${track.clientWidth - x - w}px`;
		if (instant) {
			pill.dataset.ready = '1';
			void pill.offsetWidth;
			pill.style.transition = '';
		}
	}
	// Soft edges only on the sides that can scroll
	function fades() {
		if (!scroller) return;
		const max = scroller.scrollWidth - scroller.clientWidth;
		root?.toggleAttribute('data-overflow', max > 1);
		scroller.style.setProperty('--ui-segc-fade-l', scroller.scrollLeft > 1 ? '24px' : '0px');
		scroller.style.setProperty('--ui-segc-fade-r', scroller.scrollLeft < max - 1 ? '24px' : '0px');
	}
	function reveal(smooth: boolean) {
		const btn = track?.querySelector<HTMLElement>(':scope > .ui-segc__opt[data-active]');
		if (!scroller || !track || !btn || scroller.scrollWidth <= scroller.clientWidth + 1) return;
		const left = track.offsetLeft + btn.offsetLeft - (scroller.clientWidth - btn.offsetWidth) / 2;
		scroller.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
	}
	onMount(() => {
		const sync = () => {
			measure();
			place(false);
			fades();
		};
		sync();
		const ready = requestAnimationFrame(() => root?.setAttribute('data-ready', ''));
		let frame = 0;
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(sync);
		});
		ro.observe(scroller);
		ro.observe(track);
		track.querySelectorAll('.ui-segc__opt, .ui-segc__content').forEach((el) => ro.observe(el));
		return () => {
			ro.disconnect();
			cancelAnimationFrame(frame);
			cancelAnimationFrame(ready);
			clearTimeout(glideTimer);
		};
	});
	// A new value: the pill glides there and focus follows
	$effect(() => {
		const current = value;
		const idx = activeIndex;
		tick().then(() => {
			if (placed === current) return;
			const first = placed === undefined;
			placed = current;
			if (!first) {
				gliding = true;
				clearTimeout(glideTimer);
				glideTimer = setTimeout(() => (gliding = false), 240);
			}
			place(!first);
			reveal(!first);
			if (!first && track?.contains(document.activeElement)) buttons()[idx]?.focus({ preventScroll: true });
		});
	});

	function keydown(e: KeyboardEvent) {
		const enabled = options.filter((o) => !o.disabled);
		if (!enabled.length || disabled) return;
		const prevKeys = kind === 'radio' ? ['ArrowLeft', 'ArrowUp'] : ['ArrowLeft'];
		const nextKeys = kind === 'radio' ? ['ArrowRight', 'ArrowDown'] : ['ArrowRight'];
		const at = enabled.findIndex((o) => o.value === value);
		let target: SegmentOption | undefined;
		if (prevKeys.includes(e.key)) target = enabled[(at - 1 + enabled.length) % enabled.length];
		else if (nextKeys.includes(e.key)) target = enabled[(at + 1) % enabled.length];
		else if (e.key === 'Home') target = enabled[0];
		else if (e.key === 'End') target = enabled[enabled.length - 1];
		if (!target) return;
		e.preventDefault();
		select(target.value);
		buttons()[options.indexOf(target)]?.focus();
	}
	// The option under (or nearest to) a horizontal pointer position
	function optionAt(clientX: number) {
		let best = -1;
		let dist = Infinity;
		buttons().forEach((b, i) => {
			const r = b.getBoundingClientRect();
			const d = clientX < r.left ? r.left - clientX : clientX > r.right ? clientX - r.right : 0;
			if (d < dist) {
				dist = d;
				best = i;
			}
		});
		return options[best];
	}
	function endPress() {
		press = null;
		root?.removeAttribute('data-pressed');
	}
	function pointerdown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		if (disabled || e.button !== 0) return;
		const opt = optionAt(e.clientX);
		if (!opt || opt.disabled) return;
		const touch = e.pointerType === 'touch';
		const drag = !touch || opt.value === value;
		press = { id: e.pointerId, touch, drag, x: e.clientX, moved: false };
		if (drag) root?.setAttribute('data-pressed', '');
		if (!touch) {
			select(opt.value);
			try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {
				/* capture is a nicety */
			}
		}
	}
	function pointermove(e: PointerEvent) {
		const p = press;
		if (!p || p.id !== e.pointerId) return;
		if (!p.moved && Math.abs(e.clientX - p.x) < (p.touch ? 8 : 3)) return;
		p.moved = true;
		if (!p.drag) return;
		const opt = optionAt(e.clientX);
		if (opt && !opt.disabled) select(opt.value);
	}
	function pointerup(e: PointerEvent) {
		const p = press;
		if (!p || p.id !== e.pointerId) return;
		if (p.touch && !p.moved) {
			const opt = optionAt(e.clientX);
			if (opt) select(opt.value);
		}
		endPress();
	}
</script>

<div bind:this={root} class={['ui-segc', cls]} data-size={size} data-variant={variant} data-full={fullWidth || undefined} data-disabled={disabled || undefined}>
	<div bind:this={scroller} class="ui-segc__scroller" onscroll={fades}>
		<div
			bind:this={track}
			class="ui-segc__track"
			role={isTabs ? 'tablist' : 'radiogroup'}
			tabindex="-1"
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledby}
			aria-disabled={disabled || undefined}
			aria-orientation={isTabs ? 'horizontal' : undefined}
			onkeydown={keydown}
			onpointerdown={pointerdown}
			onpointermove={pointermove}
			onpointerup={pointerup}
			onpointercancel={endPress}
			onlostpointercapture={endPress}
		>
			<span bind:this={pill} class="ui-segc__pill" aria-hidden="true"></span>
			{#each options as o, i (String(o.value))}
				{@const active = i === activeIndex}
				{@const label = o.label ?? (icon ? null : String(o.value))}
				{@const count = countText(o.count)}
				<button
					type="button"
					class="ui-segc__opt"
					role={isTabs ? 'tab' : 'radio'}
					aria-checked={isTabs ? undefined : active}
					aria-selected={isTabs ? active : undefined}
					aria-controls={isTabs ? o.controls : undefined}
					aria-label={o.ariaLabel}
					data-active={active || undefined}
					disabled={o.disabled || disabled}
					tabindex={i === tabbable ? 0 : -1}
					onclick={() => select(o.value)}
				>
					<span class="ui-segc__content">
						{#if icon}<span class="ui-segc__icon">{@render icon(o)}</span>{/if}
						{#if label != null}<span class="ui-segc__label" dir="auto">{label}</span>{/if}
						{#if count != null && count !== ''}{#key count}<span class="ui-segc__count">{count}</span>{/key}{/if}
						{#if o.badge != null}<span class="ui-segc__badge">{o.badge}</span>{/if}
					</span>
				</button>
			{/each}
		</div>
	</div>
</div>
