<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import Carousel from './Carousel.svelte';

	const { Story } = defineMeta({
		title: 'Components/Display/Carousel',
		component: Carousel,
		tags: ['autodocs'],
		args: { label: 'Release highlights', perView: 1, loop: false, controls: 'overlay', dots: true },
		argTypes: { controls: { control: 'inline-radio', options: ['overlay', 'below', 'none'] } }
	});
	const onchange = fn();
</script>

{#snippet a()}<div style="padding:48px;text-align:center">Release 2.14 shipped</div>{/snippet}
{#snippet b()}<div style="padding:48px;text-align:center">312 checks passed</div>{/snippet}
{#snippet c()}<div style="padding:48px;text-align:center">Approve release</div>{/snippet}

<Story name="Default">{#snippet template(args)}<Carousel {...args} slides={[a, b, c]} />{/snippet}</Story>
<Story name="Looping, controls below" args={{ loop: true, controls: 'below' }}>{#snippet template(args)}<Carousel {...args} slides={[a, b]} />{/snippet}</Story>
<Story name="Two per view" args={{ perView: 2, dots: false }}>{#snippet template(args)}<Carousel {...args} slides={[a, b, c, a]} />{/snippet}</Story>
<Story
	name="Navigates"
	args={{ onchange }}
	play={async ({ canvasElement }) => {
		const c = within(canvasElement);
		await expect(c.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
		await userEvent.click(c.getByRole('button', { name: 'Next slide' }));
		await expect(onchange).toHaveBeenLastCalledWith(1);
		c.getByRole('region', { name: 'Release highlights' }).focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(c.getByRole('button', { name: 'Next slide' })).toBeDisabled();
	}}
>
	{#snippet template(args)}<Carousel {...args} slides={[a, b, c]} />{/snippet}
</Story>
