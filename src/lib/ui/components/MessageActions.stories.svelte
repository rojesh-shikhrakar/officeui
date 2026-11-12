<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import MessageActions from './MessageActions.svelte';

	const { Story } = defineMeta({
		title: 'Components/Chat/Message Actions',
		component: MessageActions,
		tags: ['autodocs'],
		args: { oncopy: fn(), onfeedback: fn(), onregenerate: fn(), onspeak: fn() }
	});
</script>

<script lang="ts">
	let versions = $state(['First take: ship on Friday.', 'Second take: ship on Thursday, review Friday.']);
	let v = $state(1);
	let writing = $state(false);
	function regen() {
		writing = true;
		setTimeout(() => {
			versions = [...versions, `Take ${versions.length + 1}: ship next Monday.`];
			writing = false;
		}, 600);
	}
</script>

<Story
	name="Default"
	play={async ({ args, canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Copy message' }));
		await expect(args.oncopy).toHaveBeenCalledOnce();
		await userEvent.click(c.getByRole('button', { name: 'Bad response' }));
		await expect(c.getByText('What went wrong?')).toBeInTheDocument();
		await userEvent.click(c.getByRole('button', { name: 'Too long' }));
		await userEvent.click(c.getByRole('button', { name: 'Send' }));
		await expect(args.onfeedback).toHaveBeenLastCalledWith('down', 'Too long');
	}}
/>
<Story name="With versions" args={{ versions: 3, version: 1 }} play={async ({ canvasElement }) => {
	const c = within(canvasElement);
	await userEvent.click(c.getByRole('button', { name: 'Next version' }));
	await expect(c.getByLabelText('Version 3 of 3')).toBeInTheDocument();
}} />
<Story name="Copy and feedback only" args={{ actions: ['copy', 'feedback'] }} />
<Story name="Speaking" args={{ speaking: true }} />
<Story name="Quiet" args={{ quiet: true }} />
<Story name="Regenerate flow" asChild>
	<div data-ui-message style="width: 420px; font: 14px/1.55 Inter, sans-serif">
		<p style="margin: 0 0 8px">{versions[v]}</p>
		<MessageActions text={versions[v]} versions={versions.length} bind:version={v} regenerating={writing} onregenerate={regen} />
	</div>
</Story>
