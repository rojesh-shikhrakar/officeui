<!-- Inspect Agent Card – an agent card tilted back like a selection in a design tool, with spacing marks, a fill label and a cursor nudging it. -->
<script lang="ts">
	import './inspect.css';
	let { agent = 'Coder', model = 'Orbit Pro', task = 'Build the page and wire up checkout', cost = '$0.42 · 48s', above = { model: 'Atlas Pro', task: 'Compare the pricing of five competitors', cost: '$0.18 · 55s' } }: { agent?: string; model?: string; task?: string; cost?: string; above?: { model: string; task: string; cost: string } } = $props();
</script>

<div class="ui-insp" role="img" aria-label="An agent card, {agent}, inspected in a design tool">
	<div class="ui-insp__plane">
		<div class="ui-iac__card ui-insp__ghost"><small>{above.model}</small><p>▤ {above.task}</p><small><b>{above.cost.split(' · ')[0]}</b> · {above.cost.split(' · ')[1]}</small></div>
		<div class="ui-iac__card">
			<div class="ui-iac__head"><span class="ui-iac__av">◎</span><span><b>{agent}</b><small>{model}</small></span><span class="ui-iac__run">◌ Running</span><span class="ui-insp__tag" style:left="0" style:top="2.4cqw">▤ Task</span></div>
			<div class="ui-insp__sel ui-iac__task"><p>⑂ {task}</p><span class="ui-insp__tag" style:right="12cqw" style:top="-1.8cqw">10</span><span class="ui-insp__tag" style:left="-1cqw" style:top="1.2cqw">10</span><span class="ui-insp__cursor" style:right="9cqw" style:top="2.6cqw">👆</span></div>
			<small class="ui-iac__cost"><span class="ui-insp__tag" data-tone="red" style:left="-1.6cqw" style:top="0">0</span><b>{cost.split(' · ')[0]}</b> · {cost.split(' · ')[1]}<span class="ui-insp__tag" data-tone="soft" style:right="10cqw" style:top="0">W Fill 236px</span></small>
			<span class="ui-insp__guide" style:left="1cqw" style:top="-2cqw" style:bottom="-4cqw"></span>
		</div>
	</div>
</div>

<style>
	.ui-iac__card {
		position: relative;
		background: #fff;
		border-radius: 1.4cqw;
		padding: 1.6cqw 2cqw;
		margin-bottom: 1.2cqw;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		font-size: 1.9cqw;
		color: #171717;
		display: grid;
		gap: 1cqw;
	}
	small {
		font-size: 1.6cqw;
		color: #8a8a8a;
	}
	small b {
		color: #171717;
		font-weight: 500;
	}
	p {
		margin: 0;
		color: #8a8a8a;
	}
	.ui-iac__head {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1.2cqw;
	}
	.ui-iac__head > span:nth-child(2) {
		display: grid;
		flex: 1;
	}
	.ui-iac__head b {
		font-weight: 500;
	}
	.ui-iac__av {
		width: 3cqw;
		height: 3cqw;
		display: grid;
		place-items: center;
	}
	.ui-iac__run {
		font-size: 1.6cqw;
		color: #2563eb;
		background: rgba(59, 130, 246, 0.1);
		padding: 0.4cqw 1cqw;
		border-radius: 0.6cqw;
	}
	.ui-iac__task {
		padding: 1cqw 0.6cqw;
	}
	.ui-iac__cost {
		position: relative;
		padding-left: 0.6cqw;
	}
</style>
