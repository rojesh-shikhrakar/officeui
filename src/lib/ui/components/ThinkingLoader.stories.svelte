<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, waitFor, within } from 'storybook/test';
	import ThinkingLoader from './ThinkingLoader.svelte';

	const { Story } = defineMeta({
		title: 'Components/Chat/Thinking Loader',
		component: ThinkingLoader,
		tags: ['autodocs'],
		args: { size: 'md', variant: 'pill', done: false, loop: true },
		argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] }, variant: { control: 'inline-radio', options: ['pill', 'plain'] } }
	});
</script>

<script lang="ts">
	let finished = $state(false);
</script>

<Story name="Default" />
<Story name="Small" args={{ size: 'sm' }} />
<Story name="Plain" args={{ variant: 'plain' }} />
<Story name="Fixed phase" args={{ phase: 2 }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('status')).toHaveTextContent('Reading sources')} />
<Story name="Done" args={{ done: true, doneLabel: 'Thought for 12s' }} play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('status')).toHaveTextContent('Thought for 12s')} />
<Story name="Fast phases" args={{ interval: 300, phases: ['Planning', 'Calling tools', 'Checking results'], loop: false }} play={async ({ canvasElement }) => waitFor(() => expect(within(canvasElement).getByRole('status')).toHaveTextContent('Checking results'), { timeout: 2000 })} />
<Story
	name="Finish on click"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Finish' }));
		await expect(c.getByRole('status')).toHaveTextContent(/Thought for/);
	}}
>
	<div style="display: grid; gap: 16px; justify-items: center">
		<ThinkingLoader done={finished} />
		<button onclick={() => (finished = !finished)}>{finished ? 'Restart' : 'Finish'}</button>
	</div>
</Story>
