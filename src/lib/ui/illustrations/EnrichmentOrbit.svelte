<!-- Enrichment Orbit – A tile inside two rings with comets and data nodes orbiting around it. -->
<script lang="ts">
	import { OWN_MARK } from '../utils/marks';
	import './enrichment-orbit.css';
	let { label = 'A product tile with data nodes orbiting around it', mark = OWN_MARK, class: cls }: { label?: string; /** Path (24×24) for the centre tile */ mark?: string; class?: string } = $props();
	const _pid = $props.id();
	const id = 'ui-eo' + _pid.replace(/[^a-zA-Z0-9_-]/g, '');
	const nodeDelays = ['0s', '-7.33s', '-14.66s'];
	const FILTERS: [string, number, number, number, number, number][] = [
		['tile', 4, 3, -4, 30, 0.06],
		['node', 2.5, 2, -3, 60, 0.07]
	];
</script>

<div class={['ui-eo', cls]} role="img" aria-label={label}>
	<svg class="ui-eo-art" viewBox="0 0 320 240" aria-hidden="true">
		<defs>
			{#each FILTERS as [k, blur, dy, up, pad, op] (k)}
				<filter id="{id}-{k}" x="-{pad}%" y="-{pad}%" width="{100 + 2 * pad}%" height="{100 + 2 * pad}%">
					<feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="dropBlur" />
					<feOffset in="dropBlur" dx="0" {dy} result="dropOffset" />
					<feFlood class="ui-eo-drop" flood-color="#000000" flood-opacity={op} result="dropColor" />
					<feComposite in="dropColor" in2="dropOffset" operator="in" result="dropShadow" />
					<feOffset in="SourceAlpha" dx="0" dy={up} result="alphaUp" />
					<feComposite in="SourceAlpha" in2="alphaUp" operator="out" result="sliver" />
					<feFlood class="ui-eo-sliver" flood-color="#EAECEF" flood-opacity="1" result="innerColor" />
					<feComposite in="innerColor" in2="sliver" operator="in" result="innerShadow" />
					<feMerge><feMergeNode in="dropShadow" /><feMergeNode in="SourceGraphic" /><feMergeNode in="innerShadow" /></feMerge>
				</filter>
			{/each}
			<linearGradient id="{id}-comet">
				<stop offset="0%" stop-color="#FF6B5C" stop-opacity="0" /><stop offset="22%" stop-color="#FFB89E" stop-opacity="0.9" /><stop offset="50%" stop-color="#C8A8E5" stop-opacity="0.9" /><stop offset="78%" stop-color="#A8B5FF" stop-opacity="0.9" /><stop offset="100%" stop-color="#A8B5FF" stop-opacity="0" />
			</linearGradient>
		</defs>
		<g class="ui-eo-rings" fill="none" stroke="#E4E7EC" stroke-width="1.2">
			<circle cx="160" cy="120" r="56" stroke-opacity="0.45" />
			<circle cx="160" cy="120" r="80" />
		</g>
		<g class="ui-eo-spin"><path fill="none" stroke="url(#{id}-comet)" stroke-width="1.6" stroke-linecap="round" d="M114.1 54.5 A80 80 0 0 1 205.9 54.5" /></g>
		<g class="ui-eo-spin ui-eo-reverse"><path fill="none" stroke="url(#{id}-comet)" stroke-width="1.6" stroke-linecap="round" d="M120.4 80.4 A56 56 0 0 1 199.6 80.4" /></g>
		<rect class="ui-eo-tile" x="134" y="94" width="52" height="52" rx="12" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="0.5" filter="url(#{id}-tile)" />
		<svg x="147" y="107" width="26" height="26" viewBox="0 0 24 24" overflow="visible"><path class="ui-eo-mark" fill="#171717" d={mark} /></svg>
		{#each nodeDelays as delay (delay)}
			<g class="ui-eo-orbit" style:animation-delay={delay}>
				<g class="ui-eo-upright" style:animation-delay={delay}>
					<circle class="ui-eo-tile" cx="160" cy="40" r="17" fill="#FFFFFF" stroke="#E4E7EC" stroke-width="0.5" filter="url(#{id}-node)" />
					<g transform="translate(154 34) scale(0.0288)" class="ui-eo-icon" fill="#6B6F76" fill-opacity="0.55"><path d="M278 88C278 115.614 300.386 138 328 138H366C393.614 138 416 160.386 416 188V228C416 255.614 393.614 278 366 278H328C300.386 278 278 300.386 278 328V366C278 393.614 255.614 416 228 416H188C160.386 416 138 393.614 138 366V328C138 300.386 115.614 278 88 278H50C22.3858 278 0 255.614 0 228V188C0 160.386 22.3858 138 50 138H88C115.614 138 138 115.614 138 88V50C138 22.3858 160.386 0 188 0H228C255.614 0 278 22.3858 278 50V88ZM140 226C140 253.614 162.386 276 190 276H226C253.614 276 276 253.614 276 226V190C276 162.386 253.614 140 226 140H190C162.386 140 140 162.386 140 190V226Z" /></g>
				</g>
			</g>
		{/each}
	</svg>
</div>
