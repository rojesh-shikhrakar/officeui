<!-- Inspect Composer – a chat composer tilted back like a selection in a design tool: its toolbar selected, spacing marks, a size label and a cursor. -->
<script lang="ts">
	import './inspect.css';
	import { mark } from '../utils/marks';
	let { prompt = 'Ask the agents to ship the new pricing page', mode = 'Auto' }: { prompt?: string; mode?: string } = $props();
	const apps = [mark(9), mark(3), mark(7)];
</script>

{#snippet toolbar()}
	<div class="ui-ico__bar"><span>+</span><span>✋ {mode} ⌄</span><span class="ui-ico__grow"></span><span>🎙</span><span class="ui-ico__send">↑</span></div>
{/snippet}
{#snippet extras()}
	<div class="ui-ico__extras"><span>▰ Work in a folder</span><span>Connect apps {#each apps as a, i (i)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d={a.d} fill={a.color} fill-rule="evenodd" /></svg>{/each}</span></div>
{/snippet}

<div class="ui-insp" role="img" aria-label="A chat composer inspected in a design tool">
	<div class="ui-insp__plane">
		<div class="ui-ico__card ui-insp__ghost">{@render toolbar()}</div>
		<div class="ui-insp__ghost">{@render extras()}</div>
		<div class="ui-ico__card">
			<p>{prompt}</p>
			<span class="ui-insp__tag" style:right="0" style:top="4.6cqw">▤ Toolbar</span>
			<div class="ui-insp__sel">{@render toolbar()}<span class="ui-insp__tag" style:left="50%" style:top="-1.8cqw">10</span><span class="ui-insp__tag" style:right="-1cqw" style:top="1.4cqw">10</span><span class="ui-insp__cursor" style:left="58%" style:top="2.2cqw">👆</span></div>
			<span class="ui-insp__tag" data-tone="red" style:right="-1cqw" style:bottom="-2cqw">0</span>
			<span class="ui-insp__tag" data-tone="soft" style:right="4cqw" style:bottom="-2cqw">W Fill 420px</span>
			<span class="ui-insp__guide" style:right="2cqw" style:top="0" style:bottom="-4cqw"></span>
		</div>
		<div class="ui-insp__ghost">{@render extras()}</div>
	</div>
</div>

<style>
	.ui-ico__card {
		position: relative;
		background: #fff;
		border-radius: 1.6cqw;
		padding: 1.2cqw 1.4cqw;
		margin-bottom: 1cqw;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		font-size: 1.9cqw;
		color: #8a8a8a;
		display: grid;
		gap: 1.4cqw;
	}
	p {
		margin: 0;
	}
	.ui-ico__bar {
		display: flex;
		align-items: center;
		gap: 1.6cqw;
		padding: 0.4cqw 0.4cqw;
	}
	.ui-ico__grow {
		flex: 1;
	}
	.ui-ico__send {
		width: 3cqw;
		height: 3cqw;
		border-radius: 50%;
		background: #f0f0f0;
		display: grid;
		place-items: center;
	}
	.ui-ico__extras {
		display: flex;
		justify-content: space-between;
		padding: 0.8cqw 1.6cqw 2cqw;
		font-size: 1.8cqw;
		color: #8a8a8a;
	}
	.ui-ico__extras svg {
		width: 1.8cqw;
		margin-left: 0.6cqw;
		vertical-align: -0.3cqw;
	}
</style>
