<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Stack from './Stack.svelte';
	import HStack from './HStack.svelte';
	import VStack from './VStack.svelte';

	const { Story } = defineMeta({
		title: 'Components/Layout/Stack',
		component: Stack,
		tags: ['autodocs'],
		args: { direction: 'column', gap: 3, wrap: false },
		argTypes: { direction: { control: 'inline-radio', options: ['row', 'column'] }, gap: { control: 'number' } }
	});
	const box = 'padding: 8px 14px; border-radius: 8px; background: var(--aui-subtle, #eee)';
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByText('One').parentElement).toHaveStyle({ 'flex-direction': 'column' })}>
	<Stack gap={3}><div style={box}>One</div><div style={box}>Two</div><div style={box}>Three</div></Stack>
</Story>
<Story name="HStack and VStack" asChild>
	<VStack gap={4}>
		<HStack gap={2}><div style={box}>A</div><div style={box}>B</div><div style={box}>C</div></HStack>
		<HStack gap={2} justify="space-between"><div style={box}>Left</div><div style={box}>Right</div></HStack>
	</VStack>
</Story>
