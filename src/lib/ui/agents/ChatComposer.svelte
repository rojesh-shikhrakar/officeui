<script lang="ts">
	import './agents.css';

	type Opt = { id: string; label: string; hint?: string };
	let {
		value = $bindable(''),
		placeholder = 'Help me brainstorm ideas for...',
		models = [
			{ id: 'auto', label: 'Auto', hint: 'Picks the best model for each step' },
			{ id: 'fable', label: 'Claude Fable 5.1', hint: 'Best for long tasks' },
			{ id: 'sol', label: 'GPT-6 Sol', hint: 'Fast and sharp' },
			{ id: 'gem', label: 'Gemini 3.8 Flash', hint: 'Cheap and quick' }
		],
		approvals = [
			{ id: 'ask', label: 'Request approval', hint: 'Ask before every action' },
			{ id: 'edits', label: 'Approve edits', hint: 'Ask only before changing files' },
			{ id: 'full', label: 'Full access', hint: 'Never ask' }
		],
		model = $bindable('auto'),
		approval = $bindable('ask'),
		footer = true,
		placement = 'top',
		onsend
	}: {
		value?: string;
		placeholder?: string;
		models?: Opt[];
		approvals?: Opt[];
		model?: string;
		approval?: string;
		footer?: boolean;
		placement?: 'top' | 'bottom';
		onsend?: (text: string) => void;
	} = $props();

	let open = $state<null | 'add' | 'approval' | 'model'>(null);
	let root: HTMLDivElement;
	const toggle = (m: 'add' | 'approval' | 'model') => (open = open === m ? null : m);
	const label = (list: Opt[], id: string) => list.find((o) => o.id === id)?.label ?? id;

	function send() {
		const v = value.trim();
		if (!v) return;
		onsend?.(v);
		value = '';
	}
	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<svelte:document
	onpointerdown={(e) => {
		if (open && root && !root.contains(e.target as Node)) open = null;
	}}
	onkeydown={(e) => e.key === 'Escape' && (open = null)}
/>

