<!-- Writing Assistant – a compact writing companion: a glowing empty state with quick actions, then a short streamed draft you can copy, retry or keep refining. -->
<script lang="ts">
	import './agents.css';
	let {
		name = 'Quill',
		tagline = 'Your writing companion.',
		actions = ['Polish my email', 'Make it shorter', 'Fix the tone', 'Draft a reply'],
		respond = (p: string) => `Here's a draft for "${p}":\n\nHi Sam, thanks for the quick turnaround. The new layout reads much better — I left two small notes on the pricing table. Happy to ship once those are in.`
	}: { name?: string; tagline?: string; actions?: string[]; respond?: (prompt: string) => string } = $props();
	let msgs = $state<{ me: boolean; text: string }[]>([]);
	let text = $state('');
	let busy = $state(false);
	let copied = $state(false);
	let recording = $state(false);
	let rec: ReturnType<typeof setTimeout> | undefined;
	function dictate() {
		if (recording) return void ((recording = false), clearTimeout(rec));
		recording = true;
		const words = 'Can you make my reply to Sam a bit warmer'.split(' ');
		let k = 0;
		const next = () => {
			if (!recording || k >= words.length) return void (recording = false);
			text = words.slice(0, ++k).join(' ');
			rec = setTimeout(next, 220);
		};
		next();
	}
	async function send(p: string) {
		if (!p.trim() || busy) return;
		msgs = [...msgs, { me: true, text: p }, { me: false, text: '' }];
		text = '';
		busy = true;
		const full = respond(p);
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		for (let i = reduce ? full.length : 0; i <= full.length; i += 3) {
			msgs[msgs.length - 1].text = full.slice(0, i);
			await new Promise((r) => setTimeout(r, 16));
		}
		msgs[msgs.length - 1].text = full;
		busy = false;
	}
	async function copy(t: string) {
		await navigator.clipboard?.writeText(t).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<div class="ui-ag ui-ag-panel ui-wa">
	<div class="ui-ag-head"><span class="ui-ag-grow"><b><span style:color="#a855f7">✦</span> {name}</b><small>{tagline}</small></span>{#if msgs.length}<button class="ui-ag-btn" data-variant="ghost" onclick={() => (msgs = [])}>New</button>{/if}</div>
	<div class="ui-wa__body" data-empty={!msgs.length || undefined}>
		{#if !msgs.length}
			<div class="ui-wa__glow" aria-hidden="true"><i></i><i></i><i></i></div>
			<h4>What should we write?</h4>
			<div class="ui-wa__acts">{#each actions as a (a)}<button class="ui-ag-chip" onclick={() => send(a)}>{a}</button>{/each}</div>
		{:else}
			{#each msgs as m, i (i)}
				{#if m.me}<div class="ui-wa__me ui-ag-in">{m.text}</div>
				{:else}<div class="ui-wa__ai ui-ag-in">{m.text}{#if busy && i === msgs.length - 1}<span class="ui-wa__caret"></span>{/if}
						{#if !(busy && i === msgs.length - 1)}<span class="ui-ag-row ui-wa__tools"><button class="ui-ag-btn" data-variant="ghost" onclick={() => copy(m.text)}>{copied ? '✓ Copied' : '⧉ Copy'}</button><button class="ui-ag-btn" data-variant="ghost" onclick={() => send(msgs[i - 1].text)}>↻ Retry</button></span>{/if}
					</div>{/if}
			{/each}
		{/if}
	</div>
	<form class="ui-wa__in" onsubmit={(e) => (e.preventDefault(), send(text))}><input bind:value={text} placeholder="Ask anything…" aria-label="Message {name}" />{#if recording}<span class="ui-wa__wave" aria-hidden="true">{#each [3, 6, 4, 8, 5, 7, 3] as h, k (k)}<i style:--h="{h * 2}px" style:animation-delay="{k * 80}ms"></i>{/each}</span><button type="button" class="ui-ag-btn" data-variant="ghost" aria-label="Stop dictation" onclick={dictate}>◼</button>{:else if text}<button class="ui-ag-btn" data-variant="ghost" aria-label="Send">↑</button>{:else}<button type="button" class="ui-ag-btn" data-variant="ghost" aria-label="Dictate" onclick={dictate}>🎙</button>{/if}</form>
</div>

<style>
	.ui-wa__glow i {
		position: absolute;
		width: 60%;
		height: 70%;
		border-radius: 50%;
		filter: blur(18px);
		opacity: 0.55;
	}
	.ui-wa__glow i:nth-child(1) {
		left: 5%;
		top: 10%;
		background: rgba(236, 72, 153, 0.35);
		animation: ui-wa-a 9s ease-in-out infinite alternate;
	}
	.ui-wa__glow i:nth-child(2) {
		right: 0;
		top: 30%;
		background: rgba(168, 85, 247, 0.4);
		animation: ui-wa-b 11s ease-in-out infinite alternate;
	}
	.ui-wa__glow i:nth-child(3) {
		left: 20%;
		bottom: 0;
		background: rgba(59, 130, 246, 0.3);
		animation: ui-wa-a 13s ease-in-out infinite alternate-reverse;
	}
	@keyframes ui-wa-a {
		to {
			transform: translate(18%, -10%) scale(1.15);
		}
	}
	@keyframes ui-wa-b {
		to {
			transform: translate(-20%, 8%) scale(0.9);
		}
	}
	.ui-wa__wave {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.ui-wa__wave i {
		width: 2px;
		height: var(--h);
		border-radius: 1px;
		background: #a855f7;
		animation: ui-ag-breathe 0.6s ease-in-out infinite;
	}
	.ui-wa {
		max-width: 300px;
		font-size: 12px;
	}
	b {
		font-weight: 500;
	}
	.ui-ag-grow small {
		display: block;
		color: var(--ag-muted);
		font-size: 10.5px;
	}
	.ui-wa__body {
		position: relative;
		min-height: 210px;
		max-height: 280px;
		overflow-y: auto;
		padding: 12px;
		display: grid;
		gap: 8px;
		align-content: end;
	}
	.ui-wa__glow {
		position: absolute;
		inset: 30% 10% -20% 10%;
		background:
			radial-gradient(closest-side at 50% 40%, rgba(236, 72, 153, 0.18), transparent),
			radial-gradient(closest-side at 55% 75%, rgba(168, 85, 247, 0.22), transparent),
			radial-gradient(closest-side at 30% 90%, rgba(59, 130, 246, 0.15), transparent);
		filter: blur(8px);
		pointer-events: none;
	}
	h4 {
		position: relative;
		margin: 0;
		font-size: 13px;
		font-weight: 500;
	}
	.ui-wa__acts {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.ui-wa__me {
		justify-self: end;
		background: var(--ag-fill);
		border-radius: 12px 12px 4px 12px;
		padding: 6px 10px;
		max-width: 80%;
	}
	.ui-wa__ai {
		white-space: pre-wrap;
		line-height: 1.5;
	}
	.ui-wa__caret {
		display: inline-block;
		width: 6px;
		height: 12px;
		margin-left: 2px;
		background: #a855f7;
		vertical-align: -2px;
		animation: ui-ag-spin 1s steps(2) infinite;
	}
	.ui-wa__tools {
		margin-top: 4px;
		white-space: normal;
	}
	.ui-wa__in {
		display: flex;
		align-items: center;
		padding: 6px 6px 6px 12px;
	}
	.ui-wa__in input {
		flex: 1;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		color: var(--ag-ink);
	}
</style>
