<!-- Project Flow – a client task branches into notes and assigned roles; each node slides in along a connector, then the scene loops. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { mark } from '../utils/marks';
	import { avatarUrl } from '../utils/avatar';
	let {
		client = 'Lumen',
		task = 'Web Design',
		roles = [
			{ name: 'Project Manager', note: 'Managing project progress', hue: 30 },
			{ name: 'UX Designer', note: 'Wireframes and flows', hue: 260 }
		],
		autoplay = true
	}: { client?: string; task?: string; roles?: { name: string; note: string; hue: number }[]; autoplay?: boolean } = $props();
	// How many nodes are visible: client, task, notes, roles label, role 1, role 2
	// svelte-ignore state_referenced_locally
	let shown = $state(autoplay ? 1 : 6);
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return void (shown = 6);
		const t = setInterval(() => (shown = shown >= 8 ? 1 : shown + 1), 900);
		return () => clearInterval(t);
	});
	const stack = [mark(3), mark(9), mark(11), mark(4), mark(7)];
</script>

{#snippet tools(n: number)}
	<span class="ui-pfl__tools"><span class="ui-pfl__chip">Tech stack</span>{#each stack.slice(0, n) as m, i (i)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d={m.d} fill={m.color} fill-rule="evenodd" /></svg>{/each}</span>
{/snippet}

<div class="ui-pfl" role="img" aria-label="Task {task} for {client} branching into notes and roles">
	<div class="ui-pfl__rings" aria-hidden="true"></div>
	<div class="ui-pfl__n ui-pfl__client" data-on={shown >= 1 || undefined}>Client: <b>● {client}</b> <small>Onboarded 2d ago</small></div>
	<i class="ui-pfl__v" style:left="41.5%" style:top="22%" style:height="5%" data-on={shown >= 2 || undefined}></i>
	<div class="ui-pfl__n ui-pfl__task" data-on={shown >= 2 || undefined}>
		<b>Task: {task}</b><small>Assigned to <img src={avatarUrl(roles[0].name, roles[0].hue)} alt="" /><img src={avatarUrl(roles[1]?.name ?? 'B', roles[1]?.hue ?? 200)} alt="" /></small>{@render tools(5)}
	</div>
	<i class="ui-pfl__h" style:left="57%" style:top="34%" style:width="4%" data-on={shown >= 3 || undefined}></i>
	<div class="ui-pfl__n ui-pfl__notes" data-on={shown >= 3 || undefined}>▤ Client Notes <small>Updated</small></div>
	<i class="ui-pfl__elbow" data-on={shown >= 4 || undefined}></i>
	<div class="ui-pfl__n ui-pfl__label" data-on={shown >= 4 || undefined}>Assigned Roles</div>
	{#each roles.slice(0, 2) as r, i (r.name)}
		<div class="ui-pfl__n ui-pfl__role" style:top="{58 + i * 18}%" data-on={shown >= 5 + i || undefined} data-dim={i > 0 || undefined}>
			<img src={avatarUrl(r.name, r.hue)} alt="" /><span><b>{r.name}</b><small>{r.note}</small>{@render tools(3)}</span>
		</div>
	{/each}
</div>

<style>
	.ui-pfl {
		position: relative;
		width: 680px;
		max-width: 100%;
		aspect-ratio: 894 / 480;
		overflow: hidden;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
		container-type: inline-size;
		color: #171717;
		-webkit-mask: linear-gradient(transparent, #000 15%, #000 75%, transparent);
		mask: linear-gradient(transparent, #000 15%, #000 75%, transparent);
	}
	.ui-pfl__rings {
		position: absolute;
		left: 25%;
		top: 0;
		width: 60%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: repeating-radial-gradient(circle, transparent 0 7cqw, rgba(0, 0, 0, 0.035) 7cqw 7.2cqw);
	}
	.ui-pfl__n {
		position: absolute;
		background: #fff;
		border-radius: 1cqw;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.05),
			0 2px 6px -2px rgba(0, 0, 0, 0.08);
		padding: 1cqw 1.2cqw;
		font-size: 1.3cqw;
		display: grid;
		gap: 0.6cqw;
		opacity: 0;
		transform: translateY(1.2cqw);
		transition:
			opacity 0.5s,
			transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.ui-pfl__n[data-on] {
		opacity: 1;
		transform: none;
	}
	.ui-pfl__n[data-on][data-dim] {
		opacity: 0.45;
	}
	.ui-pfl__n b {
		font-weight: 500;
	}
	small {
		font-size: 1cqw;
		color: #8a8a8a;
		display: flex;
		align-items: center;
		gap: 0.4cqw;
	}
	img {
		width: 1.6cqw;
		height: 1.6cqw;
		border-radius: 50%;
	}
	.ui-pfl__client {
		left: 32%;
		top: 15%;
		display: flex;
		align-items: center;
		color: #8a8a8a;
		border-radius: 999px;
	}
	.ui-pfl__task {
		left: 30%;
		top: 27%;
		width: 27%;
	}
	.ui-pfl__notes {
		left: 61%;
		top: 31%;
		display: flex;
		align-items: center;
		color: #737373;
	}
	.ui-pfl__label {
		left: 56%;
		top: 49%;
		font-size: 1cqw;
		color: #8a8a8a;
	}
	.ui-pfl__role {
		left: 53%;
		width: 26%;
		grid-template-columns: auto 1fr;
		align-items: start;
	}
	.ui-pfl__role img {
		width: 2.6cqw;
		height: 2.6cqw;
	}
	.ui-pfl__role > span {
		display: grid;
		gap: 0.4cqw;
	}
	.ui-pfl__tools {
		display: flex;
		align-items: center;
		gap: 0.5cqw;
	}
	.ui-pfl__tools svg {
		width: 1.8cqw;
		padding: 0.2cqw;
		border-radius: 0.4cqw;
		background: #f4f4f4;
	}
	.ui-pfl__chip {
		font-size: 0.9cqw;
		padding: 0.3cqw 0.6cqw;
		border-radius: 0.4cqw;
		background: #fff7e0;
		color: #b7791f;
	}
	i {
		position: absolute;
		border-color: #93c5fd;
		border-style: solid;
		border-width: 0;
		opacity: 0;
		transition: opacity 0.4s;
	}
	i[data-on] {
		opacity: 1;
	}
	.ui-pfl__v {
		border-left-width: 1.5px;
	}
	.ui-pfl__h {
		border-top-width: 1.5px;
	}
	.ui-pfl__elbow {
		left: 41.5%;
		top: 41%;
		width: 24%;
		height: 8%;
		border-width: 0 1.5px 0 1.5px;
		border-left-width: 1.5px;
		border-bottom-width: 1.5px;
		border-right-width: 1.5px;
		border-radius: 0 0 1cqw 1cqw;
		border-top-width: 0;
		clip-path: inset(0 0 0 0);
	}
</style>
