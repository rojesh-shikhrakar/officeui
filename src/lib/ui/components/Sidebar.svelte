<!-- Sidebar – collapsible nav with sections, nested items, rail mode with flyouts, switchable views and a user menu. -->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { MenuEntry } from './Menu.svelte';
	export type SidebarItem = {
		id: string; label: string; icon?: string | Snippet; badge?: Snippet; hint?: string; open?: boolean;
		/** Sub-items. Shown below the item, or in a flyout beside it in the rail (or when `side` is set). */
		children?: SidebarItem[]; side?: boolean;
		/** A menu opened in a flyout beside the item. */
		menu?: MenuEntry[];
	};
	export type SidebarSection = { heading?: string; collapsible?: boolean; action?: { label: string; icon?: string; onclick: () => void }; /** Rendered above the heading (hidden in the rail). */ before?: Snippet; items: SidebarItem[] };
	export type SidebarView = { id: string; label: string; icon: string; sections: SidebarSection[] };
	export type SidebarUser = { name: string; email?: string; org?: string; src?: string };
	export type SidebarLayout = 'expanded' | 'compact' | 'rail';
</script>

<script lang="ts">
	import Avatar from './Avatar.svelte';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Menu from './Menu.svelte';
	import './sidebar.css';
	type Item = SidebarItem;
	let {
		sections = [], views, view = $bindable(), layout = $bindable('expanded'), layouts = false, activeId = $bindable(), collapsed = false, edge = true,
		header, footer, label, user, userMenu = [], onselect, oncollapse, onuserselect, class: cls = ''
	}: {
		sections?: SidebarSection[]; views?: SidebarView[]; view?: string; layout?: SidebarLayout; layouts?: boolean; activeId?: string; collapsed?: boolean;
		/** Stick to the browser edge and fill the viewport height. */
		edge?: boolean; header?: Snippet; footer?: Snippet; label?: string;
		user?: SidebarUser; userMenu?: MenuEntry[];
		onselect?: (id: string, item: Item) => void; oncollapse?: () => void; onuserselect?: (it: MenuEntry) => void; class?: string;
	} = $props();

	const eff: SidebarLayout = $derived(collapsed ? 'rail' : layout);
	const rail = $derived(eff === 'rail');
	const curView = $derived(views?.find((v) => v.id === (view ?? views[0]?.id)) ?? views?.[0]);
	const secs = $derived(curView ? curView.sections : sections);

	let open: Record<string, boolean> = $state({});
	let shut: Record<number, boolean> = $state({});
	// svelte-ignore state_referenced_locally
	for (const s of [...sections, ...(views?.flatMap((v) => v.sections) ?? [])]) for (const it of s.items) if (it.children && (it.open || it.children.some((c) => c.id === activeId))) open[it.id] = true;

	// Flyouts are position: fixed so the scrolling nav and the sidebar edge never clip them.
	type Fly = { key: string; trigger: HTMLElement; where: 'side' | 'up' | 'down'; items: MenuEntry[]; pick?: (it: MenuEntry) => void; head?: string; label?: string; style: string; hover?: boolean };
	let fly: Fly | null = $state(null);
	function closeFly(refocus = false) { const t = fly?.trigger; fly = null; if (refocus) t?.focus(); }
	function openFly(key: string, trigger: HTMLElement, where: 'side' | 'up' | 'down', f: Omit<Fly, 'key' | 'trigger' | 'style' | 'where'>) {
		if (fly?.key === key) return closeFly();
		const r = trigger.getBoundingClientRect();
		// side flyouts are attached flush to the sidebar's edge (borders overlap by 1px), not the button's
		const edgeX = trigger.closest('aside')?.getBoundingClientRect().right ?? r.right;
		const style = where === 'side' ? `left: ${edgeX - 1}px; top: ${Math.max(8, r.top - 5)}px`
			: where === 'up' ? `left: ${r.left}px; bottom: ${innerHeight - r.top + 6}px; min-width: ${Math.max(r.width, 240)}px`
			: `left: ${r.left}px; top: ${r.bottom + 6}px`;
		fly = { key, trigger, style, where, ...f };
	}
	const asEntries = (list: Item[]): MenuEntry[] => list.map((c) => ({ label: c.label, icon: typeof c.icon === 'string' ? c.icon : undefined, onSelect: () => { activeId = c.id; onselect?.(c.id, c); } }));

	function activate(e: MouseEvent, it: Item, depth: number) {
		const btn = e.currentTarget as HTMLElement;
		if (it.menu) return openFly(it.id, btn, 'side', { items: it.menu, label: it.label });
		if (it.children && (rail || it.side)) return openFly(it.id, btn, 'side', { items: asEntries(it.children), label: it.label });
		if (it.children) { closeFly(); open[it.id] = !open[it.id]; return; }
		closeFly();
		activeId = it.id;
		onselect?.(it.id, it);
	}
	function toggleLayout() { if (oncollapse) oncollapse(); else layout = rail ? 'expanded' : 'rail'; }
	function layoutMenu(e: MouseEvent) {
		const items: MenuEntry[] = (['expanded', 'compact', 'rail'] as const).map((l) => ({ type: 'radio', label: l[0].toUpperCase() + l.slice(1), checked: eff === l, onSelect: () => (layout = l) }));
		openFly('layout', e.currentTarget as HTMLElement, 'down', { items, label: 'Sidebar layout' });
	}
	function userMenuOpen(e: MouseEvent) {
		openFly('user', e.currentTarget as HTMLElement, 'up', { items: userMenu, head: user?.email, label: 'Account', pick: (it) => onuserselect?.(it) });
	}
	const flyOpen = (id: string) => fly?.key === id;
	/** Centre the flyout's first row on its trigger, and keep it on screen. */
	function align(node: HTMLElement) {
		// Portal to <body>: a transformed ancestor (e.g. a docs canvas) would otherwise become the containing block of position: fixed.
		document.body.appendChild(node);
		const gone = { destroy: () => node.remove() }; // Svelte can't find a moved node to remove
		if (!fly) return gone;
		const first = node.querySelector<HTMLElement>('[role^="menuitem"]');
		const t = fly.trigger.getBoundingClientRect();
		let top = parseFloat(node.style.top);
		node.style.animation = 'none'; // measure without the entry transform
		if (fly.where === 'side' && first) { const a = first.getBoundingClientRect(); top += t.top + t.height / 2 - (a.top + a.height / 2); }
		top = Math.min(top, innerHeight - node.offsetHeight - 8);
		node.style.animation = '';
		if (fly.where !== 'up') fly.style = fly.style.replace(/top: [\d.-]+px/, `top: ${Math.max(8, top)}px`);
		return gone;
	}

	// Keyboard: arrows move between rows, Right opens a flyout or expands, Left collapses.
	function navkey(e: KeyboardEvent) {
		const rows = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.ui-sdb__item')];
		const i = rows.indexOf(document.activeElement as HTMLElement);
		if (i < 0) return;
		const cur = rows[i];
		const go = (n: number) => { e.preventDefault(); rows[(n + rows.length) % rows.length].focus(); };
		if (e.key === 'ArrowDown') go(i + 1);
		else if (e.key === 'ArrowUp') go(i - 1);
		else if (e.key === 'Home') go(0);
		else if (e.key === 'End') go(rows.length - 1);
		else if (e.key === 'ArrowRight' && cur.getAttribute('aria-expanded') === 'false') { e.preventDefault(); cur.click(); }
		else if (e.key === 'ArrowLeft' && cur.getAttribute('aria-expanded') === 'true') { e.preventDefault(); cur.click(); }
	}

	// Rail: hovering a row with a submenu previews it; it closes once the pointer leaves both.
	let hoverTimer: ReturnType<typeof setTimeout> | undefined;
	function hoverIn(e: MouseEvent, it: Item) {
		if (!rail || !(it.menu || it.children)) return;
		clearTimeout(hoverTimer);
		const btn = e.currentTarget as HTMLElement;
		hoverTimer = setTimeout(() => { if (fly?.key !== it.id) { fly = null; activate({ currentTarget: btn } as unknown as MouseEvent, it, 0); if (fly) (fly as Fly).hover = true; } }, 120);
	}
	function hoverOut() { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => { if (fly?.hover) fly = null; }, 200); }
	const keep = () => clearTimeout(hoverTimer);
