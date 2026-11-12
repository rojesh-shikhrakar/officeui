<!-- Stepper Form – a multi-step form with a progress header, validated fields and Back / Continue, ending in a review step. -->
<script lang="ts">
	import '../agents/agents.css';
	let { domain = 'app.example.com/', onsubmit }: { domain?: string; onsubmit?: (v: Record<string, string>) => void } = $props();
	const steps = ['Workspace', 'Team', 'Plan', 'Review'];
	let step = $state(0);
	let done = $state(false);
	let v = $state({ name: 'Northwind Studio', slug: 'northwind-studio', invites: '', size: '2–10', plan: 'Team' });
	let slugTouched = $state(false);
	const slugOk = $derived(/^[a-z0-9-]+$/.test(v.slug));
	const emails = $derived(v.invites.split(/[\s,]+/).filter(Boolean));
	const invitesOk = $derived(emails.every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)));
	const ok = $derived([v.name.trim() && slugOk, invitesOk, !!v.plan, true][step]);
	function name(e: Event) {
		v.name = (e.currentTarget as HTMLInputElement).value;
		if (!slugTouched) v.slug = v.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}
	function next() {
		if (!ok) return;
		if (step < steps.length - 1) step++;
		else ((done = true), onsubmit?.(v));
	}
</script>

<form class="ui-ag ui-ag-panel ui-sf" onsubmit={(e) => (e.preventDefault(), next())}>
	<ol class="ui-sf__steps">{#each steps as s, i (s)}<li data-state={i < step || done ? 'done' : i === step ? 'current' : undefined}><span>{i < step || done ? '✓' : i + 1}</span>{s}</li>{/each}</ol>
	{#if done}
		<div class="ui-ag-body ui-ag-in ui-sf__done"><span class="ui-sf__check">✓</span><b>{v.name} is ready</b><p class="ui-ag-muted">{domain}{v.slug} · {v.plan} plan{emails.length ? ` · ${emails.length} invite${emails.length > 1 ? 's' : ''} sent` : ''}</p></div>
	{:else}
		{#key step}
			<div class="ui-ag-body ui-ag-in">
				{#if step === 0}
					<h4>Name your workspace</h4><p class="ui-ag-muted">This is where your team's projects live.</p>
					<label>Workspace name<input class="ui-ag-input" value={v.name} oninput={name} required /></label>
					<label>Workspace URL<span class="ui-sf__url"><span class="ui-ag-muted">{domain}</span><input bind:value={v.slug} oninput={() => (slugTouched = true)} aria-invalid={!slugOk} /></span><small data-err={!slugOk || undefined}>Lowercase letters, numbers and dashes</small></label>
				{:else if step === 1}
					<h4>Invite your team</h4><p class="ui-ag-muted">They'll get an email to join. You can skip this.</p>
					<label>Email addresses<textarea class="ui-ag-input" rows="3" bind:value={v.invites} placeholder="ana@example.com, sam@example.com" aria-invalid={!invitesOk}></textarea><small data-err={!invitesOk || undefined}>{invitesOk ? `${emails.length} invite${emails.length === 1 ? '' : 's'}` : 'Check the email addresses'}</small></label>
					<label>Team size<select class="ui-ag-input" bind:value={v.size}>{#each ['Just me', '2–10', '11–50', '50+'] as s (s)}<option>{s}</option>{/each}</select></label>
				{:else if step === 2}
					<h4>Pick a plan</h4><p class="ui-ag-muted">Change it any time.</p>
					<div class="ui-sf__plans" role="radiogroup" aria-label="Plan">
						{#each [['Starter', 'For trying things out'], ['Team', 'For growing teams'], ['Business', 'Advanced controls']] as [p, d] (p)}<label class="ui-sf__plan"><input type="radio" name="plan" value={p} bind:group={v.plan} /><b>{p}</b><small>{d}</small></label>{/each}
					</div>
				{:else}
					<h4>Review</h4><p class="ui-ag-muted">Make sure everything looks right.</p>
					<dl>{#each [['Workspace', v.name, 0], ['URL', domain + v.slug, 0], ['Invites', emails.length ? emails.join(', ') : 'None', 1], ['Team size', v.size, 1], ['Plan', v.plan, 2]] as [k, val, s] (k)}<dt>{k}</dt><dd>{val}</dd><dd><button type="button" class="ui-ag-btn" data-variant="ghost" onclick={() => (step = +s)}>Edit</button></dd>{/each}</dl>
				{/if}
			</div>
		{/key}
		<div class="ui-ag-foot">{#if step}<button type="button" class="ui-ag-btn" data-variant="ghost" onclick={() => step--}>Back</button>{/if}<span class="ui-ag-grow"></span><button class="ui-ag-btn" data-variant="primary" disabled={!ok}>{step === steps.length - 1 ? 'Create workspace' : 'Continue'}</button></div>
	{/if}
</form>

<style>
	.ui-sf {
		max-width: 360px;
		font-size: 12px;
	}
	.ui-sf__steps {
		list-style: none;
		margin: 0;
		padding: 12px 14px 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}
	.ui-sf__steps li {
		border-top: 2px solid var(--ag-line);
		padding-top: 8px;
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
		display: flex;
		gap: 6px;
		transition: border-color 0.25s;
	}
	.ui-sf__steps li[data-state] {
		border-color: var(--ag-blue);
		color: var(--ag-ink);
	}
	.ui-sf__steps li[data-state='done'] span {
		color: var(--ag-blue);
	}
	.ui-ag-body {
		display: grid;
		gap: 8px;
	}
	h4 {
		margin: 4px 0 0;
		font-size: 13px;
		font-weight: 500;
	}
	p {
		margin: -6px 0 4px;
	}
	label {
		display: grid;
		gap: 5px;
		font-weight: 500;
	}
	label small {
		font-weight: 400;
		color: var(--ag-muted);
	}
	small[data-err] {
		color: var(--ag-red);
	}
	.ui-sf__url {
		display: flex;
		align-items: center;
		background: var(--ag-fill);
		border-radius: 8px;
		padding-left: 9px;
		font-weight: 400;
	}
	.ui-sf__url input {
		flex: 1;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		color: var(--ag-ink);
		padding: 7px 9px 7px 0;
	}
	textarea,
	select {
		font-weight: 400;
		resize: none;
	}
	.ui-sf__plans {
		display: grid;
		gap: 6px;
	}
	.ui-sf__plan {
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 8px;
		row-gap: 0;
		padding: 8px 10px;
		border-radius: 9px;
		box-shadow: var(--ag-shadow);
		cursor: pointer;
	}
	.ui-sf__plan:has(:checked) {
		box-shadow: 0 0 0 1.5px var(--ag-blue);
	}
	.ui-sf__plan input {
		grid-row: span 2;
		accent-color: var(--ag-blue);
	}
	.ui-sf__plan b {
		font-weight: 500;
	}
	dl {
		display: grid;
		grid-template-columns: 90px 1fr auto;
		align-items: center;
		gap: 4px 8px;
		margin: 0;
	}
	dt {
		color: var(--ag-muted);
	}
	dd {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ui-sf__done {
		justify-items: center;
		text-align: center;
		padding: 24px;
	}
	.ui-sf__check {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: color-mix(in srgb, var(--ag-green) 15%, transparent);
		color: var(--ag-green);
		font-size: 16px;
	}
	.ui-sf__done b {
		font-weight: 500;
		font-size: 14px;
	}
</style>
