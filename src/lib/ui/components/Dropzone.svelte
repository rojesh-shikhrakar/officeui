<!-- Dropzone – drag files in (or browse) and watch them upload: colored type badges, progress with time left, too-large errors with remove. -->
<script lang="ts" module>
	export type UploadFile = { id: string; name: string; size: number; loaded: number; error?: string; failAt?: number };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { play } from '../agents/script';
	import '../agents/agents.css';
	let {
		files = $bindable([] as UploadFile[]),
		/** The demo: four files are dragged in; one connection drops, one file is too big */
		autoplay = true,
		maxMb = 25,
		accept = 'PDF, PNG, JPG and more'
	}: { files?: UploadFile[]; maxMb?: number; accept?: string; autoplay?: boolean } = $props();
	const demo: UploadFile[] = [
		{ id: '1', name: 'Q3-Board-Report.pdf', size: 4.2, loaded: 0 },
		{ id: '2', name: 'Hero-Shot.png', size: 2.6, loaded: 0 },
		{ id: '3', name: 'Budget-2027.xlsx', size: 1.3, loaded: 0, failAt: 0.7 },
		{ id: '4', name: 'Product-Demo.mp4', size: 48, loaded: 0, error: 'Too large – max 25 MB' }
	];
	const retry = (id: string) => (files = files.map((f) => (f.id === id ? { ...f, error: undefined, failAt: undefined } : f)));
	let over = $state(false);
	let input: HTMLInputElement;
	const color = (n: string) => ({ pdf: '#e5484d', png: '#7c5cff', jpg: '#7c5cff', xlsx: '#16a34a', mp4: '#f59e0b' })[n.split('.').pop()!.toLowerCase()] ?? '#737373';
	function add(list: FileList | null) {
		if (!list) return;
		files = [...files, ...[...list].map((f) => ({ id: crypto.randomUUID(), name: f.name, size: +(f.size / 1e6).toFixed(1) || 0.1, loaded: 0, error: f.size / 1e6 > maxMb ? `Too large – max ${maxMb} MB` : undefined }))];
	}
	onMount(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const p = play([[900, () => (over = true)], [1300, () => ((over = false), (files = demo.map((f) => ({ ...f }))))]], { autoplay, still: 0 });
		if (reduce && autoplay) files = demo.map((f) => ({ ...f, loaded: f.error ? 0 : f.failAt ? f.size * f.failAt : f.size * 0.6, error: f.error ?? (f.failAt ? 'Connection lost' : undefined) }));
		const t = setInterval(() => {
			if (reduce) return;
			files = files.map((f) => {
				if (f.error || f.loaded >= f.size) return f;
				const loaded = Math.min(f.size, +(f.loaded + f.size * 0.06).toFixed(2));
				return f.failAt && loaded >= f.size * f.failAt ? { ...f, loaded, error: 'Connection lost' } : { ...f, loaded };
			});
		}, 300);
		return () => (p(), clearInterval(t));
	});
	const active = $derived(files.filter((f) => !f.error));
	// Uploaded counts files that finished, failed ones excluded
	const done = $derived(active.filter((f) => f.loaded >= f.size).length);
	const loaded = $derived(active.reduce((s, f) => s + f.loaded, 0));
	const total = $derived(active.reduce((s, f) => s + f.size, 0));
</script>

