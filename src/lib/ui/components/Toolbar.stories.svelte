<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Toolbar from './Toolbar.svelte';
	const { Story } = defineMeta({ title: 'Components/Navigation/Toolbar', component: Toolbar, tags: ['autodocs'] });
</script>

<Story name="Horizontal" args={{ label: "Invoice actions", groups: [[{ id: "star", label: "Star", icon: "star", pressed: true }, { id: "folder", label: "Move", icon: "folder" }], [{ id: "trash", label: "Delete", icon: "trash", showLabel: true }]] }} />
<Story name="Vertical" args={{ orientation: "vertical", label: "Editor tools", groups: [[{ id: "home", label: "Home", icon: "home" }, { id: "star", label: "Star", icon: "star", disabled: true }]] }} />
