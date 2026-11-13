// Scripted demos: the Pro pieces play a short scenario on their own, like the originals.
// With reduced motion (and in tests) the first `still` steps run at once and nothing moves.
export type Step = [delay: number, run: () => void];
export function play(steps: Step[], opts: { still?: number; loop?: () => void; autoplay?: boolean } = {}) {
	const { still = steps.length, loop, autoplay = true } = opts;
	const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!autoplay || reduce) {
		steps.slice(0, still).forEach(([, run]) => run());
		return () => {};
	}
	let timer: ReturnType<typeof setTimeout>;
	let i = 0;
	const next = () => {
		if (i >= steps.length) {
			if (loop) (loop(), (i = 0), (timer = setTimeout(next, 600)));
			return;
		}
		const [delay, run] = steps[i++];
		timer = setTimeout(() => (run(), next()), delay);
	};
	next();
	return () => clearTimeout(timer);
}
/** Repeats `run` every `ms` while motion is allowed; returns a cleanup. */
export function tick(ms: number, run: () => void) {
	if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
	const t = setInterval(run, ms);
	return () => clearInterval(t);
}
