<!-- Tips Panel – ported from affectUI (MIT). A grid of short tips with one action each and a done counter. -->
<script lang="ts" module>
	export type Tip = {
		id: string;
		title: string;
		/** Short explanation; wrap keys in `backticks` to show them as keyboard keys */
		description: string;
		/** Button text */
		action: string;
		/** Text after the action was taken, e.g. "Enabled" */
		doneLabel?: string;
		/** Shows the action as the dark button */
		primary?: boolean;
		onAction?: () => void;
	};
	const fmt = new Intl.NumberFormat('en');
</script>

<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import './tips-panel.css';

	let {
		title = 'Tips',
		tips = [
			{ id: 'k', title: 'Search everything', description: 'Press `⌘K` to jump to any agent, run or file.', action: 'Try it', primary: true, doneLabel: 'Tried' },
			{ id: 'n', title: 'Get notified', description: 'Hear when an agent needs your input.', action: 'Turn on', doneLabel: 'On' },
			{ id: 't', title: 'Invite your team', description: 'Share runs and approvals with teammates.', action: 'Invite', doneLabel: 'Invited' },
			{ id: 'd', title: 'Go dark', description: 'Switch themes with `⌘⇧L`.', action: 'Switch', doneLabel: 'Switched' }
		],
		onclose,
		closeLabel = 'Close',
		class: cls
	}: { title?: string; tips?: Tip[]; onclose?: () => void; closeLabel?: string; class?: string } = $props();

	const done = new SvelteSet<string>();
	const keyed = $derived.by(() => {
		const seen = new Map<string, number>();
		return tips.map((tip) => {
			const n = seen.get(tip.id) ?? 0;
			seen.set(tip.id, n + 1);
			return { tip, key: n ? `${tip.id}#${n}` : tip.id };
		});
	});
	const doneCount = $derived(keyed.filter((k) => done.has(k.key)).length);
	const parts = (s: string) => s.split(/(`[^`]+`)/g).filter(Boolean);
</script>

<section class={['ui-tpc', cls]} aria-label={title}>
	<header class="ui-tpc__head">
		<h3 class="ui-tpc__title" dir="auto">{title}</h3>
		<span class="ui-tpc__count" aria-live="polite">{fmt.format(doneCount)}/{fmt.format(tips.length)} done</span>
	</header>
	<div class="ui-tpc__body">
		<ul class="ui-tpc__grid">
			{#each keyed as { tip, key }, i (key)}
				{@const isDone = done.has(key)}
				<li class="ui-tpc__tip" data-done={isDone || undefined} style:animation-delay="{80 + Math.min(i, 12) * 50}ms">
					<p class="ui-tpc__tip-title" dir="auto">{tip.title}</p>
					<p class="ui-tpc__tip-text" dir="auto">
						{#each parts(tip.description) as p, j (j)}{#if p.startsWith('`')}<kbd class="ui-tpc__kbd">{p.slice(1, -1)}</kbd>{:else}{p}{/if}{/each}
					</p>
					{#if isDone}
						<span class="ui-tpc__done" role="status">
							<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
								><circle cx="8" cy="8" r="6.5" fill="currentColor" /><path d="m5.6 8.1 1.7 1.7 3.2-3.4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" /></svg
							>
							{tip.doneLabel ?? 'Done'}
						</span>
					{:else}
						<button
							type="button"
							class={['ui-tpc__btn', tip.primary && 'ui-tpc__btn--primary']}
							onclick={() => {
								done.add(key);
								tip.onAction?.();
							}}>{tip.action}</button
						>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
	{#if onclose}
		<footer class="ui-tpc__foot"><button type="button" class="ui-tpc__btn" onclick={onclose}>{closeLabel}</button></footer>
	{/if}
</section>
