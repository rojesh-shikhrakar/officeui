<!-- App Shell Flat – the app shell laid flat: grey sidebar, an edge-to-edge page and the work area beside it. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppShellInset from './AppShellInset.svelte';
	let { workspace = 'Acme', user = 'Alex Morgan', panel = true, children }: { workspace?: string; user?: string; panel?: boolean; children?: Snippet } = $props();
</script>

<AppShellInset {workspace} {user} {panel} variant="flat" {children} />
