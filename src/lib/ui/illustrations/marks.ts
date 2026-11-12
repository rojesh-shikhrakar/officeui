// Neutral placeholder "app" marks (simple geometric shapes, 24×24) used where the original illustrations
// show third-party brand logos. Swap in your own logos through each illustration's props.
export type Mark = { name: string; color: string; d: string };
export const MARKS: Mark[] = [
	{ name: 'Orbit', color: '#2f6bff', d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z' },
	{ name: 'Prism', color: '#7c5cff', d: 'M12 2 22 20H2L12 2Z' },
	{ name: 'Stack', color: '#f06a6a', d: 'M3 4h18v4H3zM3 10h18v4H3zM3 16h18v4H3z' },
	{ name: 'Bloom', color: '#0f9d76', d: 'M12 2c3 3 3 7 0 10-3-3-3-7 0-10Zm0 20c-3-3-3-7 0-10 3 3 3 7 0 10ZM2 12c3-3 7-3 10 0-3 3-7 3-10 0Zm20 0c-3 3-7 3-10 0 3-3 7-3 10 0Z' },
	{ name: 'Wave', color: '#0ea5e9', d: 'M2 9c3-4 7-4 10 0s7 4 10 0v6c-3 4-7 4-10 0s-7-4-10 0V9Z' },
	{ name: 'Spark', color: '#f59e0b', d: 'M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8L12 1Z' },
	{ name: 'Grid', color: '#16a34a', d: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z' },
	{ name: 'Arc', color: '#db2777', d: 'M2 20a10 10 0 0 1 20 0h-5a5 5 0 0 0-10 0H2Z' },
	{ name: 'Hex', color: '#6366f1', d: 'M12 1.5 21 6.75v10.5L12 22.5 3 17.25V6.75L12 1.5Z' },
	{ name: 'Knot', color: '#e5484d', d: 'M7 3a4 4 0 0 1 4 4v3h2V7a4 4 0 1 1 4 4h-3v2h3a4 4 0 1 1-4 4v-3h-2v3a4 4 0 1 1-4-4h3v-2H7a4 4 0 0 1 0-8Z' },
	{ name: 'Drop', color: '#06b6d4', d: 'M12 2c4 5 7 8.5 7 12a7 7 0 0 1-14 0c0-3.5 3-7 7-12Z' },
	{ name: 'Block', color: '#171717', d: 'M4 4h16v16H4z' }
];
export const mark = (i: number) => MARKS[((i % MARKS.length) + MARKS.length) % MARKS.length];
/** The library's own mark (two shapes), in a 24×24 box */
export const OWN_MARK = 'M2 9a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Zm15-7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z';
