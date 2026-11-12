<!-- Reaction Bar – ported from affectUI (MIT). Like, comment, repost and share chips with rolling counts. -->
<script lang="ts" module>
	export type ReactionKey = 'like' | 'comment' | 'repost' | 'share';
	export type ReactionState = { count: number; active?: boolean };
	const labels: Record<ReactionKey, [string, string]> = {
		like: ['Like', 'likes'],
		comment: ['Comment', 'comments'],
		repost: ['Repost', 'reposts'],
		share: ['Share', 'shares']
	};
	const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
	const exact = new Intl.NumberFormat('en');
	const short = (n: number) => (n >= 10_000 && n < 1_000_000 ? compact.format(Math.round(n / 1000) * 1000) : compact.format(n));
	const clean = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
</script>

<script lang="ts">
	import './reaction-bar.css';
	import Count from './ReactionCount.svelte';

	let {
		reactions = { like: { count: 128, active: true }, comment: { count: 24 }, repost: { count: 9 }, share: { count: 0 } },
		onreact,
		actions: actionsProp = ['like', 'comment', 'repost', 'share'],
		class: cls
	}: {
		/** Starting counts and whether each action is already taken */
		reactions?: Partial<Record<ReactionKey, ReactionState>>;
		/** Called after an action was toggled, with its new motion */
		onreact?: (key: ReactionKey, state: Required<ReactionState>) => void;
		/** Hide actions you don't need */
		actions?: ReactionKey[];
		class?: string;
	} = $props();

	const actions = $derived(actionsProp.filter((k, i, all) => k in labels && all.indexOf(k) === i));
	// svelte-ignore state_referenced_locally
	let motion = $state(
		Object.fromEntries((Object.keys(labels) as ReactionKey[]).map((k) => [k, { count: clean(reactions?.[k]?.count), active: reactions?.[k]?.active === true }])) as Record<
			ReactionKey,
			Required<ReactionState>
		>
	);
	let popped = $state<Record<string, number>>({});

	function toggle(key: ReactionKey) {
		const cur = motion[key];
		const next = { active: !cur.active, count: Math.max(0, cur.count + (cur.active ? -1 : 1)) };
		motion[key] = next;
		popped[key] = (popped[key] ?? 0) + 1;
		onreact?.(key, next);
	}
</script>

{#if actions.length}
	<div class={['ui-rbc', cls]} role="group" aria-label="Reactions">
		{#each actions as key (key)}
			{@const { count, active } = motion[key]}
			{@const [verb, noun] = labels[key]}
			<button
				type="button"
				class="ui-rbc__btn"
				data-kind={key}
				aria-pressed={active}
				aria-label={`${verb}${count ? `, ${exact.format(count)} ${count === 1 ? noun.slice(0, -1) : noun}` : ''}`}
				title={count >= 1000 ? `${exact.format(count)} ${noun}` : undefined}
				onclick={() => toggle(key)}
			>
				{#key popped[key] ?? 0}
					<span class="ui-rbc__icon" data-pop={popped[key] ? true : undefined}>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							{#if key === 'like'}
								<path class="ui-rbc__fill" d="M19.46 4c-2.68-1.65-5.02-.99-6.43.07-.57.43-.86.65-1.03.65s-.46-.22-1.03-.65C9.56 3.01 7.22 2.35 4.54 4 1.02 6.15.22 13.27 8.34 19.28 9.89 20.43 10.66 21 12 21s2.11-.57 3.66-1.72C23.78 13.27 22.98 6.15 19.46 4Z" />
							{:else if key === 'comment'}
								<path class="ui-rbc__fill" d="M12 21.5c5.52 0 10-4.25 10-9.5S17.52 2.5 12 2.5 2 6.75 2 12c0 1.36.3 2.65.84 3.82.15.31.2.66.1 1l-.6 2.23a1.08 1.08 0 0 0 1.6 1.59l2.22-.6c.34-.09.69-.04 1 .1 1.17.55 2.46.86 4.84.86Z" />
							{:else if key === 'repost'}
								<path d="M16.5 3.5 19 6l-2.5 2.5" /><path d="M19 6H8a4 4 0 0 0-4 4v1" /><path d="M7.5 20.5 5 18l2.5-2.5" /><path d="M5 18h11a4 4 0 0 0 4-4v-1" />
							{:else}
								<path d="M21 3 10.5 13.5" /><path d="M21 3 14.6 20.6a.5.5 0 0 1-.93.05L10.5 13.5 3.35 10.33a.5.5 0 0 1 .05-.93Z" />
							{/if}
						</svg>
					</span>
				{/key}
				<Count text={count > 0 ? short(count) : ''} />
			</button>
		{/each}
	</div>
{/if}
