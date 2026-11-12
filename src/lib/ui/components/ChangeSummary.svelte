<!-- Change Summary – ported from affectUI (MIT). What moved since last time, one metric per row. -->
<script lang="ts" module>
	export type MetricChange = {
		label: string;
		/** What happened, in words, e.g. "Up 6.1% to 18.2K" */
		change: string;
		/** good: green arrow · bad: red arrow · neutral: gray dash */
		tone?: 'good' | 'bad' | 'neutral';
		/** Direction of the arrow – defaults to up for good, down for bad */
		direction?: 'up' | 'down';
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import './change-summary.css';

	let {
		title = "What's changed",
		period,
		icon,
		changes = [
			{ label: 'Visitors', change: 'Up 6.1% to 18.2K', tone: 'good' },
			{ label: 'Signups', change: 'Up 12% to 420', tone: 'good' },
			{ label: 'Churn', change: 'Up 0.4 pts to 2.9%', tone: 'bad', direction: 'up' },
			{ label: 'Avg. session', change: 'No change at 3m 12s', tone: 'neutral' }
		],
		class: cls
	}: { title?: string; period?: string; icon?: Snippet; changes?: MetricChange[]; class?: string } = $props();
</script>

<section class={['ui-csc', cls]} aria-label={title}>
	<header class="ui-csc__head">
		<span class="ui-csc__title">
			<span class="ui-csc__icon">
				{#if icon}{@render icon()}{:else}
					<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"
						><path d="M2.5 4h4M2.5 8h8M6.5 12h7M9.5 4h1" /></svg
					>
				{/if}
			</span>
			<span class="ui-csc__title-text" dir="auto" {title}>{title}</span>
		</span>
		{#if period}<span class="ui-csc__period" dir="auto" title={period}>{period}</span>{/if}
	</header>
	{#if changes.length}
		<dl class="ui-csc__list">
			{#each changes as c, i (`${i}-${c.label}`)}
				{@const tone = c.tone === 'good' || c.tone === 'bad' ? c.tone : 'neutral'}
				{@const down = (c.direction ?? (tone === 'bad' ? 'down' : 'up')) === 'down'}
				<div class="ui-csc__row" style:animation-delay="{120 + Math.min(i, 12) * 70}ms">
					<dt class="ui-csc__label" dir="auto" title={c.label}>{c.label}</dt>
					<dd class="ui-csc__change">
						<span class="ui-csc__trend" data-tone={tone} aria-hidden="true">
							<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								{#if tone === 'neutral'}<path d="M3 6h6" />{:else if down}<path d="M6 2.5v7M3 6.5l3 3 3-3" />{:else}<path d="M6 9.5v-7M3 5.5l3-3 3 3" />{/if}
							</svg>
						</span>
						<span class="ui-csc__text" dir="auto" title={c.change}>{c.change}</span>
					</dd>
				</div>
			{/each}
		</dl>
	{/if}
</section>
