<!-- Task Detail – a task opened from a card: title, status, dates, a rich-text description, assets (PDF, image, link, audio, video) and the comment thread. Comments live only here. -->
<script lang="ts">
	import {
		PROJECTS,
		STATUSES,
		sanitizeHtml,
		type Asset,
		type AssetKind,
		type ProjectTask,
		type Status
	} from './projects';
	import '../agents/agents.css';
	let {
		task = $bindable(PROJECTS[0].tasks[0]),
		user = 'Alex',
		onclose
	}: { task?: ProjectTask; user?: string; onclose?: () => void } = $props();
	const KINDS: AssetKind[] = ['link', 'image', 'pdf', 'audio', 'video'];
	let editor = $state<HTMLDivElement>();
	let kind = $state<AssetKind>('link');
	let url = $state('');
	let name = $state('');
	let draft = $state('');
	let html = $state('');
	let loaded = '';
	// load the (sanitised) description when a different task is shown, then let the editor own it
	$effect(() => {
		if (task.id !== loaded) {
			loaded = task.id;
			html = sanitizeHtml(task.description);
		}
	});
	const save = () => {
		if (editor) task.description = sanitizeHtml(editor.innerHTML);
	};
	const fmt = (cmd: string, arg?: string) => (
		editor?.focus(),
		document.execCommand(cmd, false, arg),
		save()
	);
	const safeUrl = (u: string) => (/^(https?:\/\/|blob:)/i.test(u.trim()) ? u.trim() : '');
	function addAsset() {
		const u = safeUrl(url);
		if (!u) return;
		task.assets = [
			...task.assets,
			{ id: crypto.randomUUID(), kind, name: name.trim() || u, url: u }
		];
		url = name = '';
	}
	function upload(e: Event & { currentTarget: HTMLInputElement }) {
		for (const f of e.currentTarget.files ?? []) {
			const k: AssetKind = f.type.startsWith('image/')
				? 'image'
				: f.type.startsWith('audio/')
					? 'audio'
					: f.type.startsWith('video/')
						? 'video'
						: f.type === 'application/pdf'
							? 'pdf'
							: 'link';
			task.assets = [
				...task.assets,
				{ id: crypto.randomUUID(), kind: k, name: f.name, url: URL.createObjectURL(f) }
			];
		}
		e.currentTarget.value = '';
	}
	function comment() {
		if (!draft.trim()) return;
		task.comments = [
			...task.comments,
			{
				id: crypto.randomUUID(),
				author: user,
				body: draft.trim(),
				at: new Date().toISOString().slice(0, 10)
			}
		];
		draft = '';
	}
	const remove = (a: Asset) => (task.assets = task.assets.filter((x) => x.id !== a.id));
</script>

