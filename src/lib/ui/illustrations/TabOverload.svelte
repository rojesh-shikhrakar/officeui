<!-- Tab Overload – Overlapping browser windows where the highlight follows the hovered window. -->
<script lang="ts">
	import './tab-overload.css';
	let { label = 'Three overlapping browser windows full of placeholder content', class: cls }: { label?: string; class?: string } = $props();
	const _pid = $props.id();
	const id = 'ui-to' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const windows = [
		{ n: 1, x: 30, y: 68 },
		{ n: 2, x: 125, y: 56 },
		{ n: 3, x: 220, y: 44 }
	];
</script>

<div class={['ui-to', cls]} role="img" aria-label={label}>
	<svg class="ui-to-art" viewBox="0 0 360 240" aria-hidden="true">
		<defs>
			<linearGradient id="{id}-blob-h" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFB89E" stop-opacity="0.3" /><stop offset="50%" stop-color="#C8A8E5" stop-opacity="0.3" /><stop offset="100%" stop-color="#A8B5FF" stop-opacity="0.3" /></linearGradient>
			<linearGradient id="{id}-blob-v" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF6B5C" stop-opacity="0.3" /><stop offset="100%" stop-color="#FFB89E" stop-opacity="0.3" /></linearGradient>
			<filter id="{id}-blur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="12" /></filter>
			<linearGradient id="{id}-stroke" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B5C0FF" /><stop offset="40%" stop-color="#D5BBEF" /><stop offset="75%" stop-color="#FFC5AB" /><stop offset="100%" stop-color="#FFB5BC" /></linearGradient>
		</defs>
		{#each windows as { n, x, y } (n)}
			<g>
				<g class="ui-to-blobs ui-to-blobs-{n}">
					<ellipse cx={x + 70} cy={y + 8} rx="90" ry="14" fill="url(#{id}-blob-h)" filter="url(#{id}-blur)" />
					<ellipse cx={x + 8} cy={y + 96} rx="14" ry="90" fill="url(#{id}-blob-v)" filter="url(#{id}-blur)" />
				</g>
				<g class="ui-to-tab ui-to-tab-{n}" transform="translate({x} {y})">
					<rect class="ui-to-frame" width="380" height="300" rx="6" fill="#F4F5F7" stroke="#E4E7EC" stroke-width="0.7" />
					<circle class="ui-to-dot" cx="14" cy="14" r="3" fill="#CCCCCC" /><circle class="ui-to-dot" cx="24" cy="14" r="3" fill="#CCCCCC" /><circle class="ui-to-dot" cx="34" cy="14" r="3" fill="#CCCCCC" />
					<rect class="ui-to-page" x="4" y="24" width="372" height="272" rx="5" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="0.7" />
				</g>
				<g class="ui-to-content ui-to-content-{n}" transform="translate({x} {y})">
					<rect class="ui-to-bar" x="12" y="36" width="30" height="30" rx="4" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="52" y="38" width="100" height="6" rx="2" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="52" y="46" width="100" height="6" rx="2" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="52" y="54" width="35" height="6" rx="2" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="12" y="72" width="140" height="6" rx="2" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="12" y="80" width="140" height="6" rx="2" fill="#EFF1F4" />
					<rect class="ui-to-bar" x="12" y="88" width="55" height="6" rx="2" fill="#EFF1F4" />
				</g>
			</g>
		{/each}
		{#each windows as { n, x, y } (n)}
			<g class="ui-to-front ui-to-front-{n}">
				<circle cx={x + 14} cy={y + 14} r="3" fill="#FF6B5C" /><circle cx={x + 24} cy={y + 14} r="3" fill="#FFB89E" /><circle cx={x + 34} cy={y + 14} r="3" fill="#A8B5FF" />
				<path d="M {x} 240 L {x} {y + 6} A 6 6 0 0 1 {x + 6} {y} L {n === 3 ? 360 : x + 95} {y}" fill="none" stroke="url(#{id}-stroke)" stroke-width="0.8" />
			</g>
		{/each}
	</svg>
</div>
