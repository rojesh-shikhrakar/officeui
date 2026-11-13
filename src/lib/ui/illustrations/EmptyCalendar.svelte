<!-- Empty Calendar – Stacked calendar cards marked empty, fanning out on hover. -->
<script lang="ts">
	import './empty-calendar.css';
	let { label = 'Stacked calendar cards marked empty, with a disabled join meeting button', class: cls }: { label?: string; class?: string } = $props();
	const _pid = $props.id();
	const id = 'ui-ec' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const shadow = `url(#${id}-shadow)`;
</script>

{#snippet card()}
	<rect class="ui-ec-card" x="40" y="20" width="240" height="140" rx="10" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="0.5" filter={shadow} />
	<text class="ui-ec-title" x="56" y="48" font-size="13" font-weight="500" fill="#8A8A8A">Calendar</text>
	<g transform="translate(218 34)">
		<rect class="ui-ec-badge" width="46" height="18" rx="5" fill="#FEF8EF" />
		<text x="23" y="12" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="0.06em" fill="#FAB082">EMPTY</text>
	</g>
	<rect class="ui-ec-bar" x="56" y="64" width="208" height="7" rx="2" fill="#EFF1F4" />
	<rect class="ui-ec-bar" x="56" y="74" width="208" height="7" rx="2" fill="#EFF1F4" />
	<rect class="ui-ec-bar" x="56" y="84" width="168" height="7" rx="2" fill="#EFF1F4" />
	<g transform="translate(56 104)">
		<rect class="ui-ec-btn" width="208" height="40" rx="8" fill="#F4F4F6" stroke="#E4E7EC" stroke-width="0.5" />
		<g class="ui-ec-btn-ink" transform="translate(64 14)" fill="none" stroke="#9A9AA3" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="6" cy="6" r="5" /><line x1="2.5" y1="9.5" x2="9.5" y2="2.5" />
		</g>
		<text class="ui-ec-btn-label" x="84" y="24" font-size="10" font-weight="500" fill="#9A9AA3">Join meeting</text>
	</g>
{/snippet}

<div class={['ui-ec', cls]} role="img" aria-label={label}>
	<svg class="ui-ec-art" viewBox="0 0 320 240" aria-hidden="true">
		<defs>
			<filter id="{id}-blur" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="14" /></filter>
			<filter id="{id}-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow class="ui-ec-drop" dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.06" /></filter>
			<linearGradient id="{id}-blob" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#FFA0AB" stop-opacity="0.25" /><stop offset="33%" stop-color="#FFB89E" stop-opacity="0.25" /><stop offset="66%" stop-color="#C8A8E5" stop-opacity="0.25" /><stop offset="100%" stop-color="#A8B5FF" stop-opacity="0.25" />
			</linearGradient>
			<linearGradient id="{id}-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop class="ui-ec-edge" offset="0%" stop-color="#E4E7EC" /><stop offset="18%" stop-color="#FFB5BC" /><stop offset="40%" stop-color="#FFC5AB" /><stop offset="60%" stop-color="#D5BBEF" /><stop offset="82%" stop-color="#B5C0FF" /><stop class="ui-ec-edge" offset="100%" stop-color="#E4E7EC" />
			</linearGradient>
		</defs>
		<g transform="translate(30 47) scale(0.814)">
			<g class="ui-ec-back ui-ec-back-left">{@render card()}</g>
			<g class="ui-ec-back ui-ec-back-right">{@render card()}</g>
			<g class="ui-ec-front">
				<ellipse class="ui-ec-blob" cx="160" cy="152" rx="125" ry="35" fill="url(#{id}-blob)" filter="url(#{id}-blur)" />
				{@render card()}
				<path d="M40 150 A 10 10 0 0 0 50 160 L270 160 A 10 10 0 0 0 280 150" fill="none" stroke="url(#{id}-stroke)" stroke-width="0.5" />
			</g>
		</g>
	</svg>
</div>
