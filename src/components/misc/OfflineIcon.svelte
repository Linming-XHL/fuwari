<script lang="ts">
import { getIconBody, getIconSize } from "../misc/offline-icons";

interface Props {
	icon: string;
	class?: string;
}

const { icon, class: className = "" }: Props = $props();

const body = $derived(getIconBody(icon) ?? "");
const size = $derived(getIconSize(icon));
</script>

{#if body}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 {size.width} {size.height}"
		width="1em"
		height="1em"
		class={className}
		aria-hidden="true"
		data-icon={icon}
	>
		{@html body}
	</svg>
{/if}
