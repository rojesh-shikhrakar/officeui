<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import AvatarGroup from './AvatarGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/AvatarGroup',
		component: AvatarGroup,
		tags: ['autodocs'],
		args: { people: [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper', tone: 'brand' }, { name: 'Alan Turing', tone: 'accent' }, { name: 'Linus T' }, { name: 'Margaret H' }, { name: 'Dennis R' }], max: 4, size: 'md' },
		argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByLabelText('2 more')).toHaveTextContent('+2')} />
<Story name="Small" args={{ size: 'sm', max: 3 }} />
