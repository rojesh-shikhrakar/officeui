<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Tile from './Tile.svelte';
	import TileGroup from './TileGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Tile',
		component: Tile,
		tags: ['autodocs'],
		args: { title: 'Standard plan', description: 'Up to 10 seats', meta: '$29 per month', icon: 'star', selected: false, disabled: false },
		argTypes: { type: { control: 'inline-radio', options: ['radio', 'checkbox'] } }
	});
	const plans = [
		{ value: 'starter', title: 'Starter', description: '1 seat' },
		{ value: 'standard', title: 'Standard', description: 'Up to 10 seats' },
		{ value: 'business', title: 'Business', description: 'Unlimited seats' }
	];
</script>

<Story name="Default" />
<Story name="Selected" args={{ selected: true }} />
<Story name="Disabled" args={{ disabled: true }} />
<Story
	name="Single group"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('radio', { name: /Business/ }));
		await expect(c.getByRole('radio', { name: /Business/ })).toBeChecked();
		await userEvent.keyboard('{ArrowRight}');
		await expect(c.getByRole('radio', { name: /Starter/ })).toBeChecked();
	}}
>
	<TileGroup label="Plan" hint="You can change this later." value="standard" options={plans} />
</Story>
<Story name="Multiple group" asChild>
	<TileGroup type="multiple" label="Notifications" columns={2} value={['email']} options={[{ value: 'email', title: 'Email', icon: 'check' }, { value: 'sms', title: 'Text message' }, { value: 'push', title: 'Push', disabled: true }]} />
</Story>
