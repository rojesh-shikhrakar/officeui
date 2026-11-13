// Generated placeholder portraits (no real photos): a soft gradient disc with initials, as a data URL.
export function avatarUrl(name: string, hue: number) {
	const initials = name
		.split(/\s+/)
		.map((w) => w[0] ?? '')
		.join('')
		.slice(0, 2)
		.toUpperCase();
	const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue} 80% 78%)'/><stop offset='1' stop-color='hsl(${(hue + 40) % 360} 70% 58%)'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/><text x='48' y='58' text-anchor='middle' font-family='Inter,Arial,sans-serif' font-size='30' font-weight='600' fill='white'>${initials}</text></svg>`;
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
