<!-- Glow Keyboard – an AI chat input that types itself over a glass keyboard; every key press lights up its key and sends a ripple through the glow. -->
<script lang="ts">
	import { onMount } from 'svelte';
	let { prompts = ['Find a flight to Lisbon', 'Summarize my inbox', 'Plan a team offsite'], autoplay = true }: { prompts?: string[]; autoplay?: boolean } = $props();
	const rows = [
		['esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '◯'],
		['^', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'],
		['⇥', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
		['⇪', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '↩'],
		['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '⇧'],
		['fn', '⌃', '⌥', '⌘', ' ', '⌘', '⌥', '←', '↕', '→']
	];
	// svelte-ignore state_referenced_locally
	let text = $state(autoplay ? '' : prompts[0]);
	let down = $state<string | null>(null);
	let pulse = $state(0);
	function press(k: string) {
		down = k;
		pulse++;
		setTimeout(() => down === k && (down = null), 140);
	}
	onMount(() => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let p = 0,
			i = 0,
			wait = 0;
		const t = setInterval(() => {
			if (wait) return void wait--;
			const target = prompts[p % prompts.length];
			if (i < target.length) {
				const ch = target[i++];
				text = target.slice(0, i);
				press(ch === ' ' ? ' ' : ch.toLowerCase());
			} else if (text) {
				text = text.slice(0, -1);
				press('⌫');
				if (!text) ((p++), (i = 0), (wait = 4));
			}
			if (i === target.length && text === target) wait = 18;
		}, 90);
		return () => clearInterval(t);
	});
</script>

<div class="ui-gkb" style:--p={pulse % 2}>
	<div class="ui-gkb__glow" aria-hidden="true"></div>
	<div class="ui-gkb__input" role="img" aria-label="Chat input typing: {text}"><span class="ui-gkb__orb"></span><span>{text}<i class="ui-gkb__caret"></i></span></div>
	<div class="ui-gkb__kb" aria-hidden="true">
		{#each rows as row, r (r)}
			<div class="ui-gkb__row" data-r={r}>
				{#each row as k, j (j)}<button tabindex="-1" class="ui-gkb__key" data-k={k} data-down={down === k || undefined} onpointerdown={() => (press(k), (text = k === '⌫' ? text.slice(0, -1) : k.length === 1 ? text + k : text))}>{k === ' ' ? '' : k}</button>{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.ui-gkb {
		position: relative;
		width: 680px;
		max-width: 100%;
		aspect-ratio: 894 / 520;
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 22px;
		overflow: hidden;
		border-radius: 16px;
		background: #fafafa;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
		container-type: inline-size;
	}
	.ui-gkb__glow {
		position: absolute;
		inset: 30% -10% -25%;
		background:
			radial-gradient(40% 50% at 15% 80%, #ffb37a, transparent 70%),
			radial-gradient(40% 50% at 55% 100%, #e9a8ff, transparent 70%),
			radial-gradient(35% 45% at 90% 85%, #ff9ec7, transparent 70%);
		filter: blur(30px);
		opacity: 0.8;
		transition: transform 0.15s;
		transform: scale(calc(1 + var(--p) * 0.015));
	}
	.ui-gkb__input {
		position: relative;
		width: 50%;
		display: flex;
		align-items: center;
		gap: 2.2cqw;
		padding: 1.4cqw 2cqw;
		border-radius: 999px;
		background: linear-gradient(90deg, #fff0ec, #fff);
		box-shadow:
			0 0 0 2px #ff9a8a,
			0 0 30px 4px rgba(255, 120, 100, 0.45);
		font-size: 2.3cqw;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
	}
	.ui-gkb__orb {
		width: 4.4cqw;
		height: 4.4cqw;
		border-radius: 50%;
		flex: none;
		background: radial-gradient(circle at 35% 35%, #ffd27a, #ff6a3d 55%, #f0457a);
	}
	.ui-gkb__caret {
		display: inline-block;
		width: 1px;
		height: 1em;
		margin-left: 2px;
		vertical-align: -2px;
		background: #555;
		animation: ui-gkb-b 1s steps(2) infinite;
	}
	@keyframes ui-gkb-b {
		50% {
			opacity: 0;
		}
	}
	.ui-gkb__kb {
		position: relative;
		width: 76%;
		display: grid;
		gap: 0.7cqw;
		padding: 1.4cqw;
		border-radius: 2.4cqw;
		background: rgba(255, 255, 255, 0.45);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.8),
			0 10px 30px -10px rgba(0, 0, 0, 0.12);
		backdrop-filter: blur(10px);
	}
	.ui-gkb__row {
		display: flex;
		gap: 0.7cqw;
	}
	.ui-gkb__key {
		flex: 1;
		height: 4.6cqw;
		border: 0;
		border-radius: 1cqw;
		background: rgba(255, 255, 255, 0.85);
		box-shadow:
			0 1px 0 rgba(0, 0, 0, 0.06),
			inset 0 -1px 0 rgba(0, 0, 0, 0.04);
		font: inherit;
		font-size: 1.8cqw;
		color: #444;
		cursor: pointer;
		transition:
			transform 0.12s,
			background-color 0.12s,
			box-shadow 0.12s;
	}
	.ui-gkb__row[data-r='0'] .ui-gkb__key {
		height: 3cqw;
		font-size: 1.1cqw;
	}
	.ui-gkb__key[data-k=' '] {
		flex: 5;
	}
	.ui-gkb__key[data-k='⌫'],
	.ui-gkb__key[data-k='⇥'],
	.ui-gkb__key[data-k='⇪'],
	.ui-gkb__key[data-k='↩'],
	.ui-gkb__key[data-k='⇧'] {
		flex: 1.6;
	}
	.ui-gkb__key[data-down] {
		transform: translateY(1px) scale(0.96);
		background: #fff3ef;
		box-shadow: 0 0 14px 2px rgba(255, 130, 110, 0.55);
	}
</style>
