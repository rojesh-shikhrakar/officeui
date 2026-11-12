<!-- Onboarding / Website – first step of setting up an AI assistant: the website, docs and help center it learns from, added as chips. -->
<script lang="ts">
	import OnboardingShell from './shell/OnboardingShell.svelte';
	import AssistantPreview from './shell/AssistantPreview.svelte';
	let { domains = $bindable(['northwind.com']), oncontinue }: { domains?: string[]; oncontinue?: (domains: string[]) => void } = $props();
	let draft = $state('');
	const valid = $derived(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(draft.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')));
	function add() {
		const d = draft.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
		if (valid && !domains.includes(d)) domains = [...domains, d];
		draft = '';
	}
</script>

{#snippet preview()}<AssistantPreview company={domains[0]?.split('.')[0].replace(/^./, (c) => c.toUpperCase())} {domains} />{/snippet}

<OnboardingShell step={1} {preview}>
	<h1>What's your company's website?</h1>
	<p>Your assistant learns from it. Add your docs or help center, too.</p>
	<form class="ui-ob__field" onsubmit={(e) => (e.preventDefault(), add())}><input placeholder={domains.length ? 'Add another domain' : 'yourcompany.com'} aria-label="Website" bind:value={draft} aria-invalid={!!draft && !valid} /><button type="submit" class="ui-ob__go" aria-label="Add domain" disabled={!valid}>→</button></form>
	<div class="ui-ob__chips">{#each domains as d (d)}<span class="ui-ag-chip">▭ {d} <button aria-label="Remove {d}" onclick={() => (domains = domains.filter((x) => x !== d))}>×</button></span>{/each}</div>
	<button class="ui-ag-btn" data-variant="primary" disabled={!domains.length} onclick={() => oncontinue?.(domains)}>Continue →</button>
</OnboardingShell>

<style>
	.ui-ob__field {
		width: 100%;
		max-width: 280px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 5px 5px 10px;
		border-radius: 10px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 0 40px 6px rgba(236, 72, 153, 0.12),
			0 0 60px 10px rgba(99, 102, 241, 0.1);
		margin-top: 10px;
	}
	.ui-ob__field input {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
	.ui-ob__go {
		width: 22px;
		height: 22px;
		border: 0;
		border-radius: 6px;
		background: var(--ag-ink);
		color: var(--ag-surface);
		cursor: pointer;
	}
	.ui-ob__go:disabled {
		opacity: 0.4;
	}
	.ui-ob__chips {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		justify-content: center;
	}
	.ui-ob__chips button {
		border: 0;
		background: none;
		color: var(--ag-muted);
		cursor: pointer;
	}
</style>
