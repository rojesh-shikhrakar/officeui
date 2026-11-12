<!-- Progress Tracker – ported from affectUI (MIT). Onboarding checklist with an animated bar, drawn ticks and auto play. -->
<script lang="ts" module>
	export type ProgressStep = { id: string; label: string; done?: boolean };
	const num = new Intl.NumberFormat('en');
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import './progress-tracker.css';

	let {
		title = 'Getting started',
		steps = [
			{ id: 'a', label: 'Create your workspace', done: true },
			{ id: 'b', label: 'Connect a data source', done: true },
			{ id: 'c', label: 'Invite your team' },
			{ id: 'd', label: 'Run your first agent' },
			{ id: 'e', label: 'Set up approvals' }
		],
		autoPlay = false,
		interval = 2200,
		onchange,
		icon,
		class: cls
	}: {
		title?: string;
		steps?: ProgressStep[];
		/** Ticks the open steps one after another, then starts over – stops on interaction */
		autoPlay?: boolean;
		/** Pause between two automatic steps, in ms */
		interval?: number;
		onchange?: (steps: ProgressStep[]) => void;
		/** Small icon on the right of a step */
		icon?: Snippet<[ProgressStep]>;
		class?: string;
	} = $props();

	// svelte-ignore state_referenced_locally
	const done = new SvelteSet(steps.filter((s) => s.done).map((s) => s.id));
	// svelte-ignore state_referenced_locally
	let playing = $state(autoPlay);
	const total = $derived(steps.length);
	const count = $derived(steps.filter((s) => done.has(s.id)).length);
	const progress = $derived(total ? count / total : 0);

	function toggle(id: string) {
		if (done.has(id)) done.delete(id);
		else done.add(id);
		onchange?.(steps.map((s) => ({ ...s, done: done.has(s.id) })));
	}
	// Auto play: tick the next open step; when all are done, start over
	$effect(() => {
		if (!playing) return;
		void count;
		const open = steps.find((s) => !done.has(s.id));
		const t = setTimeout(
			() => {
				if (open) toggle(open.id);
				else {
					done.clear();
					steps.filter((s) => s.done).forEach((s) => done.add(s.id));
				}
			},
			open ? interval : interval * 2
		);
		return () => clearTimeout(t);
	});
</script>

<div class={['ui-progressc', cls]} data-complete={count === total || undefined} role="presentation" onpointerdown={() => (playing = false)} onkeydown={() => (playing = false)}>
	<div class="ui-progressc__head">
		<h3 class="ui-progressc__title" dir="auto" {title}>{title}</h3>
		<span class="ui-progressc__count" aria-hidden="true">{#key count}<span class="ui-progressc__digit">{num.format(count)}</span>{/key}/{num.format(total)}</span>
	</div>
	<div
		class="ui-progressc__bar"
		role="progressbar"
		aria-label={title}
		aria-valuemin={0}
		aria-valuemax={total}
		aria-valuenow={count}
		aria-valuetext="{num.format(count)} of {num.format(total)} done"
	>
		<span class="ui-progressc__fill" style:transform="scaleX({progress})">{#key count}<span class="ui-progressc__shine"></span>{/key}</span>
	</div>
	<ul class="ui-progressc__list">
		{#each steps as step, index (step.id)}
			<li style:animation-delay="{180 + Math.min(index, 12) * 90}ms">
				<button type="button" role="checkbox" aria-checked={done.has(step.id)} class="ui-progressc__step" onclick={() => toggle(step.id)}>
					<span class="ui-progressc__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.5 12.5l3.5 3.5 7.5-8" pathLength="1" /></svg></span>
					<span class="ui-progressc__label" title={step.label || undefined}><span dir="auto">{step.label || ' '}</span></span>
					{#if icon}<span class="ui-progressc__icon" aria-hidden="true">{@render icon(step)}</span>{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>
