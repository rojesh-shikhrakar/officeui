<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageControl from './PageControl.svelte';
	const { Story } = defineMeta({ title: 'Components/Navigation/PageControl', component: PageControl, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ count: 5, current: 2, label: "Onboarding steps" }} />
<Story name="Small" args={{ count: 4, current: 0, size: "sm", label: "Slides" }} />
