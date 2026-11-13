<!-- StatusBoard – A status page: overall banner from the worst service, per-service badge, uptime and history bars. -->
<script lang="ts">
	import Badge from './Badge.svelte';
	import StatusDot from './StatusDot.svelte';
	import './status-board.css';
	type Status = 'operational' | 'degraded' | 'outage' | 'maintenance';
	type Service = { name: string; description?: string; status: Status; uptime?: string; history?: Status[] };
	let { services = [], title, updated, class: cls }: { services?: Service[]; title?: string; updated?: string; class?: string } = $props();
	const ST = { operational: { tone: 'success', text: 'Operational' }, degraded: { tone: 'warning', text: 'Degraded' }, outage: { tone: 'danger', text: 'Outage' }, maintenance: { tone: 'info', text: 'Maintenance' } } as const;
	const RANK = { operational: 0, maintenance: 1, degraded: 2, outage: 3 };
	const HEAD = { operational: 'All systems operational', maintenance: 'Scheduled maintenance in progress', degraded: 'Some systems are degraded', outage: 'Major outage' };
	const worst = $derived(services.reduce<Status>((w, s) => (RANK[s.status] > RANK[w] ? s.status : w), 'operational'));
</script>

<section class={['ui-sbd', cls]} aria-label={title || 'System status'}>
	<div class={['ui-sbd__head', `ui-sbd__head--${ST[worst].tone}`]}>
		<StatusDot tone={ST[worst].tone} size="lg" pulse={worst !== 'operational'} />
		<div><h3 class="ui-sbd__title">{HEAD[worst]}</h3>{#if updated}<p class="ui-sbd__sub">Updated {updated}</p>{/if}</div>
	</div>
	<ul class="ui-sbd__list">
		{#each services as s, i (i)}
			{@const m = ST[s.status]}
			<li class="ui-sbd__row">
				<div class="ui-sbd__top">
					<div class="ui-sbd__name">{s.name}{#if s.description}<span>{s.description}</span>{/if}</div>
					<Badge tone={m.tone}>{m.text}</Badge>
					{#if s.uptime}<span class="ui-sbd__up">{s.uptime}</span>{/if}
				</div>
				{#if s.history}
					<div class="ui-sbd__bars" role="img" aria-label="{s.name} history, last {s.history.length} days. Currently {m.text.toLowerCase()}.">
						{#each s.history as x, k (k)}<i class={['ui-sbd__bar', `ui-sbd__bar--${ST[x].tone}`]} title="{ST[x].text}, {s.history.length - k} days ago"></i>{/each}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>
