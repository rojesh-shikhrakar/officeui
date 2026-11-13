<!-- FileUploader – A real file input as a drop target (click, keyboard or drag), size limit, and a status list (ready / uploading / done / error). Unlike Dropzone, it holds no demo: you drive the statuses. -->
<script lang="ts" module>
	export type FileItem = { id: string; name: string; size?: number; status?: 'ready' | 'uploading' | 'done' | 'error'; progress?: number; error?: string };
	const fmtSize = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(b < 10240 ? 1 : 0) + ' KB' : (b / 1048576).toFixed(1) + ' MB');
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import FieldBox from './FieldBox.svelte';
	import './file-uploader.css';

	type Props = {
		id?: string;
		files?: FileItem[];
		label?: string;
		title?: string;
		buttonLabel?: string;
		hint?: string;
		error?: string;
		accept?: string;
		multiple?: boolean;
		/** Bytes */
		maxSize?: number;
		disabled?: boolean;
		compact?: boolean;
		class?: string;
		onfilesadded?: (f: File[]) => void;
		onremove?: (id: string) => void;
	};
	let { id, files = $bindable([]), label, title, buttonLabel, hint, error, accept, multiple = false, maxSize, disabled = false, compact = false, class: cls, onfilesadded, onremove }: Props = $props();
	const uid = $props.id();
	const fid = $derived(id ?? uid);
	let drag = $state(false);
	let err: string | null = $state(null);
	const shown = $derived(error || err || undefined);

	function add(list: FileList | File[]) {
		let ok: File[] = [];
		const bad: string[] = [];
		for (const f of list) {
			if (maxSize && f.size > maxSize) bad.push(`${f.name} is larger than ${fmtSize(maxSize)}.`);
			else ok.push(f);
		}
		err = bad.length ? bad.join(' ') : null;
		if (!ok.length) return;
		if (!multiple) ok = ok.slice(0, 1);
		files = (multiple ? files : []).concat(ok.map((f, i) => ({ id: `${f.name}-${Date.now()}-${i}`, name: f.name, size: f.size, status: 'ready' as const })));
		onfilesadded?.(ok);
	}
	function remove(f: FileItem) {
		files = files.filter((x) => x.id !== f.id);
		onremove?.(f.id);
	}
</script>

<FieldBox id={fid} {label} hint={shown ? undefined : hint} error={shown} class={cls}>
	<label
		for={fid}
		class={['ui-upl', drag && 'is-drag', disabled && 'is-disabled', compact && 'ui-upl--compact', shown && 'is-error']}
		ondragover={(e) => { e.preventDefault(); if (!disabled) drag = true; }}
		ondragleave={() => (drag = false)}
		ondrop={(e) => { e.preventDefault(); drag = false; if (!disabled && e.dataTransfer) add(e.dataTransfer.files); }}>
		<input id={fid} type="file" class="ui-upl__input" {accept} {multiple} {disabled} aria-describedby={shown || hint ? `${fid}-n` : undefined} onchange={(e) => { if (e.currentTarget.files) add(e.currentTarget.files); e.currentTarget.value = ''; }} />
		<span class="ui-upl__ic"><Icon name="upload" size={20} /></span>
		<span class="ui-upl__text"><b>{drag ? 'Release to add files' : title || 'Drag files here'}</b>{#if !drag}<span>{' or '}<span class="ui-upl__link">{buttonLabel || 'choose from your computer'}</span></span>{/if}</span>
	</label>
	{#if files.length > 0}
		<ul class="ui-upl__list" aria-label="Selected files">
			{#each files as f (f.id)}
				{@const st = f.status || 'ready'}
				{@const word = st === 'uploading' ? `Uploading ${Math.round(f.progress || 0)}%` : st === 'done' ? 'Uploaded' : st === 'error' ? 'Failed' : 'Ready'}
				<li class={['ui-upl__row', `is-${st}`]}>
					<span class="ui-upl__rowic"><Icon name={st === 'error' ? 'alert' : st === 'done' ? 'circle-check' : 'file'} size={16} /></span>
					<span class="ui-upl__main">
						<span class="ui-upl__name">{f.name}</span>
						<span class="ui-upl__sub">{fmtSize(f.size || 0)}{' · '}{word}{st === 'error' && f.error ? ': ' + f.error : ''}</span>
						{#if st === 'uploading'}<span class="ui-upl__bar" role="progressbar" aria-label="Uploading {f.name}" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(f.progress || 0)}><span style="width: {f.progress || 0}%"></span></span>{/if}
					</span>
					<button type="button" class="ui-upl__x" aria-label="Remove {f.name}" onclick={() => remove(f)}><Icon name="x" size={14} /></button>
				</li>
			{/each}
		</ul>
	{/if}
</FieldBox>
