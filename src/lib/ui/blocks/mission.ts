// Demo data shared by the Mission Control and Mission Timeline blocks.
export type Agent = { name: string; model: string; mark: string; color: string; status: 'running' | 'done' | 'needs' | 'failed' | 'idle'; task: string; cost: number; time: string; parent?: string; bars?: { from: number; to: number; label: string; needs?: boolean }[] };
export type Ask = { title: string; detail: string; state: 'waiting' | 'failed'; age: string };
export const AGENTS: Agent[] = [
	{ name: 'Launch lead', model: 'Atlas Max', mark: '✳', color: '#d97757', status: 'running', task: 'Launch the new pricing page by Friday', cost: 2.15, time: '26m 40s', bars: [{ from: 4, to: 9, label: 'Plan the launch' }, { from: 10, to: 30, label: 'Coordinate the team' }] },
	{ name: 'Researcher', model: 'Atlas Pro', mark: '✳', color: '#d97757', status: 'done', task: 'Compare the pricing of five competitors', cost: 0.18, time: '15m 00s', parent: 'Launch lead', bars: [{ from: 6, to: 18, label: 'Competitor pricing' }] },
	{ name: 'Writer', model: 'Atlas Pro', mark: '✳', color: '#d97757', status: 'running', task: 'Write the copy for the three plans', cost: 0.21, time: '18m 40s', parent: 'Launch lead', bars: [{ from: 14, to: 30, label: 'Draft plan copy' }] },
	{ name: 'Release', model: 'Orbit Pro', mark: '◎', color: '#171717', status: 'needs', task: 'Merge the checkout fix', cost: 0.34, time: '14m 40s', parent: 'Launch lead', bars: [{ from: 17, to: 30, label: 'Merge the checkout fix', needs: true }] },
	{ name: 'Support lead', model: 'Atlas Pro', mark: '✳', color: '#d97757', status: 'running', task: 'Answer the open tickets in the queue', cost: 1.02, time: '29m 40s', bars: [{ from: 0, to: 30, label: 'Answer 38 tickets' }] },
	{ name: 'Billing', model: 'Atlas Pro', mark: '✳', color: '#d97757', status: 'failed', task: 'Refund $240 to a customer', cost: 0.08, time: '2m 10s', parent: 'Support lead', bars: [{ from: 9, to: 12, label: 'Refund' }] },
	{ name: 'Ops', model: 'Prism Flash', mark: '✦', color: '#3b82f6', status: 'needs', task: 'Rotate the API keys', cost: 0.05, time: '11m 40s', bars: [{ from: 1, to: 5, label: 'Sync CRM' }, { from: 20, to: 30, label: 'Rotate API keys', needs: true }] }
];
export const ASKS: Ask[] = [
	{ title: 'Merge the checkout fix', detail: 'All 212 tests are green – merge to main?', state: 'waiting', age: '14m 03s' },
	{ title: 'Refund $240 to a customer', detail: 'The refund was declined – the card on file expired', state: 'failed', age: '' },
	{ title: 'Rotate the API keys', detail: 'Rotate the payment keys in production now?', state: 'waiting', age: '11m 03s' }
];
/** Activity over the last 45 minutes: a few humps where agents were busy */
export const ACTIVITY = [0, 0.1, 0.5, 0.9, 0.4, 0.2, 0.55, 0.3, 0.05, 0, 0, 0.1, 0.4, 1, 0.6, 0.15, 0.05, 0.1, 0.35, 0.25, 0.4, 0.3, 0.45, 0.35, 0.2, 0.1, 0.05, 0.05, 0.02, 0];
