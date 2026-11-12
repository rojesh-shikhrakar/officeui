<!-- Tool Call Card – ported from affectUI (MIT). An agent's tool call in one line: live timer, status, folds open to highlighted args and result, retry on errors. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import ToolCallCode from './ToolCallCode.svelte';
	import { Stopwatch, formatMs, type ToolCallStatus } from './tool-call.svelte';
	import './tool-call-card.css';

	let {
		name = 'search_web',
		summary = 'Searched the web for “CRM pricing 2026”',
		icon,
		status = 'success',
		args = { query: 'CRM pricing 2026', limit: 5 },
		result = { results: [{ title: 'CRM pricing compared', url: 'https://example.com/crm' }], took_ms: 412 },
		error,
		startedAt,
		duration = 1240,
		open = $bindable(false),
		openOnError = true,
		onretry,
		maxCodeHeight = 220,
		class: cls
	}: {
		name?: string;
		summary?: string;
		/** Icon in the tile on the left – defaults to a wrench */
		icon?: Snippet;
		status?: ToolCallStatus;
		args?: unknown;
		result?: unknown;
		error?: string;
		startedAt?: number;
		duration?: number;
		open?: boolean;
		/** Opens when the call fails and closes again on the next run, unless someone toggled it */
		openOnError?: boolean;
		/** Shows a Retry button next to the error */
		onretry?: () => void;
		/** Height after which args and result are capped with "Show all" */
		maxCodeHeight?: number;
		class?: string;
	} = $props();

	const uid = $props.id();
	// svelte-ignore state_referenced_locally
	let prevStatus = status;
	let autoOpened = false;
	$effect.pre(() => {
		const s = status;
		if (s === prevStatus) return;
		const before = prevStatus;
		prevStatus = s;
		if (!openOnError) return;
		if (s === 'error' && !open) {
			open = true;
			autoOpened = true;
		} else if (before === 'error' && autoOpened) {
			open = false;
			autoOpened = false;
		}
	});
	const watch = new Stopwatch(() => status === 'running', () => startedAt, false);
	const ms = $derived(status === 'running' ? (watch.ms ?? 0) : (duration ?? watch.ms));
	const announce = $derived(status === 'running' ? `${name} running` : status === 'success' ? `${name} finished` : `${name} failed${error ? `: ${error}` : ''}`);
</script>

{#snippet err()}<svg class="ui-tclc__err" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" /><path d="M8 4.9v3.5M8 10.9v.1" /></svg>{/snippet}

<div class={['ui-tclc', cls]} data-status={status} data-open={open || undefined}>
	<span class="ui-tclc-sr" role="status" aria-live="polite">{announce}</span>
	<button
		type="button"
		class="ui-tclc__head"
		aria-expanded={open}
		aria-controls="{uid}-body"
		onclick={() => {
			autoOpened = false;
			open = !open;
		}}
	>
		<span class="ui-tclc__icon" aria-hidden="true">
			{#if icon}{@render icon()}{:else}<svg viewBox="0 0 16 16"><path d="M10.2 2.4a3.5 3.5 0 0 0-4.3 4.6L2.6 10.3a1.4 1.4 0 0 0 2 2L7.9 9a3.5 3.5 0 0 0 4.6-4.3l-2 2-1.6-.4-.4-1.6 1.7-2.3Z" /></svg>{/if}
		</span>
		<span class="ui-tclc__main">
			<code class="ui-tclc__name" title={name}>{name}</code>
			{#if summary != null}<span class="ui-tclc__summary" dir="auto" title={summary}>{summary}</span>{/if}
		</span>
		{#key status}
			<span class="ui-tclc__status">
				{#if status === 'running'}<svg class="ui-tclc__spinner" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 0 1 6 6" /></svg>{/if}
				{#if status === 'success'}<svg class="ui-tclc__ok" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" /><path d="M5.1 8.2 7.1 10.1 10.9 6" pathLength="1" /></svg>{/if}
				{#if status === 'error'}{@render err()}{/if}
				<span class="ui-tclc__time">{status === 'error' ? 'Failed' : ms != null ? formatMs(ms, status === 'running') : ''}</span>
			</span>
		{/key}
		<svg class="ui-tclc__chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 5.25 6 7.75l2.5-2.5" /></svg>
	</button>
	<div class="ui-tclc__body" id="{uid}-body" inert={!open}>
		<div class="ui-tclc__clip">
			<div class="ui-tclc__sections">
				{#if status === 'error'}
					<div class="ui-tclc__error">
						{@render err()}
						<p class="ui-tclc__error-text" dir="auto">{error ?? 'The tool call failed.'}</p>
						{#if onretry}
							<button type="button" class="ui-tclc__retry" onclick={onretry}>
								<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77" /><path d="M2.5 2.5v2.75h2.75" /></svg>
								Retry
							</button>
						{/if}
					</div>
				{/if}
				{#if args !== undefined}<ToolCallCode label="Arguments" value={args} cap={maxCodeHeight} />{/if}
				{#if result !== undefined}<ToolCallCode label="Result" value={result} cap={maxCodeHeight} />
				{:else if status === 'running'}
					<div class="ui-tclc__section">
						<div class="ui-tclc__section-head"><span class="ui-tclc__label">Result</span></div>
						<p class="ui-tclc__pending">Waiting for result…</p>
					</div>
				{/if}
				{#if args === undefined && result === undefined && status === 'success'}<p class="ui-tclc__pending">No arguments or result.</p>{/if}
			</div>
		</div>
	</div>
</div>
