<!-- Smart Recommendation – ported from affectUI (MIT). Suggestion card with a confidence signal, alternatives and accept with undo. -->
<script lang="ts" module>
	export type Recommendation = {
		id: string;
		/** Short name, used in the accept button */
		label: string;
		/** One sentence why */
		reason: string;
		/** 0 = no signal, 1 = weak, 2 = good, 3 = strong */
		signal: 0 | 1 | 2 | 3;
	};
	const signalText = ['No signal', 'Weak signal', 'Good signal', 'Strong signal'];
	const level = (s: unknown): 0 | 1 | 2 | 3 => {
		const n = Math.round(Number(s));
		return (Number.isFinite(n) ? Math.min(3, Math.max(0, n)) : 0) as 0 | 1 | 2 | 3;
	};
	const lowerFirst = (s: string) => (/^\p{Lu}\p{Ll}/u.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import './smart-recommendation.css';

	let {
		title = 'Smart recommendation',
		options = [
			{ id: 'inc', label: 'Incremental sync', reason: 'Only 3% of rows change each day – syncing just the changes is 30× faster and cheaper.', signal: 3 },
			{ id: 'full', label: 'Full sync', reason: 'Copies every row each time. Simple, but slow for large tables.', signal: 1 },
			{ id: 'stream', label: 'Streaming', reason: 'Near real-time updates, at a higher monthly cost.', signal: 2 }
		],
		onaccept,
		onundo,
		defaultOpen = true,
		class: cls
	}: {
		title?: string;
		/** First entry is the recommendation, the rest are alternatives */
		options?: Recommendation[];
		onaccept?: (o: Recommendation) => void;
		onundo?: (o: Recommendation) => void;
		defaultOpen?: boolean;
		class?: string;
	} = $props();

	let chosen = $state(0);
	let accepted = $state<number | null>(null);
	// svelte-ignore state_referenced_locally
	let open = $state(defaultOpen);
	let menu = $state(false);
	let flip = $state(false);
	let menuEl = $state<HTMLDivElement>();

	const at = $derived(chosen < options.length ? chosen : 0);
	const current = $derived(options[at]);
	const isRecommended = $derived(at === 0);
	const done = $derived(accepted === at);
	const signal = $derived(level(current?.signal));
	const acceptText = $derived(current ? `Accept ${lowerFirst(String(current.label))}` : '');

	// A menu that would run past the card's left edge opens to the right instead
	$effect(() => {
		if (!menu) return void (flip = false);
		tick().then(() => {
			const pop = menuEl?.querySelector<HTMLElement>('.ui-src__menu');
			const card = menuEl?.closest<HTMLElement>('.ui-src');
			if (!menuEl || !pop || !card || getComputedStyle(menuEl).position === 'static') return void (flip = false);
			flip = menuEl.getBoundingClientRect().right - pop.offsetWidth < card.getBoundingClientRect().left - 24;
		});
	});
</script>

<svelte:window
	onpointerdown={(e) => menu && !menuEl?.contains(e.target as Node) && (menu = false)}
	onkeydown={(e) => menu && e.key === 'Escape' && (menu = false)}
/>

{#snippet ico(d: string)}
	<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

{#if current}
	<section class={['ui-src', cls]} aria-label={title} data-accepted={done || undefined}>
		<button type="button" class="ui-src__head" aria-expanded={open} onclick={() => (open = !open)}>
			<svg viewBox="0 0 16 16" class="ui-src__mark" aria-hidden="true">
				<path d="M6.5 2.2c.2 0 .36.14.4.33.53 2.6 1.4 3.48 4 4.02a.4.4 0 0 1 0 .79c-2.6.53-3.47 1.4-4 4a.4.4 0 0 1-.8 0c-.53-2.6-1.4-3.47-4-4a.4.4 0 0 1 0-.79c2.6-.54 3.47-1.42 4-4.02a.4.4 0 0 1 .4-.33Z" />
				<path d="M12 9.6c.12 0 .22.08.25.2.28 1.3.72 1.75 2.03 2.03a.25.25 0 0 1 0 .49c-1.31.28-1.75.72-2.03 2.03a.25.25 0 0 1-.5 0c-.28-1.31-.72-1.75-2.03-2.03a.25.25 0 0 1 0-.49c1.31-.28 1.75-.73 2.03-2.03a.25.25 0 0 1 .25-.2Z" />
			</svg>
			<span class="ui-src__title" dir="auto" {title}>{title}</span>
			{#if !isRecommended}<span class="ui-src__pill">Alternative</span>{/if}
			<span class="ui-src__chevron">{@render ico('m4.5 6.25 3.5 3.5 3.5-3.5')}</span>
		</button>
		<div class="ui-src__body" data-open={open || undefined} inert={!open}>
			{#key at}<p class="ui-src__reason" dir="auto">{current.reason}</p>{/key}
		</div>
		<footer class="ui-src__foot">
			<span class="ui-src__signal" data-level={signal} title={signalText[signal]}>
				<span class="ui-src__bars" aria-hidden="true">{#each [1, 2, 3] as n (n)}<span data-on={signal >= n || undefined}></span>{/each}</span>
				{signalText[signal]}
			</span>
			<div class="ui-src__actions">
				{#if options.length > 1 && !done}
					<div class="ui-src__alt" bind:this={menuEl}>
						<button type="button" class="ui-src__btn ui-src__btn--icon" aria-haspopup="menu" aria-expanded={menu} onclick={() => (menu = !menu)}>
							{@render ico('M5 12.5v-9M2.75 5.75 5 3.5l2.25 2.25M11 3.5v9M8.75 10.25 11 12.5l2.25-2.25')}
							Alternatives
						</button>
						{#if menu}
							<div class="ui-src__menu" role="menu" data-flip={flip || undefined}>
								{#each options as o, i (`${o.id}-${i}`)}
									{@const l = level(o.signal)}
									<button
										type="button"
										role="menuitemradio"
										aria-checked={i === at}
										class="ui-src__option"
										onclick={() => {
											chosen = i;
											menu = false;
											open = true;
										}}
									>
										<span class="ui-src__option-label">
											<span class="ui-src__option-name" dir="auto" title={o.label}>{o.label}</span>
											{#if i === 0}<span class="ui-src__tag">Recommended</span>{/if}
										</span>
										<span class="ui-src__mini" data-level={l} aria-label={signalText[l]}>{#each [1, 2, 3] as n (n)}<span data-on={l >= n || undefined}></span>{/each}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{#if done}
					<span class="ui-src__done" role="status">
						{@render ico('m3.5 8.5 3 3 6-7')}
						<span class="ui-src__done-text" title="{current.label} accepted"><bdi>{current.label}</bdi> accepted</span>
					</span>
					<button
						type="button"
						class="ui-src__btn ui-src__btn--icon"
						onclick={() => {
							accepted = null;
							onundo?.(current);
						}}
					>
						{@render ico('M3.5 6.5h6.25a2.75 2.75 0 0 1 0 5.5H8M5.75 4.25 3.5 6.5l2.25 2.25')}
						Undo
					</button>
				{:else}
					<button
						type="button"
						class="ui-src__btn ui-src__btn--primary"
						title={acceptText}
						onclick={() => {
							accepted = at;
							menu = false;
							onaccept?.(current);
						}}><span class="ui-src__btn-text">{acceptText}</span></button
					>
				{/if}
			</div>
		</footer>
	</section>
{/if}
