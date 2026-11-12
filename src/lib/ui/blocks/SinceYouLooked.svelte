<!-- Since You Looked – an activity curve for the time you were away with done / need-you / failed counts. Part of the mission blocks. -->
<script lang="ts">
	import { linePath, areaPath } from '../agents/chart';
	import { ACTIVITY } from './mission';
	let { since = '9:44 AM', until = '10:29 AM', away = '45m', done = 4, needs = 2, failed = 1, values = ACTIVITY }: { since?: string; until?: string; away?: string; done?: number; needs?: number; failed?: number; values?: number[] } = $props();
	const marks = [[3, 'ink'], [6, 'ink'], [13, 'ink'], [18, 'red'], [20, 'amber'], [22, 'amber'], [24, 'ink']] as const;
	const y = (v: number) => 70 - 4 - v * 62;
</script>

<div class="ui-ag-card ui-syl">
	<div class="ui-ag-row"><span class="ui-ag-grow"><b>Since you looked</b><small>Since {since} <span class="ui-ag-pill" data-tone="gray">{away}</span></small></span><small>◷ <b>{done}</b> done &nbsp; ⚇ <b>{needs}</b> need you &nbsp; ⚠ <b>{failed}</b> failed</small></div>
	<svg viewBox="0 0 400 70" preserveAspectRatio="none" role="img" aria-label="Agent activity since {since}: {done} done, {needs} need you, {failed} failed">
		<path d={areaPath(values, 400, 70, 1.1)} fill="url(#ui-syl-g)" />
		<defs><linearGradient id="ui-syl-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--ag-ink)" stop-opacity="0.06" /><stop offset="1" stop-color="var(--ag-ink)" stop-opacity="0" /></linearGradient></defs>
		<path d={linePath(values, 400, 70, 1.1)} fill="none" stroke="var(--ag-subtle)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
	</svg>
	<div class="ui-syl__dots" aria-hidden="true">{#each marks as [i, tone] (i)}<i data-tone={tone} style:left="{(i / (values.length - 1)) * 100}%" style:top="{((70 - 2 - (values[i] / 1.1) * 66) / 70) * 100}%"></i>{/each}</div>
	<div class="ui-ag-row"><small class="ui-ag-grow">{since}</small><small>{until}</small></div>
</div>

<style>
	.ui-syl {
		position: relative;
		padding: 12px;
		display: grid;
		gap: 6px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 10px;
	}
	.ui-ag-grow small {
		display: block;
	}
	svg {
		width: 100%;
		height: 70px;
	}
	.ui-syl__dots {
		position: absolute;
		left: 12px;
		right: 12px;
		top: 50px;
		height: 70px;
		pointer-events: none;
	}
	.ui-syl__dots i {
		position: absolute;
		width: 5px;
		height: 5px;
		margin: -2.5px;
		border-radius: 50%;
		background: var(--ag-muted);
	}
	.ui-syl__dots i[data-tone='red'] {
		background: var(--ag-red);
	}
	.ui-syl__dots i[data-tone='amber'] {
		background: var(--ag-amber);
	}
</style>
