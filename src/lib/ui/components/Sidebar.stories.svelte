<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';
	import type { MenuEntry } from './Menu.svelte';
	import { expect, fn, within, waitFor } from 'storybook/test';
	const views = [
		{ id: 'work', label: 'Workspace', icon: 'home', sections: [
			{ items: [{ id: 'new', label: 'New invoice', icon: 'plus' }, { id: 'search', label: 'Search', icon: 'search', hint: '⌘K' }, { id: 'reports', label: 'Reports', icon: 'layers', children: [{ id: 'aging', label: 'Aging' }, { id: 'cash', label: 'Cash flow' }] },
				{ id: 'more', label: 'More', icon: 'more-horizontal', menu: [{ label: 'Import CSV', icon: 'upload' }, { label: 'Export', icon: 'download', items: [{ label: 'PDF' }, { label: 'CSV' }] }] }] },
			{ heading: 'Recent', collapsible: true, action: { label: 'New folder', onclick: () => {} }, items: [{ id: 'inv-20418', label: 'INV-20418 Acme Ltd' }, { id: 'inv-20419', label: 'INV-20419 Globex' }] }
		] },
		{ id: 'files', label: 'Files', icon: 'folder', sections: [{ heading: 'Folders', items: [{ id: 'invoices', label: 'Invoices', icon: 'folder' }, { id: 'receipts', label: 'Receipts', icon: 'folder' }] }] }
	];
	const userMenu: MenuEntry[] = [
		{ type: 'radio', label: 'Fusemachines', description: 'Team', checked: true }, { type: 'radio', label: 'Personal', description: 'Free' }, { type: 'separator' },
		{ label: 'Settings', icon: 'settings', shortcut: 'Ctrl+,' }, { label: 'Language', icon: 'globe' }, { label: 'Get help', icon: 'help-circle' }, { label: 'Send feedback', icon: 'message' }, { type: 'separator' },
		{ label: 'View all plans', icon: 'list' }, { label: 'View changelog', icon: 'file' }, { label: 'Learn more', icon: 'info', items: [{ label: 'About' }, { label: 'Terms' }] },
		{ label: 'Get API keys', icon: 'key', external: true }, { type: 'separator' }, { label: 'Log out', icon: 'log-out' }
	];
	const user = { name: 'Rojesh', org: 'Fusemachines', email: 'rojesh@fusemachines.com' };
	const { Story } = defineMeta({ title: 'Components/Navigation/Sidebar', component: Sidebar, tags: ['autodocs'] });
</script>