<div class="ui-ag ui-ag-panel ui-drz">
	<button class="ui-drz__zone" data-over={over || undefined} ondragover={(e) => (e.preventDefault(), (over = true))} ondragleave={() => (over = false)} ondrop={(e) => (e.preventDefault(), (over = false), add(e.dataTransfer?.files ?? null))} onclick={() => input.click()}>
		<span class="ui-drz__fan"><i style:--r="-12deg" style:background="#fde2e2"></i><i style:--r="12deg" style:background="#e6e0ff"></i><i style:--r="0deg">⇪</i></span>
		<b>{over ? 'Release to upload 4 files' : ''}{#if !over}Drop files here or <u>browse</u>{/if}</b><small>{accept} · up to {maxMb} MB each</small>
	</button>
	<input bind:this={input} type="file" multiple hidden onchange={(e) => add(e.currentTarget.files)} />
	<ul class="ui-ag-list ui-drz__list">
		{#each files as f (f.id)}
			<li class="ui-drz__file ui-ag-in">
				<span class="ui-drz__badge" style:background={color(f.name)}>{f.name.split('.').pop()}</span>
				<span class="ui-ag-grow"><b>{f.name}</b>
					{#if f.error}<small style:color="var(--ag-red)">{f.error}</small>{#if f.error === 'Connection lost'}<span class="ui-ag-bar ui-drz__bad"><i style:width="{(f.loaded / f.size) * 100}%"></i></span>{/if}{:else if f.loaded >= f.size}<small>{f.size} MB · Uploaded</small>{:else}<small>{f.loaded.toFixed(1)} of {f.size} MB · {Math.max(1, Math.ceil((f.size - f.loaded) / (f.size * 0.2)))}s left</small>{/if}
					{#if !f.error}<span class="ui-ag-bar"><i style:width="{(f.loaded / f.size) * 100}%" style:background={f.loaded >= f.size ? 'var(--ag-green)' : undefined}></i></span>{/if}
				</span>
				{#if f.error === 'Connection lost'}<button class="ui-ag-btn" data-variant="ghost" aria-label="Retry {f.name}" onclick={() => retry(f.id)}>↻</button>{/if}
				<button class="ui-ag-btn" data-variant="ghost" aria-label="Remove {f.name}" onclick={() => (files = files.filter((x) => x.id !== f.id))}>×</button>
			</li>
		{/each}
	</ul>
	<div class="ui-ag-foot" style:justify-content="flex-start">{#if !files.length}<small class="ui-ag-muted">No files yet</small>{:else if active.every((f) => f.loaded >= f.size)}<small class="ui-ag-muted">{files.some((f) => f.error) ? `◔ ${done} of ${files.length} uploaded` : `All ${done} uploaded · ${loaded.toFixed(1)} of ${total.toFixed(1)} MB`}</small><span class="ui-ag-grow"></span>{#if files.some((f) => f.error)}<button class="ui-ag-btn" data-variant="ghost" onclick={() => (files = files.filter((f) => !f.error))}>Clear failed</button>{/if}{:else}<small class="ui-ag-muted">Uploading {Math.min(done + 1, active.length)} of {active.length} · {loaded.toFixed(1)} of {total.toFixed(1)} MB</small>{/if}</div>
</div>

<style>
	.ui-drz__bad i {
		background: var(--ag-red) !important;
	}
	.ui-drz__fan i {
		animation: ui-drz-bob 2.4s ease-in-out infinite;
	}
	@keyframes ui-drz-bob {
		50% {
			translate: 0 -2px;
		}
	}
	.ui-drz__zone[data-over] {
		background: color-mix(in srgb, var(--ag-blue) 6%, transparent);
		outline: 1.5px dashed color-mix(in srgb, var(--ag-blue) 50%, transparent);
	}
	.ui-drz {
		max-width: 370px;
		font-size: 12px;
	}
	.ui-drz__zone {
		display: grid;
		justify-items: center;
		gap: 3px;
		margin: 6px;
		width: calc(100% - 12px);
		padding: 18px 10px;
		border: 1.2px dashed var(--ag-line);
		border-radius: 10px;
		background: none;
		font: inherit;
		color: var(--ag-ink);
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}
	.ui-drz__zone[data-over] {
		background: color-mix(in srgb, var(--ag-blue) 6%, transparent);
		border-color: var(--ag-blue);
	}
	.ui-drz__zone b {
		font-weight: 500;
	}
	.ui-drz__zone u {
		color: var(--ag-blue);
		text-decoration: none;
	}
	.ui-drz__zone small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	.ui-drz__fan {
		position: relative;
		width: 40px;
		height: 30px;
		margin-bottom: 4px;
	}
	.ui-drz__fan i {
		position: absolute;
		inset: 0 8px;
		border-radius: 4px;
		background: var(--ag-surface);
		box-shadow: var(--ag-shadow);
		transform: rotate(var(--r));
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 11px;
		transition: transform 0.3s var(--ag-ease);
	}
	.ui-drz__zone:hover .ui-drz__fan i:nth-child(1) {
		transform: rotate(-22deg) translateX(-4px);
	}
	.ui-drz__zone:hover .ui-drz__fan i:nth-child(2) {
		transform: rotate(22deg) translateX(4px);
	}
	.ui-drz__list {
		padding: 0 8px 6px;
	}
	.ui-drz__file {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 6px;
	}
	.ui-drz__file + .ui-drz__file {
		border-top: 1px solid var(--ag-line);
	}
	.ui-drz__badge {
		width: 22px;
		height: 26px;
		border-radius: 4px;
		color: #fff;
		font-size: 7px;
		font-weight: 600;
		text-transform: uppercase;
		display: grid;
		place-items: end center;
		padding-bottom: 3px;
		flex: none;
	}
	.ui-ag-grow b {
		display: block;
		font-weight: 500;
	}
	.ui-ag-grow small {
		display: block;
		color: var(--ag-muted);
		font-size: 11px;
		margin-bottom: 3px;
	}
</style>
