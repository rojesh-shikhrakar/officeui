<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import FieldBox from './FieldBox.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/FieldBox',
		component: FieldBox,
		tags: ['autodocs'],
		args: { id: 'fb-email', label: 'Email', hint: 'We never share it' }
	});
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByLabelText('Email')).toBeInTheDocument()}>
	<div style="width: 280px">
		<FieldBox id="fb-email" label="Email" hint="We never share it"><input id="fb-email" aria-describedby="fb-email-n" style="padding: 8px 10px" /></FieldBox>
	</div>
</Story>
<Story name="Error" asChild>
	<div style="width: 280px">
		<FieldBox id="fb-err" label="Email" error="Enter a valid address"><input id="fb-err" aria-invalid="true" aria-describedby="fb-err-n" style="padding: 8px 10px" /></FieldBox>
	</div>
</Story>
