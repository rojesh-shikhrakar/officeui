<!-- Onboarding / Brand – second step of setting up an AI assistant: the company's name and the short forms it goes by. -->
<script lang="ts">
	import OnboardingShell from './shell/OnboardingShell.svelte';
	import AssistantPreview from './shell/AssistantPreview.svelte';
	let { names = $bindable(['Northwind', 'Northwind Co.']), oncontinue, onback }: { names?: string[]; oncontinue?: (names: string[]) => void; onback?: () => void } = $props();
	let draft = $state('');
	function add() {
		const n = draft.trim();
		if (n && !names.includes(n)) names = [...names, n];
		draft = '';
	}
</script>

{#snippet preview()}<AssistantPreview company={names[0]} name={names[0] ? `${names[0]} Assistant` : ''} domains={['northwind.com']} />{/snippet}

<OnboardingShell step={2} {preview} {onback}>
	<h1>What's your company called?</h1>
	<p>Your assistant introduces itself with it. Add short forms, too.</p>
	<form class="ui-ob__field" onsubmit={(e) => (e.preventDefault(), add())}><input placeholder="Add a short form" aria-label="Company name" bind:value={draft} /><button type="submit" class="ui-ob__go" aria-label="Add name" disabled={!draft.trim()}>→</button></form>
	<div class="ui-ob__chips">{#each names as n (n)}<span class="ui-ag-chip">{n} <button aria-label="Remove {n}" onclick={() => (names = names.filter((x) => x !== n))}>×</button></span>{/each}</div>
	<small class="ui-ag-muted">The first name is the one your assistant uses</small>
	<button class="ui-ag-btn" data-variant="primary" disabled={!names.length} onclick={() => oncontinue?.(names)}>Continue →</button>
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
			0 0 40px 6px rgba(236, 72, 153, 0.12);
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
