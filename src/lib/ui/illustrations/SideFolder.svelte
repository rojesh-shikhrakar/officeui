<!-- Side Folder – ported from affectUI (MIT). Glassy blue folder on its side; documents slide out as the pocket swings open on hover. -->
<script lang="ts">
	import './side-folder.css';
	let { label = 'Blue folder on its side, with three documents peeking out behind a frosted front pocket', class: cls }: { label?: string; class?: string } = $props();
	const FRONT = 'M40 0H290Q330 0 330 40V318Q330 338 344 348L364 362Q380 372 380 396V480Q380 520 340 520H40Q0 520 0 480V40Q0 0 40 0Z';
	const LINES = [78, 180, 140, 175, 126, 168, 110];
	const _pid = $props.id();
	const id = 'ui-sf' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
</script>

<div class={['ui-sf', cls]} role="img" aria-label={label}>
	<div class="ui-sf-icon" aria-hidden="true">
		<svg class="ui-sf-layer ui-sf-back" viewBox="0 0 440 520">
			<defs>
				<filter id="{id}-hl" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
					<feOffset in="blur" dy="3" result="offset" />
					<feComposite in="blur" in2="offset" operator="arithmetic" k2="1" k3="-1" result="diff" />
					<feFlood flood-color="#fff" flood-opacity="0.65" />
					<feComposite in2="diff" operator="in" result="light" />
					<feComposite in="light" in2="SourceAlpha" operator="in" />
				</filter>
			</defs>
			<rect x="0" y="18" width="440" height="486" rx="36" fill="#5bb7ea" />
			<rect x="0" y="18" width="440" height="486" rx="36" fill="#000" filter="url(#{id}-hl)" />
		</svg>
		<svg class="ui-sf-layer" viewBox="0 0 440 520">
			<defs>
				<linearGradient id="{id}-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" /><stop offset="100%" stop-color="#eaf2f8" /></linearGradient>
				<symbol id="{id}-doc" overflow="visible">
					<rect x="0.6" y="0.6" width="278.8" height="348.8" rx="19.4" fill="url(#{id}-paper)" stroke="rgba(0,0,0,0.12)" stroke-width="1.2" />
					{#each LINES as w, i (i)}<rect x="30" y={87 + i * 28} width={w} height="9" rx="4.5" fill="rgba(0,0,0,0.12)" />{/each}
				</symbol>
			</defs>
			<g transform="scale(1.15)">
				<use class="ui-sf-doc ui-sf-doc--top" href="#{id}-doc" />
				<use class="ui-sf-doc ui-sf-doc--bottom" href="#{id}-doc" />
				<use class="ui-sf-doc ui-sf-doc--middle" href="#{id}-doc" />
			</g>
		</svg>
		<div class="ui-sf-front"><svg viewBox="0 0 380 520"><path d={FRONT} fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" /></svg></div>
	</div>
</div>
