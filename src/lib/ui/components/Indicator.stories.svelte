<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import Indicator from './Indicator.svelte';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Indicator',
		component: Indicator,
		tags: ['autodocs'],
		args: { count: 5, dot: false, max: 99, tone: 'danger', position: 'top-right', pulse: false },
		argTypes: { tone: { control: 'select', options: ['neutral', 'success', 'danger', 'warning', 'info', 'accent'] }, position: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] } }
	});
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('status')).toHaveTextContent('5')}>
	<div style="padding: 16px"><Indicator count={5}><Icon name="bell" size={22} /></Indicator></div>
</Story>
<Story name="Variants" asChild>
	<div style="display: flex; gap: 28px; padding: 16px">
		<Indicator count={120}><Icon name="message" size={22} /></Indicator>
		<Indicator dot pulse tone="success"><Icon name="user" size={22} /></Indicator>
		<Indicator count={0} showZero position="bottom-left" tone="neutral"><Icon name="folder" size={22} /></Indicator>
	</div>
</Story>
