<!-- Setup Guide – an onboarding checklist in collapsible sections with overall progress; collapse it to a pill or dismiss it. -->
<script lang="ts" module>
	export type GuideSection = { title: string; steps: { title: string; done?: boolean }[] };
</script>

<script lang="ts">
	import '../agents/agents.css';
	let {
		sections = $bindable([
			{ title: 'Set up your workspace', steps: [{ title: 'Choose a workspace name' }, { title: 'Invite your teammates to collaborate' }, { title: 'Connect your calendar' }] },
			{ title: 'Set up billing', steps: [{ title: 'Add a payment method' }, { title: 'Pick a plan' }] },
			{ title: 'Verify your account', steps: [{ title: 'Confirm your email', done: true }] }
		] as GuideSection[]),
		ondismiss
	}: { sections?: GuideSection[]; ondismiss?: () => void } = $props();
	let open = $state(0);
	let mini = $state(false);
	let gone = $state(false);
	const all = $derived(sections.flatMap((s) => s.steps));
	const done = $derived(all.filter((s) => s.done).length);
	const tick = (si: number, i: number) => (sections = sections.map((s, a) => (a !== si ? s : { ...s, steps: s.steps.map((st, b) => (b === i ? { ...st, done: !st.done } : st)) })));
	// The next step in a section is the first undone one; later ones are dimmed
	const next = (s: GuideSection) => s.steps.findIndex((x) => !x.done);
</script>

{#if gone}
	<button class="ui-ag-btn" onclick={() => (gone = false)}>Show setup guide</button>
{:else if mini}
	<button class="ui-ag ui-ag-chip ui-sg__mini ui-ag-in" onclick={() => (mini = false)}>Setup guide <span class="ui-ag-bar"><i style:width="{(done / all.length) * 100}%"></i></span> {done}/{all.length}</button>
{:else}
	<div class="ui-ag ui-ag-panel ui-sg ui-ag-in">
		<div class="ui-ag-head"><b class="ui-ag-grow">Setup guide</b><button class="ui-ag-btn" data-variant="ghost">Edit</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Collapse" onclick={() => (mini = true)}>⤡</button><button class="ui-ag-btn" data-variant="ghost" aria-label="Dismiss" onclick={() => ((gone = true), ondismiss?.())}>×</button></div>
		<div class="ui-ag-row ui-sg__prog"><span class="ui-ag-bar ui-ag-grow"><i style:width="{(done / all.length) * 100}%"></i></span><small class="ui-ag-muted">{done}/{all.length}</small></div>
		{#each sections as s, si (s.title)}
			{@const complete = s.steps.every((x) => x.done)}
			<div class="ui-sg__sec" data-open={open === si || undefined}>
				<button class="ui-sg__hd" aria-expanded={open === si} onclick={() => (open = open === si ? -1 : si)}><span class:ui-sg__done={complete}>{s.title}</span><span>{open === si ? '⌃' : '⌄'}</span></button>
				{#if open === si}
					<div class="ui-sg__steps">
						{#each s.steps as st, i (st.title)}
							<label data-dim={!st.done && i !== next(s) || undefined}><input type="checkbox" checked={!!st.done} onchange={() => tick(si, i)} /><span class:ui-sg__done={st.done}>{st.title}</span></label>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.ui-sg {
		max-width: 250px;
		font-size: 12px;
	}
	.ui-sg b {
		font-weight: 500;
		font-size: 13px;
	}
	.ui-sg__prog {
		padding: 0 12px 10px;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-sg__sec {
		margin: 4px;
		border-radius: 9px;
	}
	.ui-sg__sec[data-open] {
		background: var(--ag-fill);
	}
	.ui-sg__hd {
		width: 100%;
		display: flex;
		justify-content: space-between;
		border: 0;
		background: none;
		font: inherit;
		font-weight: 500;
		color: var(--ag-ink);
		padding: 8px;
		cursor: pointer;
	}
	.ui-sg__steps {
		padding: 0 8px 6px;
		display: grid;
	}
	label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 0;
		cursor: pointer;
	}
	label[data-dim] {
		color: var(--ag-muted);
	}
	input {
		appearance: none;
		width: 13px;
		height: 13px;
		margin: 0;
		border-radius: 50%;
		border: 1.3px solid var(--ag-subtle);
		display: grid;
		place-items: center;
	}
	label[data-dim] input {
		border-style: dashed;
	}
	input:checked {
		border-color: var(--ag-blue);
		background: var(--ag-blue);
		box-shadow: inset 0 0 0 2.5px var(--ag-surface);
	}
	.ui-sg__done {
		text-decoration: line-through;
		color: var(--ag-muted);
	}
	.ui-sg__mini .ui-ag-bar {
		width: 40px;
	}
</style>