</script>

{#snippet item(it: Item, depth: number)}
	{@const on = activeId === it.id}
	{@const popup = !!it.menu || (!!it.children && (rail || !!it.side))}
	{@const isOpen = !!it.children && !popup && open[it.id]}
	<li class="ui-sdb__li">
		<button type="button" class="ui-sdb__item {on ? 'is-active' : ''} {depth ? 'is-child' : ''}" aria-current={on ? 'page' : undefined}
			aria-expanded={popup ? (flyOpen(it.id) ? 'true' : 'false') : it.children ? (isOpen ? 'true' : 'false') : undefined} aria-haspopup={popup ? 'menu' : undefined}
			title={rail ? it.label : undefined} aria-label={rail ? it.label : undefined} onclick={(e) => activate(e, it, depth)} onmouseenter={(e) => hoverIn(e, it)} onmouseleave={hoverOut}>
			{#if it.icon}<span class="ui-sdb__icon">{#if typeof it.icon === 'string'}<Icon name={it.icon} />{:else}{@render it.icon()}{/if}</span>{/if}
			{#if !rail}
				<span class="ui-sdb__label">{it.label}</span>{#if it.hint}<span class="ui-sdb__hint">{it.hint}</span>{/if}{@render it.badge?.()}
				{#if popup}<Icon name="chevron-right" size={14} class="ui-sdb__arrow" />{:else if it.children}<Icon name="chevron-down" size={14} class="ui-sdb__chev" />{/if}
			{/if}
		</button>
		{#if isOpen}<ul class="ui-sdb__sub">{#each it.children! as c (c.id)}{@render item(c, 1)}{/each}</ul>{/if}
	</li>
{/snippet}

<svelte:window onresize={() => closeFly()} onkeydown={(e) => { if (e.key === 'Escape' && fly) { e.stopPropagation(); closeFly(true); } }} onmousedown={(e) => { if (fly && !(e.target as HTMLElement).closest?.('.ui-sdb-fly, [aria-haspopup="menu"][aria-expanded="true"]')) fly = null; }} />

<aside class="ui-sdb ui-sdb--{eff} {edge ? 'ui-sdb--edge' : ''} {cls}" aria-label={label ?? 'Sidebar'}>
	<div class="ui-sdb__top">
		<Button variant="ghost" size="sm" aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'} onclick={toggleLayout}>{#snippet icon()}<Icon name="panel-left" />{/snippet}</Button>
		{#if views && views.length > 1}
			<div class="ui-sdb__views" role="group" aria-label="Sidebar views">
				{#each views as v (v.id)}
					<button type="button" class="ui-sdb__tool" aria-label={v.label} title={v.label} aria-pressed={curView?.id === v.id ? 'true' : 'false'} onclick={() => { closeFly(); view = v.id; }}><Icon name={v.icon} /></button>
				{/each}
			</div>
		{/if}
		{#if layouts}
			<span class="ui-sdb__topend"><Button variant="ghost" size="sm" aria-label="Sidebar layout" aria-haspopup="menu" aria-expanded={flyOpen('layout') ? 'true' : 'false'} onclick={layoutMenu}>{#snippet icon()}<Icon name="grid" />{/snippet}</Button></span>
		{/if}
	</div>
	{#if header && !rail}<div class="ui-sdb__head">{@render header()}</div>{/if}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<nav class="ui-sdb__nav" aria-label={curView?.label} onkeydown={navkey} onscroll={() => closeFly()}>
		{#each secs as s, i (curView?.id + ':' + i)}
			<div class="ui-sdb__sec">
				{#if s.before && !rail}<div class="ui-sdb__before">{@render s.before()}</div>{/if}
				{#if s.heading && !rail}
					<div class="ui-sdb__heading">
						{#if s.collapsible}
							<button type="button" class="ui-sdb__headbtn" aria-expanded={shut[i] ? 'false' : 'true'} onclick={() => (shut[i] = !shut[i])}>{s.heading}<Icon name="chevron-down" size={12} class="ui-sdb__chev" /></button>
						{:else}<span>{s.heading}</span>{/if}
						{#if s.action}<button type="button" class="ui-sdb__add" aria-label={s.action.label} title={s.action.label} onclick={s.action.onclick}><Icon name={s.action.icon ?? 'plus'} size={14} /></button>{/if}
					</div>
				{/if}
				{#if !(s.collapsible && shut[i] && !rail)}<ul class="ui-sdb__list">{#each s.items as it (it.id)}{#if !rail || it.icon}{@render item(it, 0)}{/if}{/each}</ul>{/if}
			</div>
		{/each}
	</nav>
	{#if footer && !rail}<div class="ui-sdb__foot">{@render footer()}</div>{/if}
	{#if user}
		<div class="ui-sdb__userwrap">
			<button type="button" class="ui-sdb__user" aria-haspopup="menu" aria-expanded={flyOpen('user') ? 'true' : 'false'} aria-label={rail ? user.name : undefined} onclick={userMenuOpen}>
				<Avatar name={user.name} src={user.src} size="sm" />
				{#if !rail}<span class="ui-sdb__usertext"><b>{user.name}</b>{#if user.org}<span>{user.org}</span>{/if}</span><Icon name="chevron-up" size={14} class="ui-sdb__arrow" />{/if}
			</button>
		</div>
	{/if}
</aside>

{#if fly}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ui-sdb-fly ui-sdb-fly--{fly.where}" style={fly.style} use:align onmouseenter={keep} onmouseleave={hoverOut}>
		{#if fly.head}<div class="ui-sdb-fly__head">{fly.head}</div>{/if}
		<Menu items={fly.items} autoFocus bare label={fly.label} onclose={() => closeFly(true)} onpick={(it) => { fly?.pick?.(it); closeFly(); }} />
	</div>
{/if}
