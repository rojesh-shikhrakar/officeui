<!-- Agent / Schedules – what your agent does again and again: the hours around now on one line with each run as a dot, every schedule with its next run, last result and an on/off switch, and a side panel to run it now or pause it. -->
<script lang="ts" module>
	export type Schedule = { name: string; every: string; next: string; when: string; last: 'Done' | 'Needs you' | 'Failed'; cost: number; on: boolean; color: string; hour: number };
</script>

<script lang="ts">
	import AppShell from './shell/AppShell.svelte';
	import { AGENT_NAV } from './shell/nav';
	import './shell/screen.css';
	const S = (name: string, every: string, next: string, when: string, last: Schedule['last'], cost: number, color: string, hour: number, on = true): Schedule => ({ name, every, next, when, last, cost, on, color, hour });
	let {
		schedules = $bindable([
			S('Competitor scan', 'Every Thursday at 10:28', 'Today 10:28', 'in a moment', 'Done', 3.1, '#f97316', 10.47),
			S('Inbox triage', 'Every 2 hours, 8:00 – 20:00', 'Today 12:00', 'in 2 h', 'Done', 0.18, '#a855f7', 12),
			S('Standup notes', 'Every weekday at 16:30', 'Today 16:30', 'in 6 h', 'Done', 0.26, '#a855f7', 16.5),
			S('Northwind numbers', 'Every weekday at 7:45', 'Tomorrow 07:45', 'in 21 h', 'Done', 0.42, '#f97316', 7.75),
			S('Weekly update', 'Every Friday at 16:00', 'Tomorrow 16:00', 'in 30 h', 'Needs you', 0.55, '#f97316', 16),
			S('Invoice reminders', 'On the 1st of every month', 'Dec 1 09:00', 'in 19 days', 'Failed', 0.3, '#a855f7', 9),
			S('Nightly evals', 'Every night at 2:00', 'Paused', '', 'Done', 4.8, '#14b8a6', 2, false)
		] as Schedule[]),
		now = 10.45
	}: { schedules?: Schedule[]; now?: number } = $props();
	let active = $state('schedules');
	let sel = $state('Competitor scan');
	let ran = $state<string | null>(null);
	const cur = $derived(schedules.find((s) => s.name === sel));
	const x = (h: number) => ((h - 7) / 12) * 100;
	const upd = (n: string, p: Partial<Schedule>) => (schedules = schedules.map((s) => (s.name === n ? { ...s, ...p } : s)));
	const tone = { Done: 'gray', 'Needs you': 'amber', Failed: 'red' } as const;
</script>

