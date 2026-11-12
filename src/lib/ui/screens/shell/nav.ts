// Sidebar menus shared by the screens. Icons are plain glyphs so nothing is tied to an icon set.
export type NavItem = { id: string; label: string; icon?: string; count?: number; dot?: boolean; indent?: boolean };
export type NavSection = { label?: string; items: NavItem[] };
const I = (id: string, label: string, icon = '', o: Partial<NavItem> = {}): NavItem => ({ id, label, icon, ...o });
export const CHAT_NAV: NavSection[] = [
	{ items: [I('new', 'New chat', '✎'), I('folders', 'Folders', '▭'), I('apps', 'Integrations', '⊞')] },
	{ label: 'Pinned', items: [I('pin1', 'Q3 launch messaging')] },
	{ label: 'Projects', items: [I('q3', 'Q3 Campaign', '▭'), I('q3a', 'Ad hooks for the linen overshirt', '', { indent: true, dot: true }), I('q3b', 'Q3 budget split by channel', '', { indent: true }), I('brand', 'Brand assets', '▭'), I('hiring', 'Hiring', '▭'), I('research', 'Research', '▭')] },
	{ label: 'Chats', items: [I('c1', 'Onboarding email draft'), I('c2', 'August content calendar')] }
];
export const AGENT_NAV: NavSection[] = [
	{ items: [I('thread', 'Thread', '◎'), I('inbox', 'Inbox', '▤', { count: 5 }), I('tasks', 'Tasks', '☰'), I('memory', 'Memory', '◍')] },
	{ label: 'Workspace', items: [I('schedules', 'Schedules', '▦'), I('activity', 'Activity', '◷'), I('usage', 'Usage', '◫'), I('permissions', 'Permissions', '⛉'), I('settings', 'Settings', '⚙')] }
];
export const ORCH_NAV: NavSection[] = [
	{ items: [I('orch', 'Orchestrations', '⛬'), I('runs', 'Runs', '◷', { count: 3 }), I('agents', 'Agents', '◎'), I('traces', 'Traces', '☰'), I('datasets', 'Datasets', '◫')] },
	{ label: 'Workspace', items: [I('knowledge', 'Knowledge', '▤'), I('settings', 'Settings', '⚙')] }
];
export const SETTINGS_NAV: NavSection[] = [
	{ label: 'Personal', items: [I('profile', 'Profile', '◍'), I('preferences', 'Preferences', '☰'), I('notifications', 'Notifications', '◔'), I('privacy', 'Privacy', '⛉')] },
	{ label: 'Workspace', items: [I('general', 'General', '⚙'), I('members', 'Members', '⚇'), I('models', 'Models', '✦'), I('security', 'Security', '⚿'), I('billing', 'Billing', '▭')] }
];
