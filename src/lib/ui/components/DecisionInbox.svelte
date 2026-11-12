<!-- Decision Inbox – ported from affectUI (MIT). Open decisions with two quick answers; answered ones confirm and fold away. -->
<script lang="ts" module>
	export type Decision = {
		id: string;
		title: string;
		/** Short context under the title */
		detail?: string;
		/** Main answer, shown as the dark button */
		primary: string;
		/** Other answer, shown as the light button */
		secondary: string;
		/** Starts folded to one muted line – click to open */
		collapsed?: boolean;
	};
	type RowState = { open: boolean; answered?: string; gone?: boolean };
</script>

<script lang="ts">
	import './decision-inbox.css';

	let {
		decisions = [
			{ id: 'a', title: 'Send the renewal offer to Northwind?', detail: 'Their plan ends Friday. The agent drafted a 10% discount.', primary: 'Send it', secondary: 'Hold' },
			{ id: 'b', title: 'Merge the billing webhook fix?', detail: 'All 48 checks passed on PR #482.', primary: 'Merge', secondary: 'Review first', collapsed: true },
			{ id: 'c', title: 'Archive 1,312 duplicate contacts?', primary: 'Archive', secondary: 'Skip', collapsed: true }
		],
		ondecide,
		class: cls
	}: { decisions?: Decision[]; ondecide?: (d: Decision, answer: 'primary' | 'secondary') => void; class?: string } = $props();

	// svelte-ignore state_referenced_locally
	let motion = $state<Record<string, RowState>>(Object.fromEntries(decisions.map((d) => [d.id, { open: !d.collapsed }])));
	const open = $derived(decisions.filter((d) => !motion[d.id]?.answered).length);
	const count = $derived(new Intl.NumberFormat('en').format(open));

	function decide(d: Decision, answer: 'primary' | 'secondary') {
		motion[d.id] = { ...motion[d.id], answered: answer === 'primary' ? d.primary : d.secondary };
		ondecide?.(d, answer);
		// Show the confirmation for a moment, then fold the row away and open the next folded one
		setTimeout(() => {
			motion[d.id] = { ...motion[d.id], gone: true };
			const folded = decisions.find((x) => x.id !== d.id && !motion[x.id]?.open && !motion[x.id]?.answered);
			if (folded) motion[folded.id] = { ...motion[folded.id], open: true };
		}, 1100);
	}
</script>

{#snippet alertIcon()}
	<svg class="ui-dic__glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
		<path d="M6.7 2.3a1.5 1.5 0 0 1 2.6 0l5.4 9.4A1.5 1.5 0 0 1 13.4 14H2.6a1.5 1.5 0 0 1-1.3-2.3Z" fill="currentColor" />
		<path class="ui-dic__cut" d="M8 5.8v3.2" stroke-width="1.4" stroke-linecap="round" fill="none" />
		<circle class="ui-dic__cut-dot" cx="8" cy="11.3" r="0.8" />
	</svg>
{/snippet}
{#snippet doneIcon()}
	<svg class="ui-dic__glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
		<circle cx="8" cy="8" r="6.5" fill="currentColor" />
		<path class="ui-dic__cut" d="m5.3 8.2 1.8 1.8 3.6-3.8" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/snippet}

<section class={['ui-dic', cls]} data-clear={open === 0 || undefined}>
	<header class="ui-dic__head" aria-live="polite">
		{#if open > 0}{@render alertIcon()}<span>{count} {open === 1 ? 'needs' : 'need'} your input</span>
		{:else}{@render doneIcon()}<span>All caught up</span>{/if}
	</header>
	<div class="ui-dic__card">
		{#each decisions as d (d.id)}
			{@const s = motion[d.id] ?? { open: true }}
			<div class="ui-dic__row" data-gone={s.gone || undefined} inert={s.gone}>
				<div class="ui-dic__row-inner">
					<div class="ui-dic__item" data-open={s.open || undefined} data-answered={s.answered ? true : undefined}>
						{#if s.open}
							<p class="ui-dic__title" dir="auto">{d.title}</p>
						{:else}
							<button type="button" class="ui-dic__title ui-dic__title--folded" dir="auto" title={d.title} onclick={() => (motion[d.id] = { ...s, open: true })}>{d.title}</button>
						{/if}
						<div class="ui-dic__body" data-open={s.open || undefined}>
							<div class="ui-dic__body-inner">
								{#if d.detail}<p class="ui-dic__detail" dir="auto">{d.detail}</p>{/if}
								<div class="ui-dic__actions">
									{#if s.answered}
										<span class="ui-dic__done" role="status">{@render doneIcon()}<span dir="auto">{s.answered}</span></span>
									{:else}
										<button type="button" class="ui-dic__btn ui-dic__btn--primary" dir="auto" onclick={() => decide(d, 'primary')}>{d.primary}</button>
										<button type="button" class="ui-dic__btn" dir="auto" onclick={() => decide(d, 'secondary')}>{d.secondary}</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
		<p class="ui-dic__empty">Nothing waiting on you – new decisions show up here.</p>
	</div>
</section>
