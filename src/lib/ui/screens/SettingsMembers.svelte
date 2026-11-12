<!-- Settings / Teams – members and teams: seats at a glance, search, a role filter, invite by email, change roles and plans, and remove people. -->
<script lang="ts" module>
	export type Member = { name: string; email: string; role: 'Admin' | 'Member' | 'Viewer'; plan: string; usage: number; you?: boolean; invited?: boolean };
</script>

<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let {
		members = $bindable([
			{ name: 'Alex Morgan', email: 'alex@acme.com', role: 'Admin', plan: 'Business', usage: 68, you: true },
			{ name: 'Jonas Weber', email: 'jonas@acme.com', role: 'Admin', plan: 'Business', usage: 42 },
			{ name: 'Mara Klein', email: 'mara@acme.com', role: 'Member', plan: 'Pro', usage: 81 },
			{ name: 'Lea Braun', email: 'lea@acme.com', role: 'Member', plan: 'Pro', usage: 23 },
			{ name: 'Tom Fischer', email: 'tom@acme.com', role: 'Viewer', plan: 'Free', usage: 5 },
			{ name: '', email: 'sam@acme.com', role: 'Member', plan: 'Pro', usage: 0, invited: true }
		] as Member[]),
		seats = 10
	}: { members?: Member[]; seats?: number } = $props();
	let tab = $state<'Members' | 'Teams'>('Members');
	let q = $state('');
	let role = $state('');
	let inviting = $state(false);
	let email = $state('');
	const shown = $derived(members.filter((m) => (!role || m.role === role) && (m.name + m.email).toLowerCase().includes(q.toLowerCase())));
	const valid = $derived(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !members.some((m) => m.email === email));
	const upd = (e: string, p: Partial<Member>) => (members = members.map((m) => (m.email === e ? { ...m, ...p } : m)));
	function invite() {
		if (!valid) return;
		members = [...members, { name: '', email, role: 'Member', plan: 'Pro', usage: 0, invited: true }];
		email = '';
		inviting = false;
	}
	const ini = (m: Member) => (m.name ? m.name.split(' ').map((w) => w[0]).join('') : '✉');
</script>

<SettingsShell page="members" title="Members & teams" subtitle="Invite people, set what they can do and group them into teams." wide>
	<div class="ui-ag-tabs" role="tablist">{#each ['Members', 'Teams'] as t (t)}<button class="ui-ag-tab" role="tab" aria-selected={tab === t} onclick={() => (tab = t as typeof tab)}>{t}</button>{/each}</div>
	{#if tab === 'Members'}
		<div class="ui-ag-card ui-sm__stats"><span><small>Members</small><b>{members.length}</b><small>{members.filter((m) => !m.invited).length} active · {members.filter((m) => m.invited).length} invited</small></span><span><small>Seats</small><b>{members.length} <small>of {seats}</small></b><span class="ui-ag-bar"><i style:width="{(members.length / seats) * 100}%"></i></span></span><span><small>Admins</small><b>{members.filter((m) => m.role === 'Admin').length}</b><small>Can invite, remove and bill</small></span></div>
		<div class="ui-ag-row"><input class="ui-ag-input" placeholder="⌕ Search name or email" aria-label="Search members" bind:value={q} /><select class="ui-ag-input ui-sm__f" aria-label="Role" bind:value={role}><option value="">Role</option><option>Admin</option><option>Member</option><option>Viewer</option></select><span class="ui-ag-grow"></span><button class="ui-ag-btn" data-variant="ghost">⤓ Export</button><button class="ui-ag-btn" data-variant="primary" disabled={members.length >= seats} onclick={() => (inviting = !inviting)}>Invite members</button></div>
		{#if inviting}<form class="ui-ag-row ui-ag-in" onsubmit={(e) => (e.preventDefault(), invite())}><input class="ui-ag-input ui-ag-grow" type="email" placeholder="name@acme.com" aria-label="Email to invite" bind:value={email} /><button class="ui-ag-btn" data-variant="primary" disabled={!valid}>Send invite</button></form>{/if}
		<table>
			<thead><tr><th>Name</th><th>Role</th><th>Plan</th><th>Usage</th><th></th></tr></thead>
			<tbody>{#each shown as m (m.email)}<tr><td><span class="ui-sm__who"><span class="ui-ag-avatar">{ini(m)}</span><span>{#if m.name}<b>{m.name}</b>{#if m.you} <small>(You)</small>{/if}<small>{m.email}</small>{:else}<b>{m.email}</b> <span class="ui-ag-pill" data-tone="gray">Invited</span>{/if}</span></span></td><td><select class="ui-ag-input" aria-label="Role of {m.name || m.email}" value={m.role} disabled={m.you} onchange={(e) => upd(m.email, { role: e.currentTarget.value as Member['role'] })}><option>Admin</option><option>Member</option><option>Viewer</option></select></td><td><span class="ui-ag-pill" data-tone={m.plan === 'Business' ? 'blue' : 'gray'}>{m.plan}</span></td><td>{#if m.invited}–{:else}<span class="ui-sm__use"><span class="ui-ag-bar"><i style:width="{m.usage}%" style:background={m.usage > 80 ? 'var(--ag-amber)' : undefined}></i></span><small>{m.usage}%</small></span>{/if}</td><td>{#if !m.you}<button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {m.name || m.email}" onclick={() => (members = members.filter((x) => x.email !== m.email))}>×</button>{/if}</td></tr>{/each}</tbody>
		</table>
	{:else}
		<div class="ui-scr__rows">{#each [['Design', 3], ['Engineering', 2], ['Leadership', 2]] as [t, n] (t)}<div class="ui-scr__row"><span><b>{t}</b><small>{n} members</small></span><button class="ui-ag-btn" data-variant="ghost">Manage</button></div>{/each}</div>
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
	.ui-sm__stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding: 12px;
		gap: 20px;
	}
	.ui-sm__stats > span {
		display: grid;
		gap: 3px;
	}
	.ui-sm__stats b {
		font-size: 14px;
	}
	.ui-sm__f {
		width: 90px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		text-align: left;
		font-weight: 400;
		color: var(--ag-muted);
		padding: 6px;
		border-bottom: 1px solid var(--ag-line);
	}
	td {
		padding: 7px 6px;
		border-bottom: 1px solid var(--ag-line);
	}
	td select {
		width: 90px;
	}
	.ui-sm__who {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ui-sm__who > span:last-child small:last-child {
		display: block;
	}
	.ui-sm__use {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.ui-sm__use .ui-ag-bar {
		width: 50px;
	}
</style>
