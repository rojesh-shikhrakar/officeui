<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import OtpInput from './OtpInput.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/OTP Input',
		component: OtpInput,
		tags: ['autodocs'],
		args: { oncomplete: fn(), onchange: fn(), length: 6, status: 'idle' },
		argTypes: { status: { control: 'inline-radio', options: ['idle', 'verifying', 'error', 'success'] } }
	});
</script>

<script lang="ts">
	let status = $state<'idle' | 'verifying' | 'error' | 'success'>('idle');
	function check(code: string) {
		status = 'verifying';
		setTimeout(() => (status = code === '123456' ? 'success' : 'error'), 400);
	}
</script>

<Story
	name="Default"
	play={async ({ args, canvasElement }) => {
		const input = within(canvasElement).getByLabelText(/Verification code/);
		await userEvent.click(input);
		await userEvent.keyboard('482913');
		await expect(args.oncomplete).toHaveBeenCalledWith('482913');
	}}
/>
<Story name="With separator" args={{ separator: true }} />
<Story name="Letters" args={{ numeric: false, length: 5, value: 'AB3' }} />
<Story name="Error" args={{ status: 'error', value: '000000', clearOnError: false }} />
<Story name="Verifying" args={{ status: 'verifying', value: '482913' }} />
<Story name="Success" args={{ status: 'success', value: '482913' }} />
<Story name="Resend" args={{ onresend: fn(), resendIn: 24, align: 'center' }} />
<Story
	name="Verify flow"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByLabelText(/Verification code/));
		await userEvent.keyboard('123456');
		await expect(await c.findByText('Verified', {}, { timeout: 2000 })).toBeInTheDocument();
	}}
>
	<div style="display: grid; gap: 12px; justify-items: center; font: 13px Inter, sans-serif">
		<OtpInput {status} oncomplete={check} onchange={() => status === 'error' && (status = 'idle')} />
		<span style="color: #737373">Try 123456</span>
	</div>
</Story>
