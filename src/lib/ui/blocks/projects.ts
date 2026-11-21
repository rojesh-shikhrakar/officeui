// Shared types, demo data and helpers for the project dashboard, task views (table, board, roadmap, insights) and the task detail.
export type Status = 'Todo' | 'In progress' | 'In review' | 'Done';
export const STATUSES: Status[] = ['Todo', 'In progress', 'In review', 'Done'];
export const STATUS_COLOR: Record<Status, string> = {
	Todo: '#9ca3af',
	'In progress': '#f59e0b',
	'In review': '#8b5cf6',
	Done: '#10b981'
};
export type Priority = 'Low' | 'Medium' | 'High';
export type AssetKind = 'pdf' | 'image' | 'link' | 'audio' | 'video';
export type Asset = { id: string; kind: AssetKind; name: string; url: string };
export type Comment = { id: string; author: string; body: string; at: string };
export type ProjectTask = {
	id: string;
	title: string;
	status: Status;
	assignee: string;
	priority: Priority;
	/** ISO dates (YYYY-MM-DD) */
	start: string;
	end: string;
	/** When it was completed (ISO date) – feeds the burn charts */
	doneAt?: string;
	/** Rich-text description as HTML (sanitised before it is shown) */
	description: string;
	assets: Asset[];
	/** Comments only show in the task detail, never in the table, board or roadmap */
	comments: Comment[];
};
export type ProjectHealth = 'On track' | 'At risk' | 'Off track' | 'Done';
export type Project = {
	id: string;
	name: string;
	owner: string;
	health: ProjectHealth;
	updated: string;
	due: string;
	hue: number;
	tasks: ProjectTask[];
};

export const DAY = 86_400_000;
export const toDay = (iso: string) => Math.floor(Date.parse(iso + 'T00:00:00Z') / DAY);
export const fromDay = (d: number) => new Date(d * DAY).toISOString().slice(0, 10);
export const fmtDay = (iso: string) =>
	new Date(iso + 'T00:00:00Z').toLocaleDateString('en', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});
export const progress = (p: Project) =>
	p.tasks.length ? p.tasks.filter((t) => t.status === 'Done').length / p.tasks.length : 0;
export const HEALTH_TONE: Record<ProjectHealth, string> = {
	'On track': 'green',
	'At risk': 'amber',
	'Off track': 'red',
	Done: 'blue'
};

const ALLOWED = new Set([
	'B',
	'STRONG',
	'I',
	'EM',
	'U',
	'S',
	'P',
	'BR',
	'UL',
	'OL',
	'LI',
	'A',
	'H1',
	'H2',
	'H3',
	'BLOCKQUOTE',
	'CODE',
	'PRE',
	'DIV',
	'SPAN'
]);
/** Strips everything but basic formatting tags, event handlers and non-http(s)/mailto links, so a description is safe to render as HTML. */
export function sanitizeHtml(html: string): string {
	if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '');
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const walk = (node: Element) => {
		for (const el of [...node.children]) {
			if (!ALLOWED.has(el.tagName)) {
				el.replaceWith(
					...(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(el.tagName)
						? []
						: [...el.childNodes])
				);
				continue;
			}
			for (const a of [...el.attributes])
				if (!(
					el.tagName === 'A' &&
					a.name === 'href' &&
					/^(https?:|mailto:|#)/i.test(a.value.trim())
				))
					el.removeAttribute(a.name);
			if (el.tagName === 'A') {
				el.setAttribute('rel', 'noopener noreferrer');
				el.setAttribute('target', '_blank');
			}
			walk(el);
		}
	};
	walk(doc.body);
	return doc.body.innerHTML;
}

