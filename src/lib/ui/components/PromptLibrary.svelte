<!-- Prompt Library – saved prompt templates with fill-in blanks: pick one, fill its variables inline, watch the preview, then copy or use it. -->
<script lang="ts" module>
	export type Template = { name: string; tag: string; tone: string; body: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../agents/script';
	import '../agents/agents.css';
	let {
		templates = [
			{ name: 'Summarize a meeting', tag: 'Notes', tone: 'blue', body: 'Summarize this {meeting} in {length} bullet points, then list decisions and owners.' },
			{ name: 'Write release notes', tag: 'Product', tone: 'purple', body: 'Write release notes for {product} {version} for {audience}. Keep the tone friendly and group the changes into New, Improved and Fixed.' },
			{ name: 'Explain an error', tag: 'Debug', tone: 'amber', body: 'Explain this {language} error in plain words and suggest the smallest fix: {error}' },
			{ name: 'Draft a cold email', tag: 'Sales', tone: 'green', body: 'Draft a short cold email to {name} at {company} about {offer}. Under 90 words.' }
		] as Template[],
		onuse
	}: { templates?: Template[]; onuse?: (prompt: string) => void } = $props();
	let q = $state('');
	let sel = $state(1);
	let vals = $state<Record<string, string>>({});
	// The demo fills the blanks letter by letter, then opens another template
	const typeIn = (v: string, text: string) => Array.from(text, (_, k) => [90, () => (vals[`1:${v}`] = text.slice(0, k + 1))] as [number, () => void]);
	onMount(() => play([[900, () => {}], ...typeIn('product', 'Relay'), [300, () => {}], ...typeIn('version', '2.4'), [300, () => {}], ...typeIn('audience', 'admins'), [1800, () => (sel = 2)]], { still: 0 }));
	let copied = $state(false);
	const shown = $derived(templates.map((t, i) => ({ t, i })).filter(({ t }) => (t.name + t.tag).toLowerCase().includes(q.toLowerCase())));
	const t = $derived(templates[sel]);
	const parts = $derived(t.body.split(/(\{\w+\})/).filter(Boolean));
	const vars = $derived(parts.filter((p) => /^\{\w+\}$/.test(p)).map((p) => p.slice(1, -1)));
	const key = (v: string) => `${sel}:${v}`;
	const filled = $derived(vars.filter((v) => vals[key(v)]?.trim()).length);
	const out = $derived(parts.map((p) => (/^\{\w+\}$/.test(p) ? vals[key(p.slice(1, -1))] || p : p)).join(''));
	async function copy() {
		await navigator.clipboard?.writeText(out).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<div class="ui-ag ui-ag-panel ui-pl">
	<div class="ui-pl__cols">
		<aside>
			<b>Prompts <span class="ui-ag-muted">{templates.length}</span></b>
			<input class="ui-ag-input" bind:value={q} placeholder="⌕  Search templates" aria-label="Search templates" />
			<div role="listbox" aria-label="Templates">
				{#each shown as { t: x, i } (i)}<div role="option" tabindex="0" aria-selected={sel === i} class="ui-pl__item" onclick={() => (sel = i)} onkeydown={(e) => e.key === 'Enter' && (sel = i)}>{x.name}<span class="ui-ag-pill" data-tone={x.tone}>{x.tag}</span></div>{/each}
			</div>
		</aside>
		<section>
			<div class="ui-ag-row"><b class="ui-ag-grow">{t.name}</b><span class="ui-ag-pill" data-tone={t.tone}>{t.tag}</span><small class="ui-ag-muted">{#each vars as v (v)}<i class="ui-pl__dot" data-on={!!vals[key(v)]?.trim() || undefined}></i>{/each} {filled} of {vars.length} filled</small></div>
			<p class="ui-pl__tpl">
				{#each parts as p, j (j)}{#if /^\{\w+\}$/.test(p)}<input class="ui-pl__var" placeholder={p.slice(1, -1)} aria-label={p.slice(1, -1)} bind:value={vals[key(p.slice(1, -1))]} style:width="{Math.max(p.length - 2, (vals[key(p.slice(1, -1))] ?? '').length) + 2}ch" />{:else}{p}{/if}{/each}
			</p>
			<small class="ui-pl__h">Preview</small>
			<div class="ui-pl__prev">{#each parts as p, j (j)}{#if /^\{\w+\}$/.test(p)}{#if vals[key(p.slice(1, -1))]}<mark>{vals[key(p.slice(1, -1))]}</mark>{:else}<span class="ui-ag-muted">{p}</span>{/if}{:else}{p}{/if}{/each}</div>
		</section>
	</div>
	<div class="ui-ag-foot"><small class="ui-ag-grow ui-ag-muted">~{Math.ceil(out.length / 4)} tokens</small><button class="ui-ag-btn" onclick={copy}>{copied ? '✓ Copied' : '⧉ Copy'}</button><button class="ui-ag-btn" data-variant="primary" disabled={filled < vars.length} onclick={() => onuse?.(out)}>Use prompt →</button></div>
</div>

<style>
	.ui-pl {
		max-width: 500px;
		font-size: 12px;
	}
	.ui-pl__cols {
		display: grid;
		grid-template-columns: 190px 1fr;
	}
	aside {
		border-right: 1px solid var(--ag-line);
		padding: 12px 8px;
		display: grid;
		gap: 8px;
		align-content: start;
	}
	aside > b {
		padding: 0 4px;
		font-weight: 500;
	}
	.ui-pl__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px;
		border-radius: 7px;
		cursor: pointer;
		color: var(--ag-muted);
	}
	.ui-pl__item[aria-selected='true'] {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
	section {
		padding: 12px;
		display: grid;
		gap: 8px;
		align-content: start;
	}
	section b {
		font-weight: 500;
	}
	.ui-pl__dot {
		display: inline-block;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--ag-line);
		margin-right: 2px;
	}
	.ui-pl__dot[data-on] {
		background: var(--ag-blue);
	}
	.ui-pl__tpl {
		margin: 0;
		line-height: 2;
	}
	.ui-pl__var {
		border: 0;
		border-radius: 5px;
		background: var(--ag-fill);
		font: inherit;
		color: var(--ag-blue);
		padding: 1px 4px;
		outline: none;
	}
	.ui-pl__var:focus {
		box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--ag-blue) 45%, transparent);
	}
	.ui-pl__h {
		font-size: 9.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ag-subtle);
	}
	.ui-pl__prev {
		background: var(--ag-fill);
		border-radius: 8px;
		padding: 8px 10px;
		color: var(--ag-muted);
		line-height: 1.6;
	}
	mark {
		background: color-mix(in srgb, var(--ag-blue) 15%, transparent);
		color: var(--ag-ink);
		border-radius: 3px;
	}
</style>