<aside class="ui-td ui-ag-in" aria-label="Task details">
	<header>
		<small class="ui-ag-muted">{task.id}</small><span class="ui-ag-grow"></span>
		<button
			class="ui-ag-btn"
			data-variant="ghost"
			aria-label="Close task"
			onclick={() => onclose?.()}>×</button
		>
	</header>
	<input class="ui-td__title" aria-label="Title" bind:value={task.title} />
	<div class="ui-td__meta">
		<label
			>Status <select
				class="ui-ag-input"
				value={task.status}
				onchange={(e) => (
					(task.status = e.currentTarget.value as Status),
					(task.doneAt = task.status === 'Done' ? (task.doneAt ?? task.end) : undefined)
				)}
				>{#each STATUSES as s (s)}<option>{s}</option>{/each}</select
			></label
		>
		<label>Assignee <input class="ui-ag-input" bind:value={task.assignee} /></label>
		<label>Start <input class="ui-ag-input" type="date" bind:value={task.start} /></label>
		<label>End <input class="ui-ag-input" type="date" bind:value={task.end} /></label>
	</div>

	<h3>Description</h3>
	<div class="ui-td__tools" role="toolbar" aria-label="Formatting">
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Bold" onclick={() => fmt('bold')}
			><b>B</b></button
		>
		<button class="ui-ag-btn" data-variant="ghost" aria-label="Italic" onclick={() => fmt('italic')}
			><i>I</i></button
		>
		<button
			class="ui-ag-btn"
			data-variant="ghost"
			aria-label="Bulleted list"
			onclick={() => fmt('insertUnorderedList')}>• List</button
		>
		<button
			class="ui-ag-btn"
			data-variant="ghost"
			aria-label="Numbered list"
			onclick={() => fmt('insertOrderedList')}>1. List</button
		>
		<button
			class="ui-ag-btn"
			data-variant="ghost"
			aria-label="Heading"
			onclick={() => fmt('formatBlock', 'H3')}>H</button
		>
		<button
			class="ui-ag-btn"
			data-variant="ghost"
			aria-label="Link"
			onclick={() => {
				const u = safeUrl(prompt('Link URL') ?? '');
				if (u) fmt('createLink', u);
			}}>Link</button
		>
	</div>
	<div
		class="ui-td__editor ui-ag-input"
		bind:this={editor}
		contenteditable="true"
		bind:innerHTML={html}
		role="textbox"
		tabindex="0"
		aria-multiline="true"
		aria-label="Description"
		oninput={save}
	></div>

	<h3>Assets <span class="ui-ag-muted">{task.assets.length}</span></h3>
	<div class="ui-td__assets">
		{#each task.assets as a (a.id)}
			<figure>
				{#if a.kind === 'image'}<img src={a.url} alt={a.name} />
				{:else if a.kind === 'audio'}<audio controls src={a.url}></audio>
				{:else if a.kind === 'video'}<!-- svelte-ignore a11y_media_has_caption --><video controls src={a.url}></video>
				{:else}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={a.url} target="_blank" rel="noopener noreferrer"
						>{a.kind === 'pdf' ? '▤ PDF' : '↗ Link'}</a
					>{/if}
				<figcaption>
					<span>{a.name}</span><button
						class="ui-ag-btn"
						data-variant="ghost"
						aria-label="Remove {a.name}"
						onclick={() => remove(a)}>×</button
					>
				</figcaption>
			</figure>
		{:else}<small class="ui-ag-muted">No assets yet.</small>{/each}
	</div>
	<div class="ui-td__add">
		<select class="ui-ag-input" aria-label="Asset type" bind:value={kind}
			>{#each KINDS as k (k)}<option>{k}</option>{/each}</select
		>
		<input class="ui-ag-input" placeholder="https://…" aria-label="Asset URL" bind:value={url} />
		<input
			class="ui-ag-input"
			placeholder="Name (optional)"
			aria-label="Asset name"
			bind:value={name}
		/>
		<button class="ui-ag-btn" onclick={addAsset}>Add</button>
		<label class="ui-ag-btn"
			>Upload<input
				type="file"
				accept="image/*,audio/*,video/*,application/pdf"
				multiple
				hidden
				onchange={upload}
			/></label
		>
	</div>

	<h3>Comments <span class="ui-ag-muted">{task.comments.length}</span></h3>
	<ul class="ui-td__comments">
		{#each task.comments as c (c.id)}<li>
				<b>{c.author}</b> <small class="ui-ag-muted">{c.at}</small>
				<p>{c.body}</p>
			</li>{:else}<li class="ui-ag-muted">No comments yet.</li>{/each}
	</ul>
	<form class="ui-td__add" onsubmit={(e) => (e.preventDefault(), comment())}>
		<input
			class="ui-ag-input ui-ag-grow"
			placeholder="Write a comment…"
			aria-label="Comment"
			bind:value={draft}
		/>
		<button class="ui-ag-btn" data-variant="primary" type="submit">Comment</button>
	</form>
</aside>

<style>
	.ui-td {
		display: grid;
		gap: 8px;
		align-content: start;
		padding: 12px;
		min-width: 0;
	}
	header {
		display: flex;
		align-items: center;
	}
	h3 {
		margin: 8px 0 0;
		font-size: 12px;
		font-weight: 500;
	}
	.ui-td__title {
		border: 0;
		background: none;
		font: inherit;
		font-size: 16px;
		font-weight: 500;
		color: var(--ag-ink);
		padding: 2px 0;
	}
	.ui-td__meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 8px;
	}
	.ui-td__meta label {
		display: grid;
		gap: 3px;
		color: var(--ag-muted);
	}
	.ui-td__tools {
		display: flex;
		gap: 2px;
		flex-wrap: wrap;
	}
	.ui-td__editor {
		min-height: 80px;
		display: block;
		overflow: auto;
	}
	.ui-td__editor :global(a) {
		color: var(--ag-blue);
	}
	.ui-td__assets {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 8px;
	}
	figure {
		margin: 0;
		display: grid;
		gap: 4px;
		padding: 6px;
		border-radius: 8px;
		background: var(--ag-fill);
		min-width: 0;
	}
	figure img,
	figure video,
	figure audio {
		width: 100%;
		max-height: 110px;
		object-fit: cover;
		border-radius: 6px;
	}
	figcaption {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	figcaption span {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ui-td__add {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.ui-td__comments {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.ui-td__comments p {
		margin: 2px 0 0;
		white-space: pre-wrap;
	}
</style>
