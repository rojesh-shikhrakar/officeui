<!-- Stepper – A read-only step indicator (horizontal or vertical) with done / current / error states. -->
<script lang="ts">
	import Icon from './Icon.svelte';
	import './stepper.css';
	type Props = { steps?: { label: string; description?: string }[]; current?: number; orientation?: 'horizontal' | 'vertical'; errorIndex?: number; class?: string };
	let { steps = [], current: cur = 0, orientation, errorIndex, class: cls }: Props = $props();
</script>

<ol class={['ui-stp', orientation === 'vertical' && 'ui-stp--v', cls]}>
	{#each steps as s, i (i)}
		{@const st = errorIndex === i ? 'error' : i < cur ? 'done' : i === cur ? 'current' : 'todo'}
		<li class={['ui-stp__step', `is-${st}`]} aria-current={st === 'current' ? 'step' : undefined}>
			<span class="ui-stp__dot">{#if st === 'done'}<Icon name="check" size={14} />{:else if st === 'error'}<Icon name="x" size={14} />{:else}{i + 1}{/if}</span>
			<span class="ui-stp__text"><b>{s.label}</b>{#if s.description}<span>{s.description}</span>{/if}<span class="ui-stp__sr">{st === 'done' ? ' (completed)' : st === 'error' ? ' (error)' : ''}</span></span>
			{#if i < steps.length - 1}<span class="ui-stp__line" aria-hidden="true"></span>{/if}
		</li>
	{/each}
</ol>
