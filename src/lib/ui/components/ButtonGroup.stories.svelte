<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import ButtonGroup from './ButtonGroup.svelte';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Button Group',
		component: ButtonGroup,
		tags: ['autodocs'], args: { label: 'Alignment', attached: true, orientation: 'horizontal' }, argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } }
	});
</script>

<Story name="Default" asChild play={async ({ canvasElement }) => expect(within(canvasElement).getByRole('group')).toHaveAccessibleName('Alignment')}>
	<ButtonGroup label="Alignment">
		<Button variant="secondary" label="Left" />
		<Button variant="secondary" label="Center" />
		<Button variant="secondary" label="Right" />
	</ButtonGroup>
</Story>
<Story name="Spaced" asChild>
	<ButtonGroup label="Actions" attached={false}>
		<Button variant="ghost" label="Cancel" />
		<Button label="Save" />
	</ButtonGroup>
</Story>
<Story name="Vertical" asChild>
	<ButtonGroup label="Zoom" orientation="vertical">
		<Button variant="secondary" label="In" />
		<Button variant="secondary" label="Out" />
	</ButtonGroup>
</Story>
