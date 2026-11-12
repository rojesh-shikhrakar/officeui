<!-- Settings / Profile – picture, name, role and email as rows, time preferences, and personal context the assistant adapts to. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let { first = $bindable('Alex'), last = $bindable('Morgan'), role = $bindable(''), email = $bindable('alex@acme.com'), zone = $bindable('Europe/Vienna'), week = $bindable('Monday'), about = $bindable('') }: { first?: string; last?: string; role?: string; email?: string; zone?: string; week?: string; about?: string } = $props();
	let editingEmail = $state(false);
</script>

<SettingsShell page="profile" title="Profile" subtitle="Manage your personal details." user="{first} {last}">
	<div class="ui-ag-card ui-sp__note">ⓘ Changes to your profile apply to all of your workspaces.</div>
	<div class="ui-scr__rows">
		<div class="ui-scr__row"><span><b>Profile picture</b><small>PNG, JPEG or GIF, under 10 MB</small></span><span class="ui-ag-avatar" style:background="#dbe7ff" style:color="#2f6bff">{first[0] ?? ''}{last[0] ?? ''}</span><button class="ui-ag-btn">⇪ Upload</button></div>
		<label class="ui-scr__row"><span><b>First name</b></span><input class="ui-ag-input" bind:value={first} /></label>
		<label class="ui-scr__row"><span><b>Last name</b></span><input class="ui-ag-input" bind:value={last} /></label>
		<label class="ui-scr__row"><span><b>Role</b><small>Helps tailor suggestions to your work</small></span><select class="ui-ag-input" bind:value={role}><option value="">Choose your role</option>{#each ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Operations'] as r (r)}<option>{r}</option>{/each}</select></label>
		<div class="ui-scr__row"><span><b>Email</b></span>{#if editingEmail}<input class="ui-ag-input" type="email" aria-label="Email" bind:value={email} /><button class="ui-ag-btn" data-variant="primary" onclick={() => (editingEmail = false)}>Save</button>{:else}<span class="ui-ag-muted">{email}</span><button class="ui-ag-btn" onclick={() => (editingEmail = true)}>Change</button>{/if}</div>
	</div>
	<h2>Time preferences</h2>
	<p class="ui-scr__sub">Used for reminders, schedules and reports.</p>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Timezone</b></span><select class="ui-ag-input" bind:value={zone}>{#each ['Europe/Vienna', 'Europe/London', 'America/New_York', 'Asia/Tokyo'] as z (z)}<option>{z}</option>{/each}</select></label>
		<label class="ui-scr__row"><span><b>Start week on</b></span><select class="ui-ag-input" bind:value={week}><option>Monday</option><option>Sunday</option></select></label>
	</div>
	<h2>Personal context</h2>
	<p class="ui-scr__sub">Describe what you do and how you work, so the assistant can adapt to you.</p>
	<textarea class="ui-ag-input" rows="3" maxlength="500" aria-label="Personal context" placeholder="E.g. I lead product at a small team, prefer short answers and write in British English." bind:value={about}></textarea>
	<small>{about.length}/500</small>
</SettingsShell>

<style>
	.ui-sp__note {
		padding: 8px 10px;
		color: var(--ag-muted);
	}
</style>
