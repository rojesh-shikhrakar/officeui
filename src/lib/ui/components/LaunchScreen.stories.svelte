<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LaunchScreen from './LaunchScreen.svelte';
	const { Story } = defineMeta({ title: 'Components/Feedback/LaunchScreen', component: LaunchScreen, tags: ['autodocs'] });
</script>

<Story name="Brand" args={{ title: "OfficeUI", tagline: "Books that close themselves.", footer: "Version 2.14", loading: true }} />
<Story name="Loaded" args={{ title: "OfficeUI", tagline: "Ready when you are.", loading: false }} />
