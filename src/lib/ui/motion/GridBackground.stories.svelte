<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import GridBackground from './GridBackground.svelte';

	const { Story } = defineMeta({
		title: 'Motion/Grid Background',
		component: GridBackground,
		tags: ['autodocs'],
		args: { size: 48, speed: 3, direction: 'diagonal', reveal: true, fade: 70, class: 'sb-wide' },
		argTypes: { direction: { control: 'select', options: ['up', 'down', 'left', 'right', 'diagonal'] } }
	});
</script>

<Story name="Default" play={async ({ canvasElement }) => expect(within(canvasElement).getByText(/drifting grid/)).toBeInTheDocument()} />
<Story name="Small cells" args={{ size: 20, speed: 1.5 }} />
<Story name="Still" args={{ speed: 0, reveal: false }} />
<Story name="Tinted" args={{ color: 'rgba(0, 96, 226, 0.14)', direction: 'up' }} />
<Story name="With content" asChild>
	<GridBackground class="sb-wide">
		<div style="padding: 72px 24px; text-align: center; font: 13px/1.5 Inter, sans-serif">
			<h2 style="margin: 0 0 8px; font-size: 28px; font-weight: 500; letter-spacing: -0.7px">Agents first</h2>
			<p style="margin: 0; color: #737373">A hero section sitting on the grid</p>
		</div>
	</GridBackground>
</Story>
