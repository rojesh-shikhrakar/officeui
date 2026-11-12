<!-- Tool Access Map – which tools each agent may use, drawn as wires: used tools on the left with call counts, unused or blocked ones on the right; click a blocked tool to grant it. -->
<script lang="ts" module>
	export type ToolNode = { name: string; mark: string; calls?: number; last?: string; running?: boolean; access: boolean };
	export type AgentSpec = { name: string; mark: string; color: string; model: string; task: string; tools: ToolNode[] };
</script>

<script lang="ts">
	import './agents.css';
	const T = (name: string, mark: string, o: Partial<ToolNode> = {}): ToolNode => ({ name, mark, access: true, ...o });
	let {
		agents = $bindable([
			{ name: 'Researcher', mark: '✳', color: '#d97757', model: 'Atlas Max', task: 'Compare pricing pages of 5 competitors', tools: [T('Web search', '⌕', { calls: 6, last: '1.1s' }), T('Docs', '▤', { calls: 2, last: '400ms' }), T('Terminal', '>_'), T('Database', '◫', { access: false }), T('Chat', '#', { access: false })] },
			{ name: 'Coder', mark: '◎', color: '#171717', model: 'Orbit Pro', task: 'Build the pricing page and wire up checkout', tools: [T('Repo', '⑂', { calls: 2, last: '520ms' }), T('Terminal', '>_', { calls: 2, running: true }), T('Payments', '$', { calls: 1, last: '730ms' }), T('Design', '◩', { calls: 1, last: '1.2s' }), T('Database', '◫', { calls: 1, last: '280ms' }), T('Web search', '⌕'), T('Docs', '▤', { access: false }), T('Chat', '#', { access: false }), T('CRM', '◍', { access: false })] },
			{ name: 'Writer', mark: '✳', color: '#d97757', model: 'Atlas Pro', task: 'Write the launch email', tools: [T('Docs', '▤', { calls: 3, last: '300ms' }), T('Chat', '#'), T('CRM', '◍', { access: false })] },
			{ name: 'Analyst', mark: '✦', color: '#3b82f6', model: 'Prism Ultra', task: 'Forecast signups for Q4', tools: [T('Database', '◫', { calls: 4, last: '900ms' }), T('Sheets', '▦', { calls: 1, last: '2.0s' }), T('Web search', '⌕', { access: false })] }
		] as AgentSpec[])
	}: { agents?: AgentSpec[] } = $props();
	let sel = $state(1);
	let openTool = $state<string | null>(null);
	const callsOf = (t: ToolNode) => Array.from({ length: t.calls ?? 0 }, (_, k) => `${t.name.toLowerCase().replace(/\s/g, '_')}.${['read', 'write', 'run', 'list'][k % 4]}() · ${(0.3 + k * 0.4).toFixed(1)}s`);
	const a = $derived(agents[sel]);
	const used = $derived(a.tools.filter((t) => t.calls));
	const other = $derived(a.tools.filter((t) => !t.calls));
	const H = 46;
	const grant = (name: string) => (agents = agents.map((x, i) => (i !== sel ? x : { ...x, tools: x.tools.map((t) => (t.name === name ? { ...t, access: !t.access } : t)) })));
	const mid = $derived((used.length * H) / 2);
	const rmid = $derived((other.length * H) / 2);
	const h = $derived(Math.max(used.length, other.length) * H);
</script>