<Story name="Default" args={{ label: "Main", activeId: "invoices", sections: [{ heading: "Billing", items: [{ id: "invoices", label: "Invoices", icon: "file" }, { id: "customers", label: "Customers", icon: "user" }] }, { items: [{ id: "settings", label: "Settings", icon: "settings", children: [{ id: "team", label: "Team" }, { id: "plans", label: "Plans" }] }] }] }}>
	{#snippet template(args)}<div style="height: 360px"><Sidebar edge={false} {...args}>{#snippet header()}<strong>OfficeUI</strong>{/snippet}</Sidebar></div>{/snippet}
</Story>
<Story name="Collapsed" args={{ collapsed: true, label: "Main", activeId: "invoices", sections: [{ items: [{ id: "invoices", label: "Invoices", icon: "file" }, { id: "customers", label: "Customers", icon: "user" }] }] }}>
	{#snippet template(args)}<div style="height: 240px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Expands submenu and selects" args={{ label: "Main", activeId: "invoices", onselect: fn(), sections: [{ items: [{ id: "invoices", label: "Invoices", icon: "file" }, { id: "settings", label: "Settings", icon: "settings", children: [{ id: "team", label: "Team" }] }] }] }}
	play={async ({ canvas, userEvent, args }) => {
		const settings = canvas.getByRole('button', { name: 'Settings' });
		await expect(settings).toHaveAttribute('aria-expanded', 'false');
		await userEvent.click(settings);
		await expect(settings).toHaveAttribute('aria-expanded', 'true');
		await userEvent.click(canvas.getByRole('button', { name: 'Team' }));
		await expect(args.onselect).toHaveBeenCalledWith('team', expect.objectContaining({ id: 'team' }));
		await userEvent.click(settings);
		await expect(settings).toHaveAttribute('aria-expanded', 'false');
	}}>
	{#snippet template(args)}<div style="height: 360px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Collapse button" args={{ label: "Main", oncollapse: fn(), sections: [{ items: [{ id: "invoices", label: "Invoices", icon: "file" }] }] }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
		await expect(args.oncollapse).toHaveBeenCalledTimes(1);
	}}>
	{#snippet template(args)}<div style="height: 240px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Workspace" parameters={{ layout: 'fullscreen' }} args={{ label: "Main", activeId: "inv-20418", layouts: true, views, user, userMenu, onuserselect: fn() }}>
	{#snippet template(args)}<div style="display: flex; min-height: 100dvh"><Sidebar {...args} /><main style="flex: 1; padding: 2rem">Page content</main></div>{/snippet}
</Story>
<Story name="Switches view" args={{ label: "Main", views }}
	play={async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'New invoice' })).toBeInTheDocument();
		await userEvent.click(canvas.getByRole('button', { name: 'Files' }));
		await expect(canvas.getByRole('button', { name: 'Files' })).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.queryByRole('button', { name: 'New invoice' })).not.toBeInTheDocument();
		await expect(canvas.getByRole('button', { name: 'Invoices' })).toBeInTheDocument();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Layout menu" args={{ label: "Main", layouts: true, views }}
	play={async ({ canvas, userEvent, canvasElement }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Sidebar layout' }));
		const menu = within(document.body).getByRole('menu', { name: 'Sidebar layout' });
		await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'Rail' }));
		await expect(canvasElement.querySelector('.ui-sdb--rail')).not.toBeNull();
		await userEvent.click(canvas.getByRole('button', { name: 'Expand sidebar' }));
		await expect(canvasElement.querySelector('.ui-sdb--expanded')).not.toBeNull();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Flyouts" args={{ label: "Main", views, onselect: fn() }}
	play={async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Reports' }));
		await expect(canvas.getByRole('button', { name: 'Aging' })).toBeInTheDocument();
		await userEvent.click(canvas.getByRole('button', { name: 'More' }));
		const menu = within(document.body).getByRole('menu', { name: 'More' });
		await expect(within(menu).getByRole('menuitem', { name: /Import CSV/ })).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="User menu" args={{ label: "Main", user, userMenu, onuserselect: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Rojesh/ }));
		const menu = within(document.body).getByRole('menu', { name: 'Account' });
		await expect(within(document.body).getByText('rojesh@fusemachines.com')).toBeInTheDocument();
		await expect(within(menu).getByRole('menuitemradio', { name: /Fusemachines/ })).toHaveAttribute('aria-checked', 'true');
		await userEvent.hover(within(menu).getByRole('menuitem', { name: /Learn more/ }));
		await expect(await within(document.body).findByRole('menuitem', { name: 'Terms' })).toBeInTheDocument();
		await userEvent.click(within(menu).getByRole('menuitem', { name: /Log out/ }));
		await expect(args.onuserselect).toHaveBeenCalledTimes(1);
		await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
	}}>
	{#snippet template(args)}<div style="height: 520px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Flyout aligns with its row" args={{ label: "Main", views, onselect: fn() }}
	play={async ({ canvas, userEvent, canvasElement }) => {
		const row = canvas.getByRole('button', { name: 'More' });
		await userEvent.click(row);
		const menu = within(document.body).getByRole('menu', { name: 'More' });
		(menu.closest('.ui-sdb-fly') as HTMLElement).style.animation = 'none'; // measure the settled position
		const first = within(menu).getAllByRole('menuitem')[0];
		const sidebar = canvasElement.querySelector('aside')!.getBoundingClientRect();
		const r = row.getBoundingClientRect();
		const f = first.getBoundingClientRect();
		// first row is vertically centred on the trigger, and the flyout is attached flush to the sidebar edge
		await expect(Math.abs(f.top + f.height / 2 - (r.top + r.height / 2))).toBeLessThan(3);
		await expect(Math.abs(menu.closest('.ui-sdb-fly')!.getBoundingClientRect().left - sidebar.right)).toBeLessThanOrEqual(1);
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Keyboard navigation" args={{ label: "Main", views, onselect: fn() }}
	play={async ({ canvas, userEvent }) => {
		canvas.getByRole('button', { name: 'New invoice' }).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect(canvas.getByRole('button', { name: /Search/ })).toHaveFocus();
		await userEvent.keyboard('{ArrowDown}');
		await expect(canvas.getByRole('button', { name: 'Reports' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(canvas.getByRole('button', { name: 'Reports' })).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{ArrowLeft}');
		await expect(canvas.getByRole('button', { name: 'Reports' })).toHaveAttribute('aria-expanded', 'false');
		await userEvent.keyboard('{End}');
		await expect(canvas.getAllByRole('button', { name: /INV-20419/ })[0]).toHaveFocus();
		await userEvent.keyboard('{Home}');
		await expect(canvas.getByRole('button', { name: 'New invoice' })).toHaveFocus();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Selection follows clicks" args={{ label: "Main", views, activeId: "new", onselect: fn() }}
	play={async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /INV-20419/ }));
		await expect(canvas.getByRole('button', { name: /INV-20419/ })).toHaveAttribute('aria-current', 'page');
		await expect(canvas.getByRole('button', { name: 'New invoice' })).not.toHaveAttribute('aria-current');
		await expect(args.onselect).toHaveBeenCalledWith('inv-20419', expect.anything());
		await userEvent.click(canvas.getByRole('button', { name: 'Reports' }));
		await userEvent.click(canvas.getByRole('button', { name: 'Cash flow' }));
		await expect(canvas.getByRole('button', { name: 'Cash flow' })).toHaveAttribute('aria-current', 'page');
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Rail previews on hover" args={{ label: "Main", layout: "rail", views, onselect: fn() }}
	play={async ({ canvas, userEvent }) => {
		await userEvent.hover(canvas.getByRole('button', { name: 'Reports' }));
		const menu = await within(document.body).findByRole('menu', { name: 'Reports' });
		await expect(within(menu).getByRole('menuitem', { name: 'Aging' })).toBeInTheDocument();
		await userEvent.unhover(canvas.getByRole('button', { name: 'Reports' }));
		await waitFor(() => expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument());
		await userEvent.click(canvas.getByRole('button', { name: 'Reports' }));
		await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Cash flow' }));
		await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
<Story name="Collapsible section" args={{ label: "Main", views }}
	play={async ({ canvas, userEvent }) => {
		const head = canvas.getByRole('button', { name: 'Recent' });
		await expect(canvas.getByRole('button', { name: /INV-20418/ })).toBeInTheDocument();
		await userEvent.click(head);
		await expect(head).toHaveAttribute('aria-expanded', 'false');
		await expect(canvas.queryByRole('button', { name: /INV-20418/ })).not.toBeInTheDocument();
		await userEvent.click(head);
		await expect(canvas.getByRole('button', { name: /INV-20418/ })).toBeInTheDocument();
	}}>
	{#snippet template(args)}<div style="height: 420px"><Sidebar edge={false} {...args} /></div>{/snippet}
</Story>
