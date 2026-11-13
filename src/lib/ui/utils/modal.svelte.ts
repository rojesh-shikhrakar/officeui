// Shared modal focus management (focus on open, restore on close, Escape, Tab trap).
export function modal(get: () => { open?: boolean; ref?: HTMLElement; onclose?: () => void; noAutofocus?: boolean }) {
	$effect(() => {
		const { open, ref, noAutofocus } = get();
		if (!open) return;
		const prev = document.activeElement as HTMLElement | null;
		if (ref && !noAutofocus) ref.focus();
		return () => {
			if (prev?.focus && !noAutofocus) prev.focus();
		};
	});
	return {
		onkey(e: KeyboardEvent) {
			const { ref, onclose } = get();
			if (e.key === 'Escape' && onclose) {
				e.stopPropagation();
				onclose();
			}
			if (e.key === 'Tab' && ref) {
				const f = ref.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
				if (!f.length) return;
				const a = f[0], z = f[f.length - 1];
				if (e.shiftKey && (document.activeElement === a || document.activeElement === ref)) { e.preventDefault(); z.focus(); }
				else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
			}
		}
	};
}