{#snippet detail()}
	{#if cur}
		<div class="ui-scr__tabs"><span class="ui-scr__tab">◷ {cur.name}</span></div>
		<div class="ui-scr__panel">
			<b><span style:color={cur.color}>■</span> {cur.name}</b><small>◷ {cur.every} · Northwind</small>
			<div class="ui-ag-row"><button class="ui-ag-btn" data-variant="primary" onclick={() => (ran = cur.name)}>▷ {ran === cur.name ? 'Running…' : 'Run now'}</button><button class="ui-ag-btn" onclick={() => upd(cur.name, { on: !cur.on })}>{cur.on ? 'Ⅱ Pause' : '▷ Resume'}</button><span class="ui-ag-grow"></span><small>€{cur.cost.toFixed(2)} per run</small></div>
			<small class="ui-scr__k">What it does</small>
			<div class="ui-ag-card ui-sch__box">Check the nine makers' sites and shops for new prices, models and campaigns – and tell me what changed since last week.</div>
			<small class="ui-scr__k">Next runs</small>
			<div class="ui-scr__rows">{#each [[cur.next, cur.when], ['Nov 19 10:28', 'in 7 days']] as [a, b] (a)}<div class="ui-scr__row"><span><b>{a}</b><small>{b}</small></span><button class="ui-ag-btn" data-variant="ghost">Skip</button></div>{/each}</div>
			<small class="ui-scr__k">Last runs</small>
			<div class="ui-scr__rows">{#each [['2 makers cut prices, 1 new model', 'Done'], ['Nothing changed', 'Done'], ['Three shops blocked the browser', 'Failed']] as [a, b] (a)}<div class="ui-scr__row"><span><b>{a}</b><small>Nov 5 10:28 · €3.42</small></span><span class="ui-ag-pill" data-tone={b === 'Failed' ? 'red' : 'gray'}>{b}</span></div>{/each}</div>
		</div>
	{/if}
{/snippet}

<AppShell workspace="Fieldwork" nav={AGENT_NAV} bind:active cards={false} aside={detail} asideWidth={240}>
	<div class="ui-scr__bar"><b>Schedules</b> <small>{schedules.filter((s) => s.on).length} / {schedules.length}</small></div>
	<div class="ui-scr">
		<small>Around now</small>
		<div class="ui-ag-card ui-sch__line">
			<div class="ui-ag-row"><small class="ui-ag-grow">Agent activity</small><small><b>1</b> action / 10 min</small></div>
			<div class="ui-sch__track">{#each [8, 10, 12, 14, 16, 18] as h (h)}<small style:left="{x(h)}%">{String(h).padStart(2, '0')}:00</small>{/each}<i class="ui-sch__now" style:left="{x(now)}%"></i>{#each schedules.filter((s) => s.on && s.hour >= 7 && s.hour <= 19) as s (s.name)}<button class="ui-sch__dot" style:left="{x(s.hour)}%" style:--c={s.color} aria-label="{s.name} at {s.next}" onclick={() => (sel = s.name)}></button>{/each}</div>
			<small>Next: <b>{schedules.find((s) => s.on)?.name}</b> · 10:28, in a moment</small>
		</div>
		<small>Schedules</small>
		<div class="ui-sch__list">
			{#each schedules as s (s.name)}
				<div class="ui-sch__row" role="button" tabindex="0" aria-current={sel === s.name || undefined} data-off={!s.on || undefined} onclick={() => (sel = s.name)} onkeydown={(e) => e.key === 'Enter' && (sel = s.name)}>
					<span style:color={s.color}>■</span><b>{s.name}</b><small class="ui-ag-grow">{s.every}</small><span>{s.on ? s.next : 'Paused'} <small>{s.on ? s.when : ''}</small></span><span class="ui-ag-pill" data-tone={tone[s.last]}>{s.last}</span><small>€{s.cost.toFixed(2)}</small>
					<input type="checkbox" role="switch" aria-label="{s.name} on" checked={s.on} onclick={(e) => e.stopPropagation()} onchange={() => upd(s.name, { on: !s.on })} />
				</div>
			{/each}
		</div>
	</div>
</AppShell>

<style>
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-sch__line {
		padding: 10px 12px;
		display: grid;
		gap: 8px;
	}
	.ui-sch__track {
		position: relative;
		height: 70px;
		border-bottom: 1px solid var(--ag-line);
		margin-bottom: 14px;
	}
	.ui-sch__track > small {
		position: absolute;
		bottom: -15px;
		transform: translateX(-50%);
		font-size: 8.5px;
	}
	.ui-sch__now {
		position: absolute;
		top: 0;
		bottom: 0;
		border-left: 1.5px solid var(--ag-blue);
	}
	.ui-sch__dot {
		position: absolute;
		top: 10px;
		width: 9px;
		height: 9px;
		margin-left: -4.5px;
		border-radius: 50%;
		border: 1.5px solid var(--c);
		background: var(--ag-surface);
		cursor: pointer;
		padding: 0;
	}
	.ui-sch__dot::after {
		content: '';
		position: absolute;
		left: 2.5px;
		top: 9px;
		height: 50px;
		border-left: 1px dashed color-mix(in srgb, var(--c) 40%, transparent);
	}
	.ui-sch__list {
		display: grid;
		gap: 2px;
	}
	.ui-sch__row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 8px;
		border-radius: 7px;
		cursor: pointer;
	}
	.ui-sch__row[aria-current] {
		background: var(--ag-fill);
	}
	.ui-sch__row[data-off] {
		opacity: 0.55;
	}
	.ui-sch__box {
		padding: 8px 10px;
		line-height: 1.5;
	}
</style>