<div class="ui-ag ui-tam">
	<div class="ui-ag-row"><b class="ui-ag-grow">⊶ Tool access</b>{#if a.tools.some((t) => t.running)}<span class="ui-ag-pill" data-tone="blue"><span class="ui-ag-spin"></span> 1 running</span>{/if}<small class="ui-ag-muted">{a.tools.filter((t) => t.access).length}/{a.tools.length} tools · {used.reduce((s, t) => s + (t.calls ?? 0), 0)} calls</small></div>
	<div class="ui-ag-row" role="tablist">{#each agents as g, i (g.name)}<button class="ui-ag-chip" role="tab" aria-selected={sel === i} onclick={() => (sel = i)}><span style:color={g.color}>{g.mark}</span>{g.name}</button>{/each}</div>
	<div class="ui-tam__map" style:height="{h}px">
		<div class="ui-tam__col" style:padding-top="{(h - used.length * H) / 2}px">
			{#each used as t (t.name)}<button class="ui-tam__tool" aria-expanded={openTool === t.name} aria-label="{t.name}, {t.running ? 'running' : 'used'}, {t.calls} call{t.calls === 1 ? '' : 's'} – open its calls" onclick={() => (openTool = openTool === t.name ? null : t.name)}><span class="ui-ag-row"><i>{t.mark}</i><b class="ui-ag-grow">{t.name}</b><small>{t.calls}×</small></span>{#if t.running}<span class="ui-ag-pill" data-tone="blue"><i class="ui-ag-spin"></i> Running</span>{:else}<small>Last call {t.last}</small>{/if}{#if openTool === t.name}<span class="ui-tam__calls ui-ag-in">{#each callsOf(t) as c (c)}<code>{c}</code>{/each}</span>{/if}</button>{/each}
		</div>
		<svg class="ui-tam__wires" viewBox="0 0 100 {h}" preserveAspectRatio="none" aria-hidden="true">
			{#each used as _, i (i)}{@const y = (h - used.length * H) / 2 + i * H + H / 2 - 3}<path d="M0,{y} C50,{y} 50,{h / 2} 100,{h / 2}" />{/each}
		</svg>
		<div class="ui-tam__agent ui-ag-card">
			<span class="ui-ag-row"><span style:color={a.color}>{a.mark}</span><span class="ui-ag-grow"><b>{a.name}</b><small>{a.model}</small></span>{#if a.tools.some((t) => t.running)}<span class="ui-ag-pill" data-tone="blue">Running</span>{/if}</span>
			<p>{a.task}</p>
		</div>
		<svg class="ui-tam__wires" viewBox="0 0 100 {h}" preserveAspectRatio="none" aria-hidden="true">
			{#each other as t, i (t.name)}{@const y = (h - other.length * H) / 2 + i * H + H / 2 - 3}<path d="M0,{h / 2} C50,{h / 2} 50,{y} 100,{y}" data-off={!t.access || undefined} />{/each}
		</svg>
		<div class="ui-tam__col" style:padding-top="{(h - other.length * H) / 2}px">
			{#each other as t (t.name)}<button class="ui-tam__tool" data-off={!t.access || undefined} title={t.access ? 'Revoke access' : 'Grant access'} onclick={() => grant(t.name)}><span class="ui-ag-row"><i>{t.mark}</i><b>{t.name}</b></span><small>{t.access ? 'Not used yet' : 'No access'}</small></button>{/each}
		</div>
	</div>
	<small class="ui-ag-muted" style:display={rmid && mid ? 'block' : 'none'}>Click a tool on the right to grant or revoke it.</small>
</div>

<style>
	.ui-tam__calls {
		position: absolute;
		left: 100%;
		top: 0;
		z-index: 3;
		margin-left: 6px;
		display: grid;
		gap: 3px;
		padding: 6px 8px;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow:
			var(--ag-shadow),
			0 10px 24px -10px rgba(0, 0, 0, 0.25);
		white-space: nowrap;
	}
	.ui-tam__calls code {
		font-size: 9.5px;
		color: var(--ag-muted);
	}
	.ui-tam {
		width: 100%;
		max-width: 540px;
		display: grid;
		gap: 10px;
		font-size: 10.5px;
	}
	b {
		font-weight: 500;
	}
	small {
		color: var(--ag-muted);
		font-size: 9.5px;
	}
	.ui-tam__map {
		display: grid;
		grid-template-columns: 104px 1fr 160px 1fr 104px;
		align-items: start;
	}
	.ui-tam__col {
		display: grid;
		grid-auto-rows: 46px;
	}
	.ui-tam__tool {
		all: unset;
		position: relative;
		cursor: pointer;
		box-sizing: border-box;
		height: 40px;
		display: grid;
		align-content: center;
		gap: 1px;
		padding: 0 8px;
		border-radius: 8px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		justify-items: start;
	}
	.ui-tam__tool .ui-ag-row {
		width: 100%;
		gap: 5px;
	}
	button.ui-tam__tool {
		cursor: pointer;
	}
	button.ui-tam__tool:focus-visible {
		outline: 2px solid var(--ag-blue);
	}
	.ui-tam__tool[data-off] {
		opacity: 0.45;
		box-shadow: inset 0 0 0 1px var(--ag-line);
		background: none;
	}
	i {
		font-style: normal;
		font-size: 9px;
		width: 12px;
		color: var(--ag-muted);
	}
	.ui-tam__wires {
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: none;
		stroke: color-mix(in srgb, var(--ag-blue) 55%, transparent);
		stroke-width: 1.2;
		vector-effect: non-scaling-stroke;
	}
	.ui-tam__wires path {
		vector-effect: non-scaling-stroke;
	}
	.ui-tam__wires path[data-off] {
		stroke: var(--ag-line);
		stroke-dasharray: 3 3;
	}
	.ui-tam__agent {
		align-self: center;
		padding: 8px 10px;
		display: grid;
		gap: 4px;
	}
	.ui-tam__agent .ui-ag-grow small {
		display: block;
	}
	.ui-tam__agent p {
		margin: 0;
		font-size: 10.5px;
		line-height: 1.4;
	}
</style>
