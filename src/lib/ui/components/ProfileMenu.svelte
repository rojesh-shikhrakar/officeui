<!-- Profile Menu – Account card with the signed-in user, menu actions and profile setup progress. -->
<script lang="ts" module>
	export type ProfileMenuItem = { id: string; label: string; icon?: 'settings' | 'language' | 'docs' | 'apps' | 'logout'; badge?: string; onSelect?: () => void };
	export type ProfileSetup = { done: number; total: number; next?: string; onContinue?: () => void };
	const fmt = new Intl.NumberFormat('en');
	const finite = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : 0);
	const ICONS: Record<string, string> = {
		settings:
			'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
		language: 'm5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6',
		docs: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8',
		apps: 'M4.5 3h4A1.5 1.5 0 0 1 10 4.5v4A1.5 1.5 0 0 1 8.5 10h-4A1.5 1.5 0 0 1 3 8.5v-4A1.5 1.5 0 0 1 4.5 3ZM4.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4A1.5 1.5 0 0 1 4.5 14ZM15.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4a1.5 1.5 0 0 1 1.5-1.5ZM17.5 3v7M14 6.5h7',
		logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'
	};
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import './profile-menu.css';

	let {
		name = 'Alex Morgan',
		email = 'alex@acme.com',
		avatar,
		items = [
			{ id: 'settings', label: 'Settings', icon: 'settings' },
			{ id: 'docs', label: 'Docs', icon: 'docs' },
			{ id: 'apps', label: 'Apps', icon: 'apps', badge: 'New' },
			{ id: 'logout', label: 'Logout', icon: 'logout' }
		],
		setup = { done: 3, total: 5, next: 'Add a profile photo' },
		class: cls
	}: { name?: string; email?: string; avatar?: Snippet; items?: ProfileMenuItem[]; setup?: ProfileSetup; class?: string } = $props();

	let root: HTMLElement;
	let listEl: HTMLDivElement;
	let filled = $state(false);
	const shownName = $derived(typeof name === 'string' ? name.trim() : '');
	// The progress bar fills up once the card is on screen
	onMount(() => {
		const io = new IntersectionObserver(([e]) => e.isIntersecting && ((filled = true), io.disconnect()), { threshold: 0.3 });
		io.observe(root);
		return () => io.disconnect();
	});
	// Arrow keys move between the actions, like in a native menu
	function onkey(e: KeyboardEvent) {
		const buttons = [...listEl.querySelectorAll<HTMLButtonElement>('button')];
		const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
		const next = e.key === 'ArrowDown' ? (i + 1) % buttons.length : e.key === 'ArrowUp' ? (i - 1 + buttons.length) % buttons.length : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : null;
		if (next === null) return;
		e.preventDefault();
		buttons[next]?.focus();
	}
	const total = $derived(Math.max(0, finite(setup?.total)));
	const done = $derived(Math.min(total, Math.max(0, finite(setup?.done))));
	const ratio = $derived(total > 0 ? done / total : 0);
</script>

{#snippet svg(d: string)}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

<section bind:this={root} class={['ui-pmc', cls]} data-filled={filled || undefined}>
	<div class="ui-pmc__card">
		<header class="ui-pmc__user">
			<span class="ui-pmc__avatar">
				{#if avatar}{@render avatar()}{:else}
					<svg viewBox="0 0 40 40" aria-hidden="true">
						<circle cx="20" cy="20" r="20" fill="currentColor" opacity="0.1" />
						<circle cx="20" cy="16" r="4.75" fill="currentColor" />
						<path d="M11.5 28.25c.9-4 4.3-6.75 8.5-6.75s7.6 2.75 8.5 6.75c.15.7-.4 1.25-1.1 1.25H12.6c-.7 0-1.25-.55-1.1-1.25Z" fill="currentColor" />
					</svg>
				{/if}
			</span>
			<span class="ui-pmc__who">
				{#if shownName}<span class="ui-pmc__name" dir="auto" title={shownName}>{shownName}</span>{/if}
				<span class="ui-pmc__email" dir="auto" title={email}>{email}</span>
			</span>
		</header>
		<div bind:this={listEl} class="ui-pmc__items" role="menu" tabindex="-1" aria-label="Account" onkeydown={onkey}>
			{#each items as item, i (`${item.id}-${i}`)}
				<button type="button" role="menuitem" class="ui-pmc__item" onclick={item.onSelect}>
					<span class="ui-pmc__icon">{#if item.icon}{@render svg(ICONS[item.icon])}{/if}</span>
					<span class="ui-pmc__label" dir="auto" title={item.label}>{item.label}</span>
					{#if item.badge}<span class="ui-pmc__badge" dir="auto" title={item.badge}>{item.badge}</span>{/if}
				</button>
			{/each}
		</div>
		{#if setup}
			<div class="ui-pmc__setup">
				<div class="ui-pmc__setup-head">
					<span class="ui-pmc__setup-title">Profile setup</span>
					<span class="ui-pmc__setup-count">{fmt.format(done)}/{fmt.format(total)}</span>
				</div>
				<span class="ui-pmc__track" role="progressbar" aria-label="Profile setup" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
					<span class="ui-pmc__fill" style:transform="scaleX({ratio})"></span>
				</span>
				{#if setup.next && done < total}
					<button type="button" class="ui-pmc__next" onclick={setup.onContinue}>
						<span class="ui-pmc__next-label" dir="auto" title={setup.next}><span class="ui-pmc__next-hint">Next:</span> {setup.next}</span>
						{@render svg('M5 12h14M13 6l6 6-6 6')}
					</button>
				{/if}
			</div>
		{/if}
	</div>
</section>
