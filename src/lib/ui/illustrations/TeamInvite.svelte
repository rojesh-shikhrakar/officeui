<!-- Team Invite – ported from affectUI (MIT). Two connected teammates; a third is dragged into the empty slot and joins. -->
<script lang="ts" module>
	export type TeamInviteAvatar = { src: string; name?: string };
</script>

<script lang="ts">
	import { avatarUrl } from './avatar';
	import './team-invite.css';
	let {
		avatars = [
			{ src: avatarUrl('Ana Ruiz', 200), name: 'Ana' },
			{ src: avatarUrl('Ben Okafor', 20), name: 'Ben' },
			{ src: avatarUrl('Chen Wei', 290), name: 'Chen' }
		],
		label,
		class: cls
	}: { avatars?: [TeamInviteAvatar, TeamInviteAvatar, TeamInviteAvatar]; label?: string; class?: string } = $props();
	const _pid = $props.id();
	const id = 'ui-ti' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const names = $derived(avatars.map((p, i) => p.name ?? `Teammate ${i + 1}`));
</script>

{#snippet node(avatar: TeamInviteAvatar, c: string)}
	<div class="ui-ti-node {c}" aria-hidden="true">
		<span class="ui-ti-face"><img src={avatar.src} alt="" draggable="false" /></span>
		<span class="ui-ti-dot"></span>
	</div>
{/snippet}

<div class={['ui-ti', cls]} role="img" aria-label={label ?? `${names[0]} and ${names[1]} are connected; ${names[2]} is dragged into the empty slot and joins the team`}>
	<svg class="ui-ti-lines" viewBox="0 0 600 400" aria-hidden="true">
		<defs><linearGradient id="{id}-line" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" class="ui-ti-stop-a" /><stop offset="100%" class="ui-ti-stop-b" /></linearGradient></defs>
		<path class="ui-ti-line" d="M162 159C214 159 222 105 258 105" stroke="url(#{id}-line)" />
		<path class="ui-ti-line ui-ti-line--dashed" d="M162 159C214 165 214 245 248 245" />
		<path class="ui-ti-line ui-ti-line--joined" d="M162 159C214 165 214 245 248 245" pathLength="1" stroke="url(#{id}-line)" />
		<g class="ui-ti-slot">
			<circle class="ui-ti-line ui-ti-line--slot" cx="290" cy="245" r="40" />
			<path class="ui-ti-plus" d="M290 234v22M279 245h22" />
		</g>
	</svg>
	{@render node(avatars[0], 'ui-ti-node--a')}
	{@render node(avatars[1], 'ui-ti-node--b')}
	<div class="ui-ti-drag" aria-hidden="true">
		{@render node(avatars[2], 'ui-ti-node--c')}
		<svg class="ui-ti-cursor" viewBox="-2.186 -0.256 18.514 22.277" aria-hidden="true">
			<path
				transform="rotate(21.37)"
				d="M13.92 4.07c1.69.66 3.03 1.18 3.94 1.68.46.25.87.53 1.16.86.31.35.51.79.48 1.29-.03.51-.27.92-.62 1.23-.33.3-.77.53-1.25.74-.96.4-2.36.78-4.12 1.26-.56.15-.98.27-1.26.37-.26.1-.38.18-.47.27-.09.09-.17.21-.27.47-.1.28-.22.7-.37 1.26-.48 1.76-.86 3.16-1.26 4.12-.2.49-.44.93-.74 1.25-.32.35-.72.6-1.23.62-.51.03-.94-.17-1.29-.48-.33-.29-.61-.7-.86-1.16-.5-.91-1.02-2.25-1.68-3.94L1.66 7.76C.96 5.99.41 4.59.16 3.51-.09 2.44-.12 1.39.63.63 1.39-.12 2.44-.09 3.51.16c1.08.25 2.48.8 4.25 1.5l6.16 2.41Z"
			/>
		</svg>
	</div>
</div>
