<!-- Onboarding Shell – a full-page setup step: logo, back and account in the top bar, the question on the left, a faded preview of the product on the right, and a footer. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../../agents/agents.css';
	let { step = 1, steps = 4, email = 'alex@northwind.com', company = 'Lumen', onback, children, preview, height = 600 }: { step?: number; steps?: number; email?: string; company?: string; onback?: () => void; children?: Snippet; preview?: Snippet; height?: number } = $props();
</script>

<div class="ui-ag ui-onb" style:--h="{height}px">
	<header><span class="ui-onb__logo">◧</span>{#if step > 1}<button class="ui-ag-btn" data-variant="ghost" onclick={() => onback?.()}>← Back</button>{/if}<span class="ui-ag-grow"></span><small>Logged in as {email}</small><button class="ui-ag-btn" data-variant="ghost">⇥ Log out</button></header>
	<div class="ui-onb__body">
		<section><span class="ui-onb__steps" aria-label="Step {step} of {steps}">{#each Array(steps) as _, i (i)}<i data-on={i < step || undefined}></i>{/each}</span>{@render children?.()}</section>
		<div class="ui-onb__preview" aria-hidden="true">{@render preview?.()}</div>
	</div>
	<footer><small>© 2026 {company}</small><small>Terms</small><small>Privacy</small></footer>
</div>

<style>
	.ui-onb {
		width: 100%;
		max-width: 1100px;
		height: var(--h);
		display: grid;
		grid-template-rows: auto 1fr auto;
		background: var(--ag-surface);
		border-radius: 10px;
		box-shadow: 0 0 0 1px var(--ag-line);
		overflow: hidden;
		font-size: 11.5px;
	}
	header,
	footer {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-onb__logo {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		background: var(--ag-ink);
		color: var(--ag-surface);
		display: grid;
		place-items: center;
		font-size: 10px;
	}
	.ui-onb__body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 0;
	}
	section {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 10px;
		padding: 0 40px;
		text-align: center;
	}
	.ui-onb__steps {
		display: flex;
		gap: 4px;
	}
	.ui-onb__steps i {
		width: 12px;
		height: 2px;
		border-radius: 1px;
		background: var(--ag-line);
	}
	.ui-onb__steps i[data-on] {
		background: var(--ag-ink);
	}
	section :global(h1) {
		margin: 0;
		font-size: 19px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	section :global(p) {
		margin: 0;
		color: var(--ag-muted);
	}
	.ui-onb__preview {
		position: relative;
		overflow: hidden;
		padding: 20px 0 0 20px;
		-webkit-mask: linear-gradient(90deg, #000 60%, transparent), linear-gradient(transparent, #000 10%, #000 85%, transparent);
		mask: linear-gradient(transparent, #000 10%, #000 80%, transparent);
	}
</style>
