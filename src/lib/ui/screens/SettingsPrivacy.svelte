<!-- Settings / Privacy – switches for ad measurement, product analytics and model training, cookies, product emails, active sessions you can sign out, and shared chats. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let { ads = $bindable(false), analytics = $bindable(true), training = $bindable(false), subscribed = $bindable(false) }: { ads?: boolean; analytics?: boolean; training?: boolean; subscribed?: boolean } = $props();
	let sessions = $state([['▭', 'Browser on macOS', 'Vienna, Austria · Signed in with email', true], ['▯', 'Browser on iPhone', 'Vienna, Austria · Active 3 hours ago', false], ['▭', 'Desktop app on Windows', 'Berlin, Germany · Active 6 days ago', false]] as [string, string, string, boolean][]);
	let shared = $state(['Q3 launch messaging', 'Onboarding email draft']);
</script>

<SettingsShell page="privacy" title="Privacy" subtitle="Decide what you share and where you're signed in.">
	<h2>Data and cookies</h2>
	<p class="ui-scr__sub">Changes apply on all your devices. Your chats and files are never shared with ad partners.</p>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Ad measurement</b><small>Shares a hashed email and sign-up events with ad partners, so we can tell which ads work.</small></span><input type="checkbox" role="switch" bind:checked={ads} /></label>
		<label class="ui-scr__row"><span><b>Product analytics</b><small>Counts which features you use – never what you type. Works without cookies.</small></span><input type="checkbox" role="switch" bind:checked={analytics} /></label>
		<label class="ui-scr__row"><span><b>Improve models with my chats</b><small>Lets anonymised chats help train future models. Off by default; workspace chats are never used.</small></span><input type="checkbox" role="switch" bind:checked={training} /></label>
		<div class="ui-scr__row"><span><b>Cookies on this browser</b><small>Choose which cookies this device may keep</small></span><button class="ui-ag-btn">Manage cookies</button></div>
	</div>
	<h2>Emails</h2>
	<div class="ui-scr__rows"><div class="ui-scr__row"><span><b>Product updates</b><small>Occasional emails about new features and tips – never more than one a month.</small></span><button class="ui-ag-btn" data-variant={subscribed ? undefined : 'primary'} onclick={() => (subscribed = !subscribed)}>{subscribed ? 'Unsubscribe' : 'Subscribe'}</button></div></div>
	<div class="ui-ag-row"><h2 class="ui-ag-grow">Active sessions</h2><button class="ui-ag-btn" disabled={sessions.length < 2} onclick={() => (sessions = sessions.filter((s) => s[3]))}>⇥ Sign out others</button></div>
	<p class="ui-scr__sub">Devices signed in to your account. Sign out any you don't recognise.</p>
	<div class="ui-scr__rows">{#each sessions as [ic, d, m, me] (d)}<div class="ui-scr__row"><span><b>{ic} &nbsp;{d} {#if me}<span class="ui-ag-pill" data-tone="green">This device</span>{/if}</b><small>{m}</small></span>{#if !me}<button class="ui-ag-btn" data-variant="ghost" onclick={() => (sessions = sessions.filter((s) => s[1] !== d))}>Sign out</button>{/if}</div>{/each}</div>
	<h2>Shared chats</h2>
	<div class="ui-scr__rows">{#each shared as s (s)}<div class="ui-scr__row"><span><b>{s}</b><small>Anyone with the link can view</small></span><button class="ui-ag-btn" data-variant="ghost" onclick={() => (shared = shared.filter((x) => x !== s))}>Stop sharing</button></div>{:else}<div class="ui-scr__row"><span><small>You haven't shared any chats.</small></span></div>{/each}</div>
</SettingsShell>
