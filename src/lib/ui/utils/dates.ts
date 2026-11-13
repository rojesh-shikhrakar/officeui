// date helpers shared by Calendar / DatePicker / TimePicker
export type DateRange = { start: Date | null; end: Date | null };
export const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export function addD(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return sod(x); }
export const addM = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const same = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const fmtD = (d?: Date | null) => (d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
export const fmtT = (d?: Date | null) => (d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
