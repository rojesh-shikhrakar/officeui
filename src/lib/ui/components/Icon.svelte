<!-- Icon – stroke icon from the ICONS path map (icons.ts); unknown names fall back to "info". -->
<script lang="ts">
	import { ICONS } from '../utils/icons';
	import './icon.css';

	type Props = {
		/** A key of ICONS */
		name: string;
		size?: number;
		/** Accessible name; without it the icon is decorative */
		label?: string;
		class?: string;
	};
	let { name, size = 16, label, class: cls = '' }: Props = $props();
</script>

<svg class={['ui-ico', cls]} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}>
	<path d={ICONS[name] ?? ICONS.info} />
</svg>