const T = (
	id: string,
	title: string,
	status: Status,
	assignee: string,
	priority: Priority,
	start: string,
	end: string,
	doneAt?: string,
	description = ''
): ProjectTask => ({
	id,
	title,
	status,
	assignee,
	priority,
	start,
	end,
	doneAt,
	description,
	assets: [],
	comments: []
});
const tasks1: ProjectTask[] = [
	T(
		'LA-1',
		'Competitor pricing research',
		'Done',
		'Maya',
		'Medium',
		'2026-10-05',
		'2026-10-12',
		'2026-10-11',
		'<p>Compare <b>five competitors</b> and summarise the findings.</p>'
	),
	T(
		'LA-2',
		'Plan structure and limits',
		'Done',
		'Jon',
		'High',
		'2026-10-08',
		'2026-10-16',
		'2026-10-17'
	),
	T(
		'LA-3',
		'Write the plan copy',
		'Done',
		'Maya',
		'Medium',
		'2026-10-14',
		'2026-10-24',
		'2026-10-23'
	),
	T('LA-4', 'Design the pricing page', 'In review', 'Priya', 'High', '2026-10-15', '2026-10-30'),
	T(
		'LA-5',
		'Checkout and proration fixes',
		'In progress',
		'Jon',
		'High',
		'2026-10-20',
		'2026-11-06'
	),
	T('LA-6', 'Billing emails', 'In progress', 'Sam', 'Low', '2026-10-27', '2026-11-10'),
	T('LA-7', 'Help center articles', 'Todo', 'Maya', 'Low', '2026-11-03', '2026-11-14'),
	T('LA-8', 'Launch announcement', 'Todo', 'Priya', 'Medium', '2026-11-10', '2026-11-18')
];
tasks1[0].comments = [
	{
		id: 'c1',
		author: 'Jon',
		body: 'Great summary – can we add the enterprise tiers too?',
		at: '2026-10-11'
	}
];
tasks1[0].assets = [
	{ id: 'a1', kind: 'link', name: 'Competitor sheet', url: 'https://example.com/pricing-sheet' }
];
export const PROJECTS: Project[] = [
	{
		id: 'launch',
		name: 'Pricing launch',
		owner: 'Maya',
		health: 'On track',
		updated: '2026-11-09',
		due: '2026-11-18',
		hue: 210,
		tasks: tasks1
	},
	{
		id: 'mobile',
		name: 'Mobile app v2',
		owner: 'Jon',
		health: 'At risk',
		updated: '2026-11-07',
		due: '2026-12-15',
		hue: 150,
		tasks: [
			T('MA-1', 'Offline mode', 'In progress', 'Jon', 'High', '2026-10-20', '2026-11-20'),
			T(
				'MA-2',
				'Push notifications',
				'Done',
				'Sam',
				'Medium',
				'2026-10-01',
				'2026-10-25',
				'2026-10-24'
			),
			T('MA-3', 'Biometric login', 'Todo', 'Priya', 'Medium', '2026-11-15', '2026-12-05'),
			T('MA-4', 'Store listing refresh', 'Todo', 'Maya', 'Low', '2026-12-01', '2026-12-15')
		]
	},
	{
		id: 'brand',
		name: 'Brand refresh',
		owner: 'Priya',
		health: 'Done',
		updated: '2026-10-30',
		due: '2026-10-31',
		hue: 320,
		tasks: [
			T(
				'BR-1',
				'Logo exploration',
				'Done',
				'Priya',
				'Medium',
				'2026-09-20',
				'2026-10-05',
				'2026-10-04'
			),
			T(
				'BR-2',
				'Guidelines document',
				'Done',
				'Priya',
				'Low',
				'2026-10-06',
				'2026-10-28',
				'2026-10-30'
			)
		]
	},
	{
		id: 'hiring',
		name: 'Hiring plan',
		owner: 'Sam',
		health: 'Off track',
		updated: '2026-10-12',
		due: '2026-11-01',
		hue: 30,
		tasks: [
			T(
				'HP-1',
				'Define the roles',
				'Done',
				'Sam',
				'Medium',
				'2026-09-25',
				'2026-10-05',
				'2026-10-06'
			),
			T('HP-2', 'Open the job posts', 'In progress', 'Sam', 'High', '2026-10-06', '2026-10-20'),
			T('HP-3', 'Interview loop', 'Todo', 'Jon', 'Medium', '2026-10-21', '2026-11-01')
		]
	}
];
