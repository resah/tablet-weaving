<script lang="ts">
	import type { Weave } from '../model/Weave';
    import PreviewThreadWeave from './PreviewThreadWeave.svelte';
    
    export let weaves: Weave[];
    export let tabletIndex: number;
</script>

<g id="tablet-{tabletIndex}" class="tablet">
	{#each weaves as weave, index (index)}
		<PreviewThreadWeave weave={weave} tabletIndex={tabletIndex} weaveRow={index} />
	{/each}
</g>
