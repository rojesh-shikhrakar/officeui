import type { Snippet } from 'svelte';

export type Toast = { id: number; tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; description?: string; action?: Snippet | string };

/** ms: auto-dismiss delay (default 5000, 0 = sticky) */
export function useToasts(ms?: number) {
	let toasts = $state<Toast[]>([]);
	let n = 0;
	function dismiss(id: number) {
		toasts = toasts.filter((t) => t.id !== id);
	}
	function push(t: Omit<Toast, 'id'>) {
		const id = ++n;
		toasts = [...toasts, { id, ...t }];
		if (ms !== 0) setTimeout(() => dismiss(id), ms || 5000);
		return id;
	}
	return {
		get toasts() {
			return toasts;
		},
		push,
		dismiss
	};
}
