// Tiny chart helpers for the rebuilt pieces: a smooth line or area path from values.
export function linePath(values: number[], w: number, h: number, max = Math.max(...values, 1), pad = 2) {
	const step = values.length > 1 ? w / (values.length - 1) : w;
	const pts = values.map((v, i) => [i * step, h - pad - (v / max) * (h - pad * 2)]);
	return pts.reduce((d, [x, y], i) => {
		if (!i) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
		const [px, py] = pts[i - 1];
		const cx = (px + x) / 2;
		return `${d}C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
	}, '');
}
export const areaPath = (values: number[], w: number, h: number, max?: number) => `${linePath(values, w, h, max)}L${w} ${h}L0 ${h}Z`;
/** A gently wandering series, stable for a given seed */
export function series(n: number, seed = 1, base = 10, spread = 8) {
	let s = seed;
	const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
	let v = base;
	return Array.from({ length: n }, () => (v = Math.max(0, v + (rnd() - 0.5) * spread)));
}
