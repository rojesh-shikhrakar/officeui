<!-- Settings / Security – email domains to verify (with the TXT record), join by domain, single sign-on, two-step verification, session length and the identity-provider values to copy. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let {
		domains = $bindable([{ d: 'acme.com', verified: true }, { d: 'acme.io', verified: false }]),
		joinByDomain = $bindable(true),
		sso = $bindable(true),
		twoStep = $bindable(false),
		session = $bindable('30 days')
	}: { domains?: { d: string; verified: boolean }[]; joinByDomain?: boolean; sso?: boolean; twoStep?: boolean; session?: string } = $props();
	let adding = $state(false);
	let draft = $state('');
	let copied = $state<string | null>(null);
	const valid = $derived(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(draft) && !domains.some((x) => x.d === draft));
	const urls = [['Audience URI', 'SP entity ID', 'https://app.example.com/saml/acme/metadata'], ['ACS URL', 'Assertion consumer service', 'https://app.example.com/saml/acme/acs']];
	async function copy(k: string, v: string) {
		await navigator.clipboard?.writeText(v).catch(() => {});
		copied = k;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<SettingsShell page="security" title="Security" subtitle="Decide who can sign in to your workspace and how.">
	<div class="ui-ag-row"><span class="ui-ag-grow"><h2>Email domains</h2><small>Verify the domains your team signs in with. Verified domains unlock joining by domain and single sign-on.</small></span><button class="ui-ag-btn" onclick={() => (adding = !adding)}>+ Add domain</button></div>
	<div class="ui-scr__rows">
		{#each domains as x (x.d)}<div class="ui-scr__row"><span><b>⊕ {x.d} <span class="ui-ag-pill" data-tone={x.verified ? 'green' : 'gray'}>{x.verified ? 'Verified' : 'Pending'}</span></b></span>{#if !x.verified}<button class="ui-ag-btn" onclick={() => (domains = domains.map((y) => (y.d === x.d ? { ...y, verified: true } : y)))}>Verify</button>{/if}</div>{/each}
		{#if domains.some((x) => !x.verified)}<div class="ui-scr__row"><span><small>ⓘ Add a TXT record <code>workspace-verify=7f3a9c</code> to the domain's DNS, then press Verify.</small></span></div>{/if}
		{#if adding}<form class="ui-scr__row ui-ag-in" onsubmit={(e) => (e.preventDefault(), valid && ((domains = [...domains, { d: draft, verified: false }]), (draft = ''), (adding = false)))}><input class="ui-ag-input ui-ag-grow" placeholder="example.com" aria-label="Domain" bind:value={draft} /><button class="ui-ag-btn" data-variant="primary" disabled={!valid}>Add</button></form>{/if}
	</div>
	<div class="ui-scr__rows"><label class="ui-scr__row"><span><b>Join by domain</b><small>Anyone with a verified address joins as a member without an invite</small></span><input type="checkbox" role="switch" bind:checked={joinByDomain} disabled={!domains.some((x) => x.verified)} /></label></div>
	<h2>Sign-in</h2>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Require single sign-on (SAML)</b><small>Members at a verified domain sign in through your identity provider</small></span><input type="checkbox" role="switch" bind:checked={sso} /></label>
		<label class="ui-scr__row"><span><b>Two-step verification</b><small>Everyone without SSO adds a code from an authenticator app</small></span><input type="checkbox" role="switch" bind:checked={twoStep} /></label>
		<label class="ui-scr__row"><span><b>Session length</b><small>How long people stay signed in without activity</small></span><select class="ui-ag-input" bind:value={session}>{#each ['1 day', '7 days', '30 days', '90 days'] as s (s)}<option>{s}</option>{/each}</select></label>
	</div>
	{#if sso}
		<h2>Identity provider</h2>
		<p class="ui-scr__sub">Copy these into your identity provider, then paste the metadata URL it gives you.</p>
		<div class="ui-scr__rows">{#each urls as [k, d, v] (k)}<div class="ui-scr__row"><span><b>{k}</b><small>{d}</small></span><code class="ui-ss__url">{v}</code><button class="ui-ag-btn" onclick={() => copy(k, v)}>{copied === k ? '✓ Copied' : '⧉ Copy'}</button></div>{/each}</div>
	{/if}
</SettingsShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	code {
		font-size: 9.5px;
		background: var(--ag-fill);
		padding: 1px 4px;
		border-radius: 4px;
	}
	.ui-ss__url {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 4px 6px;
	}
</style>
