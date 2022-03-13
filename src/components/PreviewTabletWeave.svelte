<script lang="ts">
	import { appConfig } from '../stores/appConfig';
	import { Weave } from '../model/Weave';
    import PreviewThreadWeave from './PreviewThreadWeave.svelte';
    
    export let weaves: Weave[];
    export let tabletIndex: number;
    
    const finalWeave = new Weave('#ffffff', true);
</script>

<div class="tablet weaveSize{$appConfig.weaveSize}">
	{#each weaves as weave, index (index)}
		<PreviewThreadWeave weave={weave} tabletIndex={tabletIndex} weaveRow={index} />
	{/each}
	<PreviewThreadWeave tabletIndex={tabletIndex} weaveRow={weaves.length} weave={finalWeave} classNames="final"/>
</div>

<style>
	@media all {
		.tablet {
			float: left;
		}
		.tablet.weaveSize1 {
			width: 8px;
		}
		.tablet.weaveSize2 {
			width: 11px;
		}
		.tablet.weaveSize3 {
			width: 14px;
		}
	}
</style>
