<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
    import ThreadWeave from "./ThreadWeave.svelte";
    
    export let config;
    export let tabletIndex;
    
    let final = {
		color: '#ffffff',
		sDirection: true
	};
</script>

<div class="tablet weaveSize{$appConfig.weaveSize}">
	{#each config.weaves as weave, index (index)}
		<ThreadWeave weave={weave} tabletIndex={tabletIndex} weaveRow={index} />
	{/each}
	<ThreadWeave tabletIndex={tabletIndex} weaveRow={config.weaves.length} weave={final} classNames="final"/>
</div>

<style>
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
</style>
