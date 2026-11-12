<!-- Integration Settings – a settings card for a connected service: on/off switch, API key, validated site address, time zone and a save bar. -->
<script lang="ts">
	import '../agents/agents.css';
	let {
		service = 'Store',
		count = 128,
		connected = 'March 4, 2026 at 09:12',
		enabled = $bindable(true),
		site = $bindable('lumen-studio.com'),
		zone = $bindable('Europe/Berlin'),
		onsave
	}: { service?: string; count?: number; connected?: string; enabled?: boolean; site?: string; zone?: string; onsave?: (v: { enabled: boolean; site: string; zone: string; key: string }) => void } = $props();
	let key = $state('');
	let dirty = $state(false);
	let saved = $state(false);
	const valid = $derived(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(site));
	const zones = ['Europe/Berlin', 'Europe/London', 'America/New_York', 'Asia/Tokyo'];
	const label = (z: string) => ({ 'Europe/Berlin': '(GMT +01:00) Berlin', 'Europe/London': '(GMT +00:00) London', 'America/New_York': '(GMT −05:00) New York', 'Asia/Tokyo': '(GMT +09:00) Tokyo' })[z];
	const touch = () => ((dirty = true), (saved = false));
	function generate() {
		key = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
		touch();
	}
</script>

<div class="ui-ag ui-ag-panel ui-ist">
	<div class="ui-ag-head"><span class="ui-ist__logo">S</span><b>{service} store <span class="ui-ag-pill" data-tone="gray">{count}</span><small class="ui-ist__sub">Connected on {connected}</small></b><input type="checkbox" role="switch" aria-label="Enable {service}" bind:checked={enabled} onchange={touch} /></div>
	<fieldset disabled={!enabled}>
		<label>API key<span class="ui-ist__field"><input class="ui-ag-input" readonly value={key} placeholder="Generate a new API key" aria-label="API key" /><button type="button" class="ui-ag-btn" data-variant="ghost" aria-label="Generate API key" onclick={generate}>⚿</button></span></label>
		<label>Site address<span class="ui-ist__field"><span class="ui-ist__pre">https://</span><input class="ui-ag-input" bind:value={site} oninput={touch} aria-invalid={!valid} aria-label="Site address" /><span class="ui-ist__ok" data-ok={valid || undefined}>{valid ? '✓' : '!'}</span></span><small>{valid ? "Your store's primary domain from Settings › Domains" : 'Enter a domain like shop.example.com'}</small></label>
		<label>Time zone<select class="ui-ag-input" bind:value={zone} onchange={touch}>{#each zones as z (z)}<option value={z}>{label(z)}</option>{/each}</select></label>
	</fieldset>
	{#if dirty || saved}
		<div class="ui-ag-foot ui-ag-in">
			<small class="ui-ag-grow ui-ag-muted">{saved ? '✓ Saved' : 'Unsaved changes'}</small>
			{#if !saved}<button class="ui-ag-btn" data-variant="ghost" onclick={() => (dirty = false)}>Discard</button><button class="ui-ag-btn" data-variant="primary" disabled={!valid} onclick={() => ((saved = true), (dirty = false), onsave?.({ enabled, site, zone, key }))}>Save</button>{/if}
		</div>
	{/if}
</div>

<style>
	.ui-ist {
		max-width: 430px;
		font-size: 12.5px;
	}
	.ui-ist__logo {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: #7ab55c;
		color: #fff;
		display: grid;
		place-items: center;
		font-weight: 700;
	}
	.ui-ist__sub {
		display: block;
		font-weight: 400;
		color: var(--ag-muted);
		font-size: 11px;
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
	}
	fieldset:disabled {
		opacity: 0.5;
	}
	label {
		display: grid;
		gap: 6px;
		padding: 12px 14px;
		font-weight: 500;
	}
	label + label {
		border-top: 1px solid var(--ag-line);
	}
	label small {
		font-weight: 400;
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-ist__field {
		display: flex;
		align-items: center;
		background: var(--ag-fill);
		border-radius: 8px;
		padding-left: 0;
	}
	.ui-ist__field .ui-ag-input {
		background: none;
		font-weight: 400;
	}
	.ui-ist__pre {
		padding-left: 10px;
		color: var(--ag-subtle);
		font-weight: 400;
	}
	.ui-ist__field .ui-ag-input + .ui-ist__ok,
	.ui-ist__field .ui-ag-btn {
		margin-right: 6px;
	}
	.ui-ist__ok {
		color: var(--ag-red);
		padding-right: 10px;
	}
	.ui-ist__ok[data-ok] {
		color: var(--ag-green);
	}
	select.ui-ag-input {
		font-weight: 400;
	}
</style>
