<!-- Agent Team – ported from affectUI (MIT). A prompt types itself and branches out into three agents, each with a role and tool marks. -->
<script lang="ts" module>
	export type AgentTeamMember = { role: string; avatar: string; /** Up to two tool marks: index into the neutral mark set */ tools?: number[] };
	const TYPE = 22;
	const SEND = 420;
	const SPREAD = 700;
	const STAGGER = 160;
	const HOLD = 2600;
	const RESET = 600;
	type Phase = 'typing' | 'sent' | 'team' | 'reset';
</script>

<script lang="ts">
	import { avatarUrl } from './avatar';
	import { mark } from './marks';
	import './agent-team.css';

	let {
		prompt = 'Build a team to work my inbound pipeline',
		members = [
			{ role: 'Researcher', avatar: avatarUrl('Re Search', 210), tools: [0, 4] },
			{ role: 'Writer', avatar: avatarUrl('Wr Iter', 330), tools: [2] },
			{ role: 'Closer', avatar: avatarUrl('Cl Oser', 40), tools: [1, 6] }
		],
		label,
		class: cls
	}: { prompt?: string; members?: [AgentTeamMember, AgentTeamMember, AgentTeamMember]; label?: string; class?: string } = $props();

	const _pid = $props.id();
	const id = 'ui-atm' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	let typed = $state(0);
	let phase = $state<Phase>('typing');
	const lines = ['M300 110C300 162 102 152 102 196', 'M300 110V196', 'M300 110C300 162 498 152 498 196'];

	$effect(() => {
		const p = prompt;
		// Reduced motion: show the finished scene and stay there
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			typed = p.length;
			phase = 'team';
			return;
		}
		const timers: ReturnType<typeof setTimeout>[] = [];
		const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
		const run = () => {
			phase = 'typing';
			typed = 0;
			for (let i = 1; i <= p.length; i++) later(() => (typed = i), 500 + i * TYPE);
			const typedAt = 500 + p.length * TYPE;
			later(() => (phase = 'sent'), typedAt + SEND);
			later(() => (phase = 'team'), typedAt + SEND + SPREAD * 0.55);
			const doneAt = typedAt + SEND + SPREAD + STAGGER * 3 + 500;
			later(() => (phase = 'reset'), doneAt + HOLD);
			later(run, doneAt + HOLD + RESET);
		};
		run();
		return () => timers.forEach(clearTimeout);
	});
</script>

<div class={['ui-atm', cls]} data-phase={phase} role="img" aria-label={label ?? `A prompt – “${prompt}” – builds a team of three agents: ${members.map((m) => m.role).join(', ')}`}>
	<svg class="ui-atm-lines" viewBox="0 0 600 400" aria-hidden="true">
		<defs>
			{#each lines as d, i (i)}<mask id="{id}-reveal-{i}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="400"><path class="ui-atm-reveal" {d} pathLength="1" /></mask>{/each}
		</defs>
		{#each lines as d, i (i)}<path class="ui-atm-line" {d} mask="url(#{id}-reveal-{i})" />{/each}
	</svg>
	<div class="ui-atm-halo" aria-hidden="true"></div>
	<div class="ui-atm-prompt" aria-hidden="true">
		<span class="ui-atm-text"><bdi class="ui-atm-typed">{prompt.slice(0, typed)}<span class="ui-atm-caret"></span></bdi></span>
		<span class="ui-atm-send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18.5v-13M6.5 11 12 5.5l5.5 5.5" /></svg></span>
	</div>
	{#each members as m, i (i)}
		<div class="ui-atm-agent" style:left="calc({102 + i * 198} * var(--u))" style:--i={i} aria-hidden="true">
			<div class="ui-atm-node">
				<span class="ui-atm-face"><img src={m.avatar} alt="" draggable="false" /></span>
				<span class="ui-atm-dot"></span>
			</div>
			<div class="ui-atm-role">
				{#if m.tools?.length}
					<span class="ui-atm-tools">
						{#each m.tools.slice(0, 2) as t (t)}<span class="ui-atm-tool"><svg viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(4 4) scale(0.667)" fill={mark(t).color} d={mark(t).d} /></svg></span>{/each}
					</span>
				{/if}
				<span>{m.role}</span>
			</div>
		</div>
	{/each}
</div>