{#snippet menu(kind: 'approval' | 'model', title: string, list: Opt[], current: string, pick: (id: string) => void)}
	<div class="ui-ccc__menu" role="menu" aria-label={title} data-placement={placement}>
		<span class="ui-ccc__menu-title">{title}</span>
		{#each list as o (o.id)}
			<button role="menuitemradio" aria-checked={o.id === current} onclick={() => (pick(o.id), (open = null))}>
				<span><b>{o.label}</b>{#if o.hint}<small>{o.hint}</small>{/if}</span>
				{#if o.id === current}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-10" /></svg>{/if}
			</button>
		{/each}
	</div>
{/snippet}

<div class="ui-ag ui-ccc" bind:this={root}>
	<div class="ui-ccc__body">
		<textarea bind:value {placeholder} rows="2" aria-label="Message" onkeydown={keydown}></textarea>
		<div class="ui-ccc__row">
			<div class="ui-ccc__wrap">
				<button class="ui-ccc__icon" aria-label="Add" aria-expanded={open === 'add'} onclick={() => toggle('add')}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14" /></svg>
				</button>
				{#if open === 'add'}
					<div class="ui-ccc__menu" role="menu" aria-label="Add" data-placement={placement}>
						{#each ['Upload a file', 'Add a photo', 'Take a screenshot', 'Add from a folder'] as a (a)}
							<button role="menuitem" onclick={() => (open = null)}><span><b>{a}</b></span></button>
						{/each}
					</div>
				{/if}
			</div>
			<div class="ui-ccc__wrap">
				<button class="ui-ccc__chip" aria-expanded={open === 'approval'} onclick={() => toggle('approval')}>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
						><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3.2 15a1.5 1.5 0 0 1 2.4-1.8L8 15" /></svg
					>
					{label(approvals, approval)}
				</button>
				{#if open === 'approval'}{@render menu('approval', 'How should actions be approved?', approvals, approval, (id) => (approval = id))}{/if}
			</div>
			<span class="ui-ccc__grow"></span>
			<div class="ui-ccc__wrap">
				<button class="ui-ccc__chip ui-ccc__chip--plain" aria-expanded={open === 'model'} onclick={() => toggle('model')}>
					{label(models, model)}
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
				</button>
				{#if open === 'model'}{@render menu('model', 'Model', models, model, (id) => (model = id))}{/if}
			</div>
			<button class="ui-ccc__icon" aria-label="Dictate">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 8a7 7 0 0 0 14 0M12 18v3" /></svg>
			</button>
			<button class="ui-ccc__send" aria-label="Send" disabled={!value.trim()} onclick={send}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
			</button>
		</div>
	</div>
	{#if footer}
		<div class="ui-ccc__foot">
			<span class="ui-ccc__folder"><i></i>Work in a folder</span>
			<span class="ui-ccc__apps">Connect apps <i style:background="#ea4335"></i><i style:background="#36c5f0"></i><i style:background="#f06a6a"></i></span>
		</div>
	{/if}
</div>

<style>
	.ui-ccc {
		width: 100%;
		max-width: 470px;
		background: var(--ag-fill);
		border-radius: 14px;
		box-shadow: 0 0 0 0.5px var(--ag-line);
	}
	.ui-ccc__body {
		background: var(--ag-surface);
		border-radius: 14px;
		box-shadow: var(--ag-shadow);
		padding: 10px 10px 8px;
		transition: box-shadow 0.2s var(--ag-ease);
	}
	.ui-ccc__body:focus-within {
		box-shadow:
			var(--ag-shadow),
			0 0 0 3px color-mix(in srgb, var(--ag-blue) 14%, transparent);
	}
	textarea {
		display: block;
		width: 100%;
		border: 0;
		outline: none;
		resize: none;
		background: none;
		font: inherit;
		font-size: 12.5px;
		color: var(--ag-ink);
		padding: 0 2px;
		min-height: 34px;
	}
	textarea::placeholder {
		color: var(--ag-subtle);
	}
	.ui-ccc__row {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ui-ccc__grow {
		flex: 1;
	}
	.ui-ccc__wrap {
		position: relative;
	}
	.ui-ccc__icon,
	.ui-ccc__chip,
	.ui-ccc__send {
		border: 0;
		background: none;
		font: inherit;
		color: var(--ag-muted);
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 26px;
		border-radius: 999px;
		cursor: pointer;
		transition: background-color 0.15s, color 0.15s, transform 0.15s var(--ag-ease);
	}
	.ui-ccc__icon {
		width: 26px;
		justify-content: center;
	}
	.ui-ccc__chip {
		padding: 0 8px;
		font-size: 12px;
	}
	.ui-ccc__icon:hover,
	.ui-ccc__chip:hover,
	.ui-ccc__chip[aria-expanded='true'],
	.ui-ccc__icon[aria-expanded='true'] {
		background: var(--ag-fill);
		color: var(--ag-ink);
	}
	.ui-ccc__chip--plain {
		color: var(--ag-ink);
	}
	.ui-ccc__send {
		width: 24px;
		justify-content: center;
		background: var(--ag-fill);
		color: var(--ag-subtle);
	}
	.ui-ccc__send:not(:disabled) {
		background: var(--aui-primary, #171717);
		color: var(--aui-on-primary, #fafafa);
	}
	.ui-ccc__send:active:not(:disabled) {
		transform: scale(0.94);
	}
	.ui-ccc__foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 12px 7px;
		font-size: 11px;
		color: var(--ag-muted);
	}
	.ui-ccc__folder,
	.ui-ccc__apps {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.ui-ccc__folder i {
		width: 12px;
		height: 9px;
		border-radius: 2px;
		background: linear-gradient(#5ac8fa, #2f8cf0);
	}
	.ui-ccc__apps i {
		width: 9px;
		height: 9px;
		border-radius: 3px;
	}
	.ui-ccc__menu {
		position: absolute;
		left: 0;
		bottom: calc(100% + 6px);
		z-index: 10;
		min-width: 230px;
		padding: 4px;
		display: grid;
		gap: 1px;
		background: var(--ag-surface);
		border-radius: 12px;
		box-shadow:
			0 0 0 0.5px var(--ag-line),
			0 8px 28px -8px rgba(0, 0, 0, 0.18),
			0 2px 6px rgba(0, 0, 0, 0.05);
		animation: ui-ccc-pop 0.18s var(--ag-ease) both;
		transform-origin: bottom left;
	}
	.ui-ccc__menu[data-placement='bottom'] {
		bottom: auto;
		top: calc(100% + 6px);
		transform-origin: top left;
	}
	.ui-ccc__wrap:nth-last-child(3) .ui-ccc__menu {
		left: auto;
		right: 0;
	}
	.ui-ccc__menu-title {
		font-size: 11px;
		color: var(--ag-subtle);
		padding: 4px 8px 4px;
	}
	.ui-ccc__menu button {
		border: 0;
		background: none;
		font: inherit;
		text-align: left;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 6px 8px;
		border-radius: 8px;
		cursor: pointer;
		color: var(--ag-ink);
	}
	.ui-ccc__menu button:hover,
	.ui-ccc__menu button:focus-visible {
		background: var(--ag-fill);
		outline: none;
	}
	.ui-ccc__menu b {
		font-weight: 500;
		font-size: 12.5px;
		display: block;
	}
	.ui-ccc__menu small {
		color: var(--ag-muted);
		font-size: 11px;
	}
	@keyframes ui-ccc-pop {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.98);
		}
	}
</style>
