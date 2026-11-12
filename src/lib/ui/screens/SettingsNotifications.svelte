<!-- Settings / Notifications – a daily digest with a send time, a weekly usage report, and where each notification type is delivered. -->
<script lang="ts">
	import SettingsShell from './shell/SettingsShell.svelte';
	let { digest = $bindable(true), at = $bindable('08:00'), weekly = $bindable(false) }: { digest?: boolean; at?: string; weekly?: boolean } = $props();
	let types = $state([['Mentions', 'Someone mentions you in a chat or a file', 'Email and mobile'], ['Replies', 'Answers to your comments', 'Email and mobile'], ['Approvals', 'An agent waits for your OK before it acts', 'Email and mobile'], ['Finished runs', 'An agent you started is done', 'Mobile'], ['Failed runs', 'A run stopped with an error or ran out of budget', 'Email and mobile'], ['Shared with you', 'Chats, folders and agents others share', 'Email'], ['Access requests', 'People asking to join a folder or agent you own', 'Email']]);
</script>

<SettingsShell page="notifications" title="Notifications" subtitle="Choose what you hear about and where. Everything still lands in your inbox.">
	<h2>Digest</h2>
	<p class="ui-scr__sub">One email instead of many – what happened while you were away.</p>
	<div class="ui-scr__rows">
		<label class="ui-scr__row"><span><b>Daily digest</b><small>Approvals waiting, runs that finished or failed, and mentions</small></span><input type="checkbox" role="switch" bind:checked={digest} /></label>
		{#if digest}<label class="ui-scr__row"><span><b>Send at</b><small>In your time zone, Europe/Vienna</small></span><input class="ui-ag-input" type="time" bind:value={at} /></label>{/if}
		<label class="ui-scr__row"><span><b>Weekly usage report</b><small>Credits spent, the busiest agents and the models used, every Monday</small></span><input type="checkbox" role="switch" bind:checked={weekly} /></label>
	</div>
	<h2>Notification types</h2>
	<p class="ui-scr__sub">Choose where each one is delivered.</p>
	<div class="ui-scr__rows">
		<div class="ui-scr__row"><span><small>Notify me about</small></span><small>Notify on</small></div>
		{#each types as t, i (t[0])}<label class="ui-scr__row"><span><b>{t[0]}</b><small>{t[1]}</small></span><select class="ui-ag-input" value={t[2]} onchange={(e) => (types[i] = [t[0], t[1], e.currentTarget.value])}>{#each ['Email and mobile', 'Email', 'Mobile', 'Off'] as o (o)}<option>{o}</option>{/each}</select></label>{/each}
	</div>
</SettingsShell>
