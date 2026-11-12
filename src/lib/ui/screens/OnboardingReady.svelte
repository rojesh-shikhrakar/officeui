<!-- Onboarding / Ready – last step of setting up an AI assistant: a quiet summary of what it learned with an Edit link on each line, and Open dashboard. -->
<script lang="ts">
	import OnboardingShell from './shell/OnboardingShell.svelte';
	import AssistantPreview from './shell/AssistantPreview.svelte';
	let {
		summary = [['Learns from', 'northwind.com', 1], ['Name', '⁘ Northwind Assistant', 2], ['Voice', 'Neutral, balanced replies', 3], ['Hands over to', 'support@northwind.com', 3]] as [string, string, number][],
		onedit,
		onopen
	}: { summary?: [string, string, number][]; onedit?: (step: number) => void; onopen?: () => void } = $props();
	let opening = $state(false);
</script>

{#snippet preview()}<AssistantPreview company="Northwind" name="Northwind Assistant" domains={['northwind.com']} live />{/snippet}

<OnboardingShell step={4} {preview}>
	<h1>Your assistant is ready</h1>
	<p>Here's what it knows. You can change all of it later.</p>
	<dl class="ui-obr">{#each summary as [k, v, s] (k)}<dt>{k}</dt><dd>{v}</dd><dd><button class="ui-ag-btn" data-variant="ghost" onclick={() => onedit?.(s)}>Edit</button></dd>{/each}</dl>
	<button class="ui-ag-btn ui-obr__go" data-variant="primary" onclick={() => ((opening = true), onopen?.())}>{opening ? '◌ Opening…' : 'Open dashboard →'}</button>
</OnboardingShell>

<style>
	.ui-obr {
		width: 100%;
		max-width: 280px;
		display: grid;
		grid-template-columns: 80px 1fr auto;
		align-items: center;
		gap: 6px 10px;
		text-align: left;
		margin: 12px 0 4px;
	}
	dt {
		color: var(--ag-muted);
	}
	dd {
		margin: 0;
		font-weight: 500;
	}
	.ui-obr__go {
		width: 100%;
		max-width: 280px;
		justify-content: center;
	}
</style>
