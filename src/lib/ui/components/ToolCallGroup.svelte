<!-- Tool Call Group – ported from affectUI (MIT). Sums up several tool calls in one line and folds open to the cards. -->
<script lang="ts">
	import ToolCallCard from './ToolCallCard.svelte';
	import { Stopwatch, formatMs, type ToolCall } from './tool-call.svelte';
	import './tool-call-card.css';

	let {
		calls = [
			{ name: 'search_web', summary: 'Searched for “CRM pricing 2026”', status: 'success', duration: 1240, args: { query: 'CRM pricing 2026' } },
			{ name: 'read_page', summary: 'Read 3 pricing pages', status: 'success', duration: 2310, args: { urls: 3 } },
			{ name: 'write_table', summary: 'Built a comparison table', status: 'success', duration: 880 }
		],
		label,
		runningLabel = 'Using tools…',
		duration,
		open = $bindable(false),
		class: cls
	}: {
		calls?: ToolCall[];
		/** Label once all calls are done – defaults to "Used 3 tools" */
		label?: string;
		runningLabel?: string;
		/** Total duration in ms – otherwise the sum of the calls */
		duration?: number;
		open?: boolean;
		class?: string;
	} = $props();

	const uid = $props.id();
	const running = $derived(calls.some((c) => c.status === 'running'));
	const failed = $derived(calls.filter((c) => c.status === 'error').length);
	const since = $derived(calls.reduce<number | undefined>((min, c) => (c.status === 'running' && c.startedAt != null && (min == null || c.startedAt < min) ? c.startedAt : min), undefined));
	const watch = new Stopwatch(() => running, () => since, true);
	const sum = $derived(calls.length && calls.every((c) => c.duration != null) ? calls.reduce((t, c) => t + (c.duration ?? 0), 0) : null);
	const ms = $derived(running ? watch.ms : (duration ?? sum ?? watch.ms));
	const count = $derived(`Used ${calls.length.toLocaleString('en-US')} ${calls.length === 1 ? 'tool' : 'tools'}`);
	const title = $derived(running ? runningLabel : (label ?? count));
	const icons = $derived(calls.slice(-3));
</script>

<div class={['ui-tclc-group', cls]} data-running={running || undefined} data-open={open || undefined}>
	<span class="ui-tclc-sr" role="status" aria-live="polite">{running ? runningLabel : `${count}${failed ? `, ${failed} failed` : ''}`}</span>
	<button type="button" class="ui-tclc-group__head" aria-expanded={open} aria-controls="{uid}-list" onclick={() => (open = !open)}>
		<span class="ui-tclc-group__stack" aria-hidden="true">
			{#each icons as _, i (calls.length - icons.length + i)}
				<span class="ui-tclc__icon"><svg viewBox="0 0 16 16"><path d="M10.2 2.4a3.5 3.5 0 0 0-4.3 4.6L2.6 10.3a1.4 1.4 0 0 0 2 2L7.9 9a3.5 3.5 0 0 0 4.6-4.3l-2 2-1.6-.4-.4-1.6 1.7-2.3Z" /></svg></span>
			{/each}
		</span>
		{#key running}
			<span class="ui-tclc-group__title">
				<span class={running ? 'ui-tclc-group__label ui-tclc__shine' : 'ui-tclc-group__label'} data-text={title}>{title}</span>
				{#if !running && failed > 0}<span class="ui-tclc-group__failed">· {failed} failed</span>{/if}
				{#if ms != null}<span class="ui-tclc-group__time">· {formatMs(ms, running)}</span>{/if}
			</span>
		{/key}
		<svg class="ui-tclc__chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 5.25 6 7.75l2.5-2.5" /></svg>
	</button>
	<div class="ui-tclc__body" id="{uid}-list" inert={!open}>
		<div class="ui-tclc__clip">
			<div class="ui-tclc-group__list">{#each calls as c, i (i)}<ToolCallCard {...c} />{/each}</div>
		</div>
	</div>
</div>
