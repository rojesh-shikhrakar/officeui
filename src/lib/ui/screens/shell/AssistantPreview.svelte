<!-- Assistant Preview – the faded dashboard behind the onboarding steps; it fills in as the steps are answered. -->
<script lang="ts">
	let { company = '', name = '', domains = [] as string[], tone = 'Neutral', live = false }: { company?: string; name?: string; domains?: string[]; tone?: string; live?: boolean } = $props();
</script>

<div class="ui-apv">
	<div class="ui-apv__side">{#if company}<b><i>{company[0]}</i> {company}</b>{/if}{#each Array(10) as _, i (i)}<span style:width="{40 + ((i * 37) % 50)}%"></span>{/each}</div>
	<div class="ui-apv__main">
		<div class="ui-apv__tabs"><span>Overview</span><span>Conversations</span><span>Knowledge</span><span>Settings</span></div>
		<div class="ui-apv__stats"><div><small>Knowledge</small><b>{domains.length || '–'} source{domains.length === 1 ? '' : 's'}</b></div><div><small>Conversations</small><b>0</b></div></div>
		<b>Your assistant</b>
		<div class="ui-apv__card"><b>⁘ {name || 'Your assistant'} {#if live}<em>● Live</em>{:else}<em class="ui-apv__draft">Draft</em>{/if}</b><p>Hi, I'm {name || 'your assistant'} – ask me anything about our products, plans or your account.</p><small>Also answers to <em>{company || 'your company'}</em> · {tone.toLowerCase()} tone</small></div>
		<b>Knowledge</b>
		{#each domains.length ? domains : ['—'] as d (d)}<div class="ui-apv__row"><span>▭ {d}</span>{#if domains.length}<em>● Learning</em>{/if}</div>{/each}
		<b>Test chat</b>
		<div class="ui-apv__chat"><span class="ui-apv__me">Can I change my plan mid-month?</span><small>{name || 'Assistant'}</small><span>Yes. You can change your plan at any time; the difference is prorated.</span></div>
	</div>
</div>

<style>
	.ui-apv {
		display: grid;
		grid-template-columns: 120px 1fr;
		height: 100%;
		font-size: 10px;
		border-radius: 12px 0 0 0;
		box-shadow: 0 0 0 1px var(--ag-line);
		overflow: hidden;
	}
	.ui-apv__side {
		background: var(--ag-fill);
		padding: 10px;
		display: grid;
		gap: 9px;
		align-content: start;
	}
	.ui-apv__side span {
		height: 4px;
		border-radius: 2px;
		background: var(--ag-line);
	}
	.ui-apv__side i {
		font-style: normal;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		background: var(--ag-ink);
		color: var(--ag-surface);
		display: inline-grid;
		place-items: center;
		font-size: 7px;
	}
	.ui-apv__main {
		padding: 10px 14px;
		display: grid;
		gap: 8px;
		align-content: start;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9px;
	}
	em {
		font-style: normal;
		color: var(--ag-blue);
		font-size: 9px;
		background: color-mix(in srgb, var(--ag-blue) 10%, transparent);
		border-radius: 4px;
		padding: 0 4px;
	}
	.ui-apv__draft {
		color: var(--ag-muted);
		background: var(--ag-fill);
	}
	.ui-apv__tabs {
		display: flex;
		gap: 12px;
		color: var(--ag-muted);
	}
	.ui-apv__stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.ui-apv__stats div,
	.ui-apv__card,
	.ui-apv__chat {
		padding: 8px 10px;
		border-radius: 8px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		display: grid;
		gap: 4px;
	}
	.ui-apv__card p {
		margin: 0;
		padding: 6px 8px;
		border-radius: 6px;
		background: var(--ag-fill);
	}
	.ui-apv__row {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
		border-bottom: 1px solid var(--ag-line);
	}
	.ui-apv__me {
		justify-self: start;
		padding: 3px 8px;
		border-radius: 8px;
		box-shadow: inset 0 0 0 1px var(--ag-line);
	}
</style>
