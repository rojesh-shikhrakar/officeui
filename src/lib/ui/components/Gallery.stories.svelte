<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import Gallery from './Gallery.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Gallery',
		component: Gallery,
		tags: ['autodocs'],
		args: {
			label: 'Site photos',
			columns: 3,
			lightbox: true,
			items: [
				{ id: 1, alt: 'Front entrance', caption: 'Front entrance' },
				{ id: 2, alt: 'Loading dock', caption: 'Loading dock' },
				{ id: 3, alt: 'Reception', caption: 'Reception' },
				{ id: 4, alt: 'Meeting room', caption: 'Meeting room' }
			]
		},
		argTypes: { variant: { control: 'inline-radio', options: ['grid', 'mosaic'] } }
	});
</script>

<Story name="Grid" args={{ lightbox: false }} />
<Story name="Mosaic" args={{ variant: 'mosaic', lightbox: false, items: [{ id: 1, alt: 'Front entrance', wide: true }, { id: 2, alt: 'Loading dock', tall: true }, { id: 3, alt: 'Reception' }, { id: 4, alt: 'Meeting room' }] }} />
<Story name="Two columns" args={{ columns: 2, ratio: '1 / 1', lightbox: false, items: [{ id: 1, alt: 'Receipt one', caption: 'INV-20418' }, { id: 2, alt: 'Receipt two', caption: 'INV-20419' }] }} />
<Story
	name="Lightbox"
	play={async ({ canvasElement }) => {
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Loading dock, open' }));
		const dlg = within(canvasElement).getByRole('dialog');
		await expect(dlg).toBeVisible();
		await expect(within(dlg).getByText('2 of 4')).toBeVisible();
	}}
/>
