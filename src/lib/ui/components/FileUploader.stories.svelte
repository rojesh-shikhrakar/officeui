<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import FileUploader from './FileUploader.svelte';

	const { Story } = defineMeta({
		title: 'Components/Inputs/File Uploader',
		component: FileUploader,
		tags: ['autodocs'], args: { label: 'Attachments', hint: 'PDF or PNG, up to 5 MB', multiple: true, maxSize: 5242880 }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByLabelText(/Drag files here/)).toBeInTheDocument()} />
<Story
	name="With files"
	args={{
		files: [
			{ id: '1', name: 'brief.pdf', size: 204800, status: 'done' },
			{ id: '2', name: 'logo.png', size: 1048576, status: 'uploading', progress: 62 },
			{ id: '3', name: 'notes.docx', size: 40960, status: 'error', error: 'Network lost' },
			{ id: '4', name: 'draft.txt', size: 900 }
		]
	}} />
<Story name="Compact" args={{ compact: true }} />
<Story name="Error" args={{ error: 'Add at least one file.' }} />
<Story name="Disabled" args={{ disabled: true }} />
