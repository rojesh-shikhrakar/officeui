<!-- Onboarding / Tone – third step of setting up an AI assistant: a short left-aligned form for its name, tone, reply length and who it hands over to. -->
<script lang="ts">
	import OnboardingShell from './shell/OnboardingShell.svelte';
	import AssistantPreview from './shell/AssistantPreview.svelte';
	let {
		name = $bindable('Northwind Assistant'),
		tone = $bindable('Neutral'),
		length = $bindable('Balanced'),
		handover = $bindable(true),
		email = $bindable('support@northwind.com'),
		oncontinue,
		onback
	}: { name?: string; tone?: string; length?: string; handover?: boolean; email?: string; oncontinue?: (v: { name: string; tone: string; length: string; handover: boolean; email: string }) => void; onback?: () => void } = $props();
	const emailOk = $derived(!handover || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
</script>

{#snippet preview()}<AssistantPreview company="Northwind" {name} {tone} domains={['northwind.com']} />{/snippet}
{#snippet seg(label: string, opts: string[], value: string, set: (v: string) => void)}
	<div class="ui-obt__seg" role="radiogroup" aria-label={label}>{#each opts as o (o)}<button type="button" role="radio" aria-checked={value === o} onclick={() => set(o)}>{o}</button>{/each}</div>
{/snippet}

<OnboardingShell step={3} {preview} {onback}>
	<h1>How should your assistant sound?</h1>
	<p>Give it a name, a voice and someone to ask.</p>
	<form class="ui-obt" onsubmit={(e) => (e.preventDefault(), emailOk && oncontinue?.({ name, tone, length, handover, email }))}>
		<label>Name<input class="ui-ag-input" bind:value={name} required /></label>
		<span>Tone</span>{@render seg('Tone', ['Friendly', 'Neutral', 'Formal'], tone, (v) => (tone = v))}
		<span>Reply length</span>{@render seg('Reply length', ['Short', 'Balanced', 'Detailed'], length, (v) => (length = v))}
		<label class="ui-obt__row"><span><b>Hand over to a person</b><small>When it can't answer for sure</small></span><input type="checkbox" role="switch" bind:checked={handover} /></label>
		{#if handover}<input class="ui-ag-input" type="email" aria-label="Hand-over email" bind:value={email} aria-invalid={!emailOk} />{/if}
		<button class="ui-ag-btn ui-obt__go" data-variant="primary" disabled={!emailOk || !name.trim()}>Continue →</button>
	</form>
</OnboardingShell>

<style>
	.ui-obt {
		width: 100%;
		max-width: 280px;
		display: grid;
		gap: 8px;
		text-align: left;
		margin-top: 10px;
	}
	label {
		display: grid;
		gap: 4px;
		font-weight: 500;
	}
	.ui-obt > span {
		font-weight: 500;
		margin-bottom: -4px;
	}
	.ui-obt__seg {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding: 2px;
		border-radius: 8px;
		background: var(--ag-fill);
	}
	.ui-obt__seg button {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		padding: 5px;
		border-radius: 6px;
		cursor: pointer;
	}
	.ui-obt__seg button[aria-checked='true'] {
		background: var(--ag-surface);
		color: var(--ag-ink);
		box-shadow: var(--ag-shadow);
	}
	.ui-obt__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.ui-obt__row span {
		display: grid;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
		font-weight: 400;
	}
	.ui-obt__go {
		justify-content: center;
	}
</style>
