// Helpers shared by ToolCallCard and ToolCallGroup – 
export type ToolCallStatus = 'running' | 'success' | 'error';
export type ToolCall = {
	/** Tool name as the agent calls it, shown in mono */
	name: string;
	/** Short human summary */
	summary?: string;
	status: ToolCallStatus;
	/** Arguments – objects are pretty-printed, JSON strings parsed */
	args?: unknown;
	/** What the tool returned */
	result?: unknown;
	/** Error message, shown when status is "error" */
	error?: string;
	/** When the call started (ms since epoch) – the live timer counts from here */
	startedAt?: number;
	/** Final duration in ms */
	duration?: number;
};

/** Live ms while running, the final value after. accumulate = add up several running stretches. */
export class Stopwatch {
	ms = $state<number | null>(null);
	#start: number | null = null;
	#base = 0;
	constructor(running: () => boolean, startedAt: () => number | undefined, accumulate: boolean) {
		$effect(() => {
			const run = running();
			const since = startedAt();
			if (!run) {
				if (this.#start !== null) {
					this.#base += Date.now() - this.#start;
					this.#start = null;
					this.ms = this.#base;
				}
				return;
			}
			if (!accumulate) this.#base = 0;
			this.#start = since ?? Date.now();
			const tick = () => (this.ms = this.#base + Date.now() - (this.#start ?? Date.now()));
			tick();
			const t = setInterval(tick, 100);
			return () => clearInterval(t);
		});
	}
}

/** 0.4s, 12.3s, 2m 05s, 3h 12m, 2d 4h */
export function formatMs(ms: number, live: boolean) {
	if (!live && ms < 1000) return `${Math.max(1, Math.round(ms))}ms`;
	if (ms < 60_000) return `${(Math.floor(ms / 100) / 10).toFixed(1)}s`;
	const s = Math.floor(ms / 1000);
	if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
	const h = Math.floor(s / 3600);
	if (h < 24) return `${h}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m`;
	return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export function toText(value: unknown): { text: string; json: boolean } {
	if (typeof value === 'string') {
		const t = value.trim();
		if (t.startsWith('{') || t.startsWith('[')) {
			try {
				return { text: JSON.stringify(JSON.parse(t), null, 2), json: true };
			} catch {
				/* not JSON */
			}
		}
		return { text: value, json: false };
	}
	try {
		const s = JSON.stringify(value, null, 2);
		return s === undefined ? { text: String(value), json: false } : { text: s, json: true };
	} catch {
		return { text: String(value), json: false };
	}
}

const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
/** Splits JSON text into tokens: [text, kind?] where kind is key, str, lit or num */
export function highlight(text: string): [string, string?][] {
	const out: [string, string?][] = [];
	const re = new RegExp(TOKEN.source, 'g');
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text))) {
		if (m.index > last) out.push([text.slice(last, m.index)]);
		if (m[1] && m[2]) out.push([m[1], 'key'], [m[2]]);
		else out.push([m[0], m[1] ? 'str' : /^[tfn]/.test(m[0]) ? 'lit' : 'num']);
		last = m.index + m[0].length;
	}
	if (last < text.length) out.push([text.slice(last)]);
	return out;
}

export async function copyText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		area.style.cssText = 'position:fixed;opacity:0';
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand('copy');
		area.remove();
		return ok;
	}
}
