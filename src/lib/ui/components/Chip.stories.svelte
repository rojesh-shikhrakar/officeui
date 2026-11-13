<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import Chip from './Chip.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Chip',
		component: Chip,
		tags: ['autodocs'],
		args: { tone: 'neutral', variant: 'outline', size: 'md', selected: false, disabled: false },
		argTypes: {
			tone: { control: 'select', options: ['neutral', 'accent', 'success', 'danger', 'warning', 'info'] },
			variant: { control: 'inline-radio', options: ['outline', 'soft'] },
			size: { control: 'inline-radio', options: ['sm', 'md'] }
		}
	});
	const onclick = fn();
	const onremove = fn();
</script>

<Story name="Default" asChild>
	<Chip>Design</Chip>
</Story>
<Story
	name="Toggle and remove"
	asChild
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await userEvent.click(c.getByRole('button', { name: 'Billing' }));
		await expect(onclick).toHaveBeenCalled();
		await userEvent.click(c.getByRole('button', { name: 'Remove Billing' }));
		await expect(onremove).toHaveBeenCalled();
	}}>
	<Chip {onclick} {onremove} label="Billing">Billing</Chip>
</Story>
<Story name="Variants" asChild>
	<div style="display: flex; gap: 8px; flex-wrap: wrap">
		<Chip variant="soft">Soft</Chip>
		<Chip variant="soft" tone="success">Success</Chip>
		<Chip variant="soft" tone="danger">Danger</Chip>
		<Chip variant="soft" tone="info" size="sm">Small</Chip>
		<Chip selected onclick={() => {}}>Selected</Chip>
		<Chip disabled>Disabled</Chip>
	</div>
</Story>
